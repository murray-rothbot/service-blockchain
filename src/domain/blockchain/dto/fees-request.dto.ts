import { IsOptional, IsString } from 'class-validator'

export class FeesRequestQueryDto {
  @IsOptional()
  @IsString()
  network?: 'mainnet' | 'testnet'
}
