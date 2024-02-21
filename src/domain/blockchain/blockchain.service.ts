import { Injectable, Logger } from '@nestjs/common'
import { MempoolSpaceRepository } from './repositories'
import { HttpService } from '@nestjs/axios'
import {
  AddressResponseDto,
  AddressTxsResponseDto,
  AddressUtxosResponseDto,
  BlockRequestDto,
  BlockResponseDto,
  BlockTimeRequestDto,
  BlockTimeResponseDto,
  FeesResponseDto,
  TransactionRequestDto,
  TransactionResponseDto,
} from './dto'

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name)

  constructor(
    private readonly mempoolRepository: MempoolSpaceRepository,
    protected readonly httpService: HttpService,
  ) {}

  async getMempool(): Promise<any> {
    return await this.mempoolRepository.getMempool()
  }

  async getBlock(params: BlockRequestDto): Promise<BlockResponseDto> {
    return await this.mempoolRepository.getBlock(params)
  }

  async getBlockTime({ hash, height }: BlockTimeRequestDto): Promise<BlockTimeResponseDto> {
    const found = await this.getBlock({ hash, height })

    if (found) {
      return { timestamp: found.timestamp, height: found.height, in_future: false }
    }

    if (!height) {
      return null
    }

    const current = await this.getBlock({})
    const estimative = current.timestamp + (height - current.height) * 600

    return { timestamp: estimative, height, in_future: true }
  }

  async getFees(): Promise<FeesResponseDto> {
    return await this.mempoolRepository.getFees()
  }

  async getAddress({ address }: any): Promise<AddressResponseDto> {
    return await this.mempoolRepository.getAddress({ address })
  }

  async getAddressTxs({ address }: any): Promise<AddressTxsResponseDto> {
    return await this.mempoolRepository.getAddressTxs({ address })
  }

  async getAddressTxsUtxo({ address, network }: any): Promise<AddressUtxosResponseDto> {
    return await this.mempoolRepository.getAddressTxsUtxo({ address })
  }

  async getTransaction({ transaction }: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.mempoolRepository.getTransaction({ transaction })
  }

  async postTransaction({ transaction }: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.mempoolRepository.postTransaction({ transaction })
  }

  async getHashRate() {
    const [hashrate, difficulty] = await Promise.all([
      this.mempoolRepository.getHashrate(),
      this.mempoolRepository.getDifficulty(),
    ])

    return Object.assign(difficulty, hashrate)
  }
}
