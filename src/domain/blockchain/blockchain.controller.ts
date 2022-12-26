import { Controller, Get, Query } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import {
  AddressRequestDto,
  AddressResponseDto,
  BlockRequestDto,
  BlockResponseDto,
  BlockTimeRequestDto,
  BlockTimeResponseDto,
  FeesResponseDto,
  TransactionRequestDto,
  TransactionResponseDto,
} from './dto'

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

  @Get('/address')
  async getAddress(@Query() params: AddressRequestDto): Promise<AddressResponseDto> {
    return await this.blockService.getAddress(params)
  }

  @Get('/tx')
  async getTransaction(@Query() params: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.blockService.getTransaction(params)
  }
}
