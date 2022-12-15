import { IsOptional, IsString } from 'class-validator'

export class BlockRequestDto {
  @IsString()
  @IsOptional()
  hash: string
}
