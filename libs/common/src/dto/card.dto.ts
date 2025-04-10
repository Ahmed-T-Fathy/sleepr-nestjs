import { IsNotEmpty, IsString } from 'class-validator';

export class CardDto {
  @IsNotEmpty()
  @IsString()
  cvc: string;

  @IsNotEmpty()
  @IsString()
  exp_month: string;

  @IsNotEmpty()
  @IsString()
  exp_year: string;

  @IsNotEmpty()
  @IsString()
  number: string;
}
