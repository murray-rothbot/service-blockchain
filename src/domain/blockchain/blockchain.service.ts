import { Injectable } from '@nestjs/common'
import { BlockRequestDto, BlockResponseDto } from './dto'

import { MempoolSpaceRepository } from './repositories'

@Injectable()
export class BlockchainService {
  constructor(private readonly mempoolRepository: MempoolSpaceRepository) {}

  async getBlock(params: BlockRequestDto): Promise<BlockResponseDto> {
    return await this.mempoolRepository.getBlock(params)
  }
}
