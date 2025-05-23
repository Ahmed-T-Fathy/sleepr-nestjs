import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { NOTIFICATIONS_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from '../dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe = new Stripe(
    this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    {
      apiVersion: '2025-03-31.basil',
    },
  );
  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  async crearteCharge({ card, amount, email }: PaymentsCreateChargeDto) {
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

      this.notificationsService.emit('notify_email', {
        email,
        subject: 'Payment Confirmation',
        body: `Your payment of $${amount} was successful!`,
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
