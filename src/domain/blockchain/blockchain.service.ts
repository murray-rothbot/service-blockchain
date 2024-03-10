import { Injectable } from '@nestjs/common'
import { MempoolSpaceRepository } from './repositories'
import { HttpService } from '@nestjs/axios'
import {
  AddressRequestDto,
  TransactionRequestDto,
  BlockRequestDto,
  AddressResponseDto,
  AddressTxsResponseDto,
  AddressUtxosResponseDto,
  BlockTimeResponseDto,
  FeesRecommendedResponseDto,
  TransactionResponseDto,
  MempoolResponseDto,
  TransactionPostRequestDto,
  TransactionPostResponseDto,
  FeesMempoolBlocksResponseDto,
} from './dto'

@Injectable()
export class BlockchainService {
  constructor(
    private readonly mempoolRepository: MempoolSpaceRepository,
    protected readonly httpService: HttpService,
  ) {}

  async getMempool(): Promise<MempoolResponseDto> {
    return await this.mempoolRepository.getMempool()
  }

  async getBlock(params?: BlockRequestDto): Promise<any> {
    return await this.mempoolRepository.getBlock(params)
  }

  async getBlockTime({ hash, height }: BlockRequestDto): Promise<BlockTimeResponseDto> {
    const found = await this.getBlock({ hash, height })

    if (found) {
      return { timestamp: found.timestamp, height: found.height, in_future: false }
    }

    if (!height) {
      return null
    }

    const current = await this.getBlock()
    const estimative = current.timestamp + (height - current.height) * 600

    return { timestamp: estimative, height, in_future: true }
  }

  async getFeesRecommended(): Promise<FeesRecommendedResponseDto> {
    return await this.mempoolRepository.getFeesRecommended()
  }

  async getFeesMempoolBlocks(): Promise<FeesMempoolBlocksResponseDto> {
    return await this.mempoolRepository.getFeesMempoolBlocks()
  }

  async getAddress({ address }: AddressRequestDto): Promise<AddressResponseDto> {
    return await this.mempoolRepository.getAddress({ address })
  }

  async getAddressTxs({ address }: AddressRequestDto): Promise<AddressTxsResponseDto> {
    return await this.mempoolRepository.getAddressTxs({ address })
  }

  async getAddressTxsUtxo({ address }: AddressRequestDto): Promise<AddressUtxosResponseDto> {
    return await this.mempoolRepository.getAddressTxsUtxo({ address })
  }

  async getTransaction({ transaction }: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.mempoolRepository.getTransaction({ transaction })
  }

  async postTransaction({ txHex }: TransactionPostRequestDto): Promise<TransactionPostResponseDto> {
    return await this.mempoolRepository.postTransaction({ txHex })
  }

  async getHashRate() {
    const [hashrate, difficulty] = await Promise.all([
      this.mempoolRepository.getHashrate(),
      this.mempoolRepository.getDifficulty(),
    ])

    return Object.assign(difficulty, hashrate)
  }
}
