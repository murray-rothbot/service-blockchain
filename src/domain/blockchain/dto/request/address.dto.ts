import { IsString } from 'class-validator'

export class AddressRequestDto {
  @IsString()
  address: string
}
