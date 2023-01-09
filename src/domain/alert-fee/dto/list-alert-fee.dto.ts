import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class ListAlertFeeDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  webhookUrl: string
}
