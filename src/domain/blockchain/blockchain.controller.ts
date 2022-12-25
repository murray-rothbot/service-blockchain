import { Controller, Get, Query } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import { BlockRequestDto, BlockResponseDto, FeesResponseDto } from './dto'
import { BlockTimeRequestDto, BlockTimeResponseDto } from './dto'

@Controller('')
export class BlockchainController {
  constructor(private readonly blockService: BlockchainService) {}

  @Get('/block')
  async getBlock(@Query() params: BlockRequestDto): Promise<BlockResponseDto> {
    return await this.blockService.getBlock(params)
  }

  @Get('/block2time')
  async getBlockTime(@Query() params: BlockTimeRequestDto): Promise<BlockTimeResponseDto> {
    return await this.blockService.getBlockTime(params)
  }

  @Get('/fees')
  async getFees(): Promise<FeesResponseDto> {
    return await this.blockService.getFees()
  }
}
