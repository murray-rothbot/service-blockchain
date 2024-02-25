import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class BlockRequestDto {
  @IsString()
  @IsOptional()
  hash?: string

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  height?: number
}
