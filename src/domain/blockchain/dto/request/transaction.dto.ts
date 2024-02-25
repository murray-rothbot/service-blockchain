import { IsString } from 'class-validator'

export class TransactionRequestDto {
  @IsString()
  transaction: string
}

export class TransactionPostRequestDto {
  @IsString()
  txHex: string
}
