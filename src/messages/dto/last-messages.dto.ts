import { IsNumber } from 'class-validator';

export class LastMessagesDto {
  @IsNumber()
  readonly amount: number;

  @IsNumber()
  readonly offset: number;
}
