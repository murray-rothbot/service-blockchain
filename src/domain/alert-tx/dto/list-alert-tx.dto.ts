import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class ListAlertTxDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  webhookUrl: string
}
