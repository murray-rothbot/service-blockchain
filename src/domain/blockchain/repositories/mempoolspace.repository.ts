import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { Injectable } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import {
  AddressRequestDto,
  AddressResponseDto,
  BlockRequestDto,
  BlockResponseDto,
  FeesResponseDto,
  TransactionRequestDto,
  TransactionResponseDto,
} from '../dto'
import { IBlockRepository, IBlockResponse, IFeesResponse } from '../interfaces'

@Injectable()
export class MempoolSpaceRepository implements IBlockRepository {
  source = 'Mempool.space'
  baseUrl: string = 'https://mempool.space/api'

  constructor(private readonly httpService: HttpService) {}

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

    const { fastestFee, halfHourFee, hourFee, economyFee, minimumFee } = await lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<IFeesResponse>): FeesResponseDto => {
          console.log(response.data)
          return response.data
        }),
        catchError(async () => {
          // TODO: Log errordto
          console.error(url)
          return null
        }),
      ),
    )

    return { fastestFee, halfHourFee, hourFee, economyFee, minimumFee }
  }

  async getAddress({ address }: AddressRequestDto): Promise<AddressResponseDto> {
    const url = `${this.baseUrl}/address/${address}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<any>): AddressResponseDto => {
          console.log(response.data)
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
        map((response: AxiosResponse<any>): TransactionResponseDto => {
          console.log(response.data)
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
