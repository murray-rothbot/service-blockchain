import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import {
  AddressRequestDto,
  BlockRequestDto,
  TransactionRequestDto,
  BlockResponseDto,
  FeesRecommendedResponseDto,
  FeesMempoolBlocksResponseDto,
  MempoolResponseDto,
  TransactionResponseDto,
  AddressResponseDto,
  AddressTxsResponseDto,
  AddressUtxosResponseDto,
  TransactionPostResponseDto,
  TransactionPostRequestDto,
  HashrateResponseDto,
} from '../dto'

@Injectable()
export class MempoolSpaceRepository {
  private readonly logger = new Logger(MempoolSpaceRepository.name)
  private baseUrl: string = ''
  private fallbackBaseUrl: string = ''
  private timeout: number

  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {
    const mempool_url = this.cfgService.get<string>('MEMPOOL_URL', 'https://mempool.space')
    const fallback_url = this.cfgService.get<string>(
      'MEMPOOL_FALLBACK_URL',
      'https://blockstream.info',
    )

    this.baseUrl = `${mempool_url}/api`
    this.fallbackBaseUrl = `${fallback_url}/api`
    this.timeout = Number(this.cfgService.get<number>('MEMPOOL_HTTP_TIMEOUT_MS', 1500))
  }

  private async get<T>(url: string): Promise<T | null> {
    try {
      return await lastValueFrom(
        this.httpService
          .get<T>(url, { timeout: this.timeout })
          .pipe(map((response: AxiosResponse<T>): T => response.data)),
      )
    } catch {
      this.logger.debug(`GET failed ${url}`)
      return null
    }
  }

  async getMempool(): Promise<MempoolResponseDto> {
    const url = `${this.baseUrl}/mempool`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<MempoolResponseDto>): MempoolResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET MEMPOOL ${url}`)
          return null
        }),
      ),
    )
  }

  async getBlock({ hash, height }: BlockRequestDto): Promise<BlockResponseDto> {
    let useFallback = false

    if (!hash) {
      const uri = height ? `block-height/${height}` : 'blocks/tip/hash'
      hash = await this.get<string>(`${this.baseUrl}/${uri}`)

      if (!hash) {
        useFallback = true
        hash = await this.get<string>(`${this.fallbackBaseUrl}/${uri}`)
      }
    }

    if (!hash) return null

    if (useFallback) {
      return await this.get<BlockResponseDto>(`${this.fallbackBaseUrl}/block/${hash}`)
    }

    const block = await this.get<BlockResponseDto>(`${this.baseUrl}/v1/block/${hash}`)
    return block ?? (await this.get<BlockResponseDto>(`${this.fallbackBaseUrl}/block/${hash}`))
  }

  async getFeesRecommended(): Promise<FeesRecommendedResponseDto> {
    const url = `${this.baseUrl}/v1/fees/precise`
    const fees = await this.get<FeesRecommendedResponseDto>(url)

    if (fees) return fees

    const estimates = await this.get<Record<string, number>>(
      `${this.fallbackBaseUrl}/fee-estimates`,
    )

    if (!estimates) return null

    const rounded = (blocks: number): number => Math.max(1, Math.ceil(estimates[blocks] ?? 1))

    return {
      fastestFee: rounded(1),
      halfHourFee: rounded(3),
      hourFee: rounded(6),
      economyFee: rounded(144),
      minimumFee: rounded(1008),
    } as unknown as FeesRecommendedResponseDto
  }

  async getFeesMempoolBlocks(): Promise<FeesMempoolBlocksResponseDto> {
    const url = `${this.baseUrl}/v1/fees/mempool-blocks`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map(
          (response: AxiosResponse<FeesMempoolBlocksResponseDto>): FeesMempoolBlocksResponseDto => {
            return response.data
          },
        ),
        catchError(async () => {
          this.logger.debug(`GET FEES MEMPOOL BLOCKS ${url}`)
          return null
        }),
      ),
    )
  }

  async getAddress({ address }: AddressRequestDto): Promise<AddressResponseDto> {
    const url = `${this.baseUrl}/address/${address}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<AddressResponseDto>): AddressResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET ADDRESS ${url}`)
          return null
        }),
      ),
    )
  }

  async getAddressTxs({ address }: AddressRequestDto): Promise<AddressTxsResponseDto> {
    const url = `${this.baseUrl}/address/${address}/txs/chain`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<AddressTxsResponseDto>): AddressTxsResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET ADDRESS TXS ${url}`)
          return null
        }),
      ),
    )
  }

  async getAddressTxsUtxo({ address }: AddressRequestDto): Promise<AddressUtxosResponseDto> {
    const url = `${this.baseUrl}/address/${address}/utxo`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<AddressUtxosResponseDto>): AddressUtxosResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET ADDRESS TXS UTXO ${url}`)
          return null
        }),
      ),
    )
  }

  async getTransaction({ transaction }: TransactionRequestDto): Promise<TransactionResponseDto> {
    const url = `${this.baseUrl}/tx/${transaction}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<TransactionResponseDto>): TransactionResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET TX ${url}`)
          return null
        }),
      ),
    )
  }

  async postTransaction({ txHex }: TransactionPostRequestDto): Promise<TransactionPostResponseDto> {
    let url = `${this.baseUrl}/tx`

    return lastValueFrom(
      this.httpService.post(url, txHex).pipe(
        map((response: AxiosResponse<TransactionPostResponseDto>): TransactionPostResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`POST TX ${txHex}`)
          return null
        }),
      ),
    )
  }

  async getDifficulty() {
    const url = `${this.baseUrl}/v1/difficulty-adjustment`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<string>): string => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET DIFFICULTY ${url}`)
          return null
        }),
      ),
    )
  }

  async getHashrate(): Promise<HashrateResponseDto> {
    const url = `${this.baseUrl}/v1/mining/hashrate/1m`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<string>): string => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET HASHRATE ${url}`)
          return null
        }),
      ),
    )
  }
}
