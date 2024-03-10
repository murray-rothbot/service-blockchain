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

  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {
    const mempool_url = this.cfgService.get<string>('MEMPOOL_URL', 'https://mempool.space')

    this.baseUrl = `${mempool_url}/api`
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
    if (!hash) {
      const uri = height ? `block-height/${height}` : 'blocks/tip/hash'
      const url = `${this.baseUrl}/${uri}`

      hash = await lastValueFrom(
        this.httpService.get(url).pipe(
          map((response: AxiosResponse<BlockResponseDto>): BlockResponseDto => {
            return response.data
          }),
          catchError(async () => {
            this.logger.debug(`GET BLOCK ${url}`)
            return null
          }),
        ),
      )
    }

    if (!hash) return null

    const url = `${this.baseUrl}/v1/block/${hash}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<BlockResponseDto>): BlockResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET BLOCK ${url}`)
          return null
        }),
      ),
    )
  }

  async getFeesRecommended(): Promise<FeesRecommendedResponseDto> {
    const url = `${this.baseUrl}/v1/fees/recommended`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<FeesRecommendedResponseDto>): FeesRecommendedResponseDto => {
          return response.data
        }),
        catchError(async () => {
          this.logger.debug(`GET FEES RECOMMENDED ${url}`)
          return null
        }),
      ),
    )
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
