import { IsOptional, IsString } from 'class-validator'

export class TransactionRequestDto {
  @IsString()
  transaction: string

  @IsOptional()
  @IsString()
  network?: 'mainnet' | 'testnet'
}

export class TransactionPostParamsDto {
  @IsOptional()
  @IsString()
  network?: 'mainnet' | 'testnet'
}

export class TransactionPostDto {
  @IsString()
  transaction: string
}
