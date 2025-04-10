import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './models/reservation.repository';
import mongoose from 'mongoose';
import { PAYMENTS_SERVICE, UserDTO } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, map } from 'rxjs';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsClient: ClientProxy,
  ) {}
  async create(
    createReservationDto: CreateReservationDto,
    { email, _id: userId }: UserDTO,
  ) {
    try {
      return this.paymentsClient
        .send('create-charge', { ...createReservationDto.charge, email })
        .pipe(
          map((res) => {
            return this.reservationsRepository.create({
              ...createReservationDto,
              invoiceId: res.id,
              timestamp: new Date(),
              userId: userId,
            });
          }),
          catchError((error) => {
            console.error(`Error creating charge: ${error.message}`);
            throw new InternalServerErrorException(
              'Payment processing failed. Please try again.',
            );
          }),
        ); // Return the observable
    } catch (error) {
      console.error(`Error creating reservation: ${error.message}`);
      throw new InternalServerErrorException('Failed to create reservation');
    }
  }

  async findAll() {
    return await this.reservationsRepository.find({});
  }

  async findOne(_id: string) {
    return await this.reservationsRepository.findOne({
      _id: new mongoose.Types.ObjectId(_id),
    });
  }

  async update(_id: string, updateReservationDto: UpdateReservationDto) {
    return await this.reservationsRepository.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(_id),
      },
      { $set: updateReservationDto },
    );
  }

  async remove(_id: string) {
    return await this.reservationsRepository.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(_id),
    });
  }
}
