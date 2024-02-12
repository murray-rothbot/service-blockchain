import { Injectable, Logger } from '@nestjs/common'
import { MempoolSpaceRepository } from './repositories'
import { HttpService } from '@nestjs/axios'
import {
  AddressResponseDto,
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

  async getFees(params?: any): Promise<FeesResponseDto> {
    if (params?.network) {
      return await this.mempoolRepository.getFees({ network: params.network })
    }
    return await this.mempoolRepository.getFees({ network: 'mainnet' })
  }

  async getAddress({ address, network }: any): Promise<AddressResponseDto> {
    if (network) {
      return await this.mempoolRepository.getAddress({ address, network })
    }
    return await this.mempoolRepository.getAddress({ address, network })
  }

  async getAddressTxs({ address, network }: any): Promise<AddressResponseDto> {
    if (network) {
      return await this.mempoolRepository.getAddressTxs({ address, network })
    }
    return await this.mempoolRepository.getAddressTxs({ address, network })
  }

  async getAddressTxsUtxo({ address, network }: any): Promise<AddressResponseDto> {
    if (network) {
      return await this.mempoolRepository.getAddressTxsUtxo({ address, network })
    }
    return await this.mempoolRepository.getAddressTxsUtxo({ address, network })
  }

  async getTransaction({
    transaction,
    network,
  }: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.mempoolRepository.getTransaction({ transaction, network })
  }

  async postTransaction({
    transaction,
    network,
  }: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.mempoolRepository.postTransaction({ transaction, network })
  }

  async getHashRate() {
    const [hashrate, difficulty] = await Promise.all([
      this.mempoolRepository.getHashrate(),
      this.mempoolRepository.getDifficulty(),
    ])

    return Object.assign(difficulty, hashrate)
  }
}
