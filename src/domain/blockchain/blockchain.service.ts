import { Injectable, Logger } from '@nestjs/common'
import { MempoolSpaceRepository } from './repositories'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
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

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name)

  constructor(
    private readonly mempoolRepository: MempoolSpaceRepository,
    protected readonly httpService: HttpService,
  ) {}

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

  async getAddress({ address }: AddressRequestDto): Promise<AddressResponseDto> {
    return await this.mempoolRepository.getAddress({ address })
  }

  async getTransaction({ transaction }: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.mempoolRepository.getTransaction({ transaction })
  }

  async postBlock({ block }: { block: string }): Promise<void> {
    const webhookUrl = `${process.env.DISCORD_CLIENT_URL}/webhooks/new-block`
    await lastValueFrom(
      this.httpService.post(webhookUrl, block).pipe(
        map(() => {
          this.logger.debug(`POST WEBHOOK - ${webhookUrl}`)
        }),
        catchError(async () => {
          this.logger.error(`ERROR POST ${webhookUrl}`)
          return null
        }),
      ),
    )
  }
}
