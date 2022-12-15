import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { Injectable } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import { BlockRequestDto, BlockResponseDto } from '../dto'
import { IBlockRepository } from '../interfaces/blockchain-repository.interface'
import { IMempoolSpace } from '../interfaces'

@Injectable()
export class MempoolSpaceRepository implements IBlockRepository {
  source = 'Mempool.space'
  baseUrl: string = 'https://mempool.space/api'

  constructor(private readonly httpService: HttpService) {}

  async getBlock({ hash }: BlockRequestDto): Promise<BlockResponseDto> {
    if (!hash) {
      const url = `${this.baseUrl}/blocks/tip/hash`

      hash = await lastValueFrom(
        this.httpService.get(url).pipe(
          map((response: AxiosResponse<any>): string => {
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

    const url = `${this.baseUrl}/v1/block/${hash}`

    return lastValueFrom(
      this.httpService.get(url).pipe(
        map((response: AxiosResponse<IMempoolSpace>): BlockResponseDto => {
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
