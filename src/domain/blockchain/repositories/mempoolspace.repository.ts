import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { Injectable } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import {
  AddressResponseDto,
  AddressTxsResponseDto,
  AddressUtxosResponseDto,
  BlockRequestDto,
  BlockResponseDto,
  FeesResponseDto,
  TransactionRequestDto,
  TransactionResponseDto,
} from '../dto'
import {
  IBlockRepository,
  IBlockResponse,
  IFeesResponse,
  IAddressResponse,
  ITxResponse,
} from '../interfaces'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MempoolSpaceRepository implements IBlockRepository {
  source = 'Mempool.space'
  baseUrl: string = ''
  baseUrlTestnet: string = ''

  constructor(
    private readonly httpService: HttpService,
    private readonly cfgService: ConfigService,
  ) {
    const mempool_url = this.cfgService.get<string>('MEMPOOL_URL', 'https://mempool.space')

    this.baseUrl = `${mempool_url}/api`
  }

  async getMempool(): Promise<any> {
    const url = `${this.baseUrl}/mempool`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<IBlockResponse>): any => {
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
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
          map((response: AxiosResponse<string>): string => {
            return response.data
          }),
          catchError(async () => {
            // TODO: Log errordto
            console.error(url)
            return null
          }),
        ),
      )
    }

    if (!hash) return null

    const url = `${this.baseUrl}/v1/block/${hash}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<IBlockResponse>): BlockResponseDto => {
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }

  async getFees(): Promise<FeesResponseDto> {
    const url = `${this.baseUrl}/v1/fees/recommended`

    return await lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<IFeesResponse>): FeesResponseDto => {
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }

  async getAddress({ address }: any): Promise<AddressResponseDto> {
    const url = `${this.baseUrl}/address/${address}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<IAddressResponse>): AddressResponseDto => {
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }

  async getAddressTxs({ address }: any): Promise<AddressTxsResponseDto> {
    const url = `${this.baseUrl}/address/${address}/txs/chain`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>): AddressTxsResponseDto => {
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }

  async getAddressTxsUtxo({ address }: any): Promise<AddressUtxosResponseDto> {
    const url = `${this.baseUrl}/address/${address}/utxo`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>): AddressUtxosResponseDto => {
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }

  async getTransaction({ transaction }: TransactionRequestDto): Promise<TransactionResponseDto> {
    const url = `${this.baseUrl}/tx/${transaction}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<ITxResponse>): TransactionResponseDto => {
          return response.data
        }),
        catchError(async () => {
          // // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }

  async postTransaction({ transaction }: TransactionRequestDto): Promise<TransactionResponseDto> {
    let url = `${this.baseUrl}/tx`

    return lastValueFrom(
      this.httpService.post(url, transaction).pipe(
        map((response: AxiosResponse<any>): TransactionResponseDto => {
          return response.data
        }),
        catchError(async (err) => {
          // // TODO: Log errordto
          console.error(url, err)
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
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }

  async getHashrate() {
    const url = `${this.baseUrl}/v1/mining/hashrate/1m`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<string>): string => {
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )
  }
}
