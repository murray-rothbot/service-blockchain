import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateAlertTxDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  webhookUrl: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @MinLength(64)
  txId: string

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  confirmationsAlert: number
}
