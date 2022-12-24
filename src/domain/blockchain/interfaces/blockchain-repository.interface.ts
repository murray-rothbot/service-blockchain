import { BlockRequestDto, BlockResponseDto } from '../dto'
import { BlockTimeRequestDto, BlockTimeResponseDto } from '../dto'

export interface IBlockRepository {
  source: string
  baseUrl: string

  getBlock(blockRequest: BlockRequestDto): Promise<BlockResponseDto>
}
