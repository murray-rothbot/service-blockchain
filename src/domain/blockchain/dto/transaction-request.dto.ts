import { IsString } from 'class-validator'

export class TransactionRequestDto {
  @IsString()
  transaction: string
}
