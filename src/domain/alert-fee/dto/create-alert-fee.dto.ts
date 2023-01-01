import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator'

export class CreateAlertFeeDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  webhookUrl: string

  @IsNumber()
  @IsNotEmpty()
  fee: number
}
