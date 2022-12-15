import { Controller, Get, Query } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import { BlockRequestDto, BlockResponseDto } from './dto'

@Controller('')
export class BlockchainController {
  constructor(private readonly blockService: BlockchainService) {}

  @Get('/block')
  async getBlock(@Query() params: BlockRequestDto): Promise<BlockResponseDto> {
    return await this.blockService.getBlock(params)
  }
}
