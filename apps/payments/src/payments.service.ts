import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateChargeDto } from '@app/common';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe = new Stripe(
    this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    {
      apiVersion: '2025-03-31.basil',
    },
  );
  constructor(private readonly configService: ConfigService) {}

  async crearteCharge({ card, amount }: CreateChargeDto) {
    console.log(`****************data************`);
    console.log(card);
    console.log(amount);
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: 'tok_visa', // Use a test token instead of raw card data
        },
      });

      // Then create the PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        payment_method: paymentMethod.id, // Attach the payment method
        confirm: true,
        payment_method_types: ['card'],
      });

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error(`Error creating charge: ${error.message}`);
      throw new ConflictException(
        'Payment processing failed. Please try again.',
      );
    }
  }
}
