import { Controller, Get, Query, Param, Logger, Post, Body } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import {
  AddressRequestDto,
  AddressRequestQueryDto,
  AddressResponseDto,
  BlockRequestDto,
  BlockResponseDto,
  BlockTimeRequestDto,
  BlockTimeResponseDto,
  FeesResponseDto,
  TransactionPostDto,
  TransactionPostParamsDto,
  TransactionRequestDto,
  TransactionResponseDto,
} from './dto'
import { InjectWebSocketProvider, WebSocketClient, OnOpen, OnMessage } from 'nestjs-websocket'
import { Cron } from '@nestjs/schedule'

@Controller('')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name)
  private data: Record<any, any> = {}

  constructor(
    @InjectWebSocketProvider()
    private readonly ws: WebSocketClient,
    private readonly blockService: BlockchainService,
  ) {}

  @OnOpen()
  openWs(): void {
    this.logger.debug(`Mempool.Space Websocket watching.`)
    this.ws.send(JSON.stringify({ action: 'want', data: ['blocks'] }))
  }

  @Cron('*/10 * * * * *')
  pingWs(): void {
    this.ws.send(JSON.stringify({ action: 'ping' }))
  }

  @OnMessage()
  async messageWs(data: WebSocketClient.Data): Promise<void> {
    this.data = JSON.parse(data.toString())
    if (this.data.block) this.blockService.postBlock({ block: this.data.block })
    if (this.data.pong) this.logger.debug(`Mempool.Space Websocket ping.`)
  }

  @Get('/block')
  async getBlock(@Query() params: BlockRequestDto): Promise<BlockResponseDto> {
    return await this.blockService.getBlock(params)
  }

  @Get('/block2time')
  async getBlockTime(@Query() params: BlockTimeRequestDto): Promise<BlockTimeResponseDto> {
    return await this.blockService.getBlockTime(params)
  }

  @Get('/fees')
  async getFees(@Query() params: any): Promise<FeesResponseDto> {
    return await this.blockService.getFees(params)
  }

  @Get('/address/:address')
  async getAddress(
    @Param() params: AddressRequestDto,
    @Query() paramsQuery: AddressRequestQueryDto,
  ): Promise<AddressResponseDto> {
    return await this.blockService.getAddress({ ...params, ...paramsQuery })
  }

  @Get('/address/:address/txs')
  async getAddressTxs(
    @Param() params: AddressRequestDto,
    @Query() paramsQuery: AddressRequestQueryDto,
  ): Promise<AddressResponseDto> {
    return await this.blockService.getAddressTxs({ ...params, ...paramsQuery })
  }

  @Get('/address/:address/txs/utxo')
  async getAddressTxsUtxo(
    @Param() params: AddressRequestDto,
    @Query() paramsQuery: AddressRequestQueryDto,
  ): Promise<AddressResponseDto> {
    return await this.blockService.getAddressTxsUtxo({ ...params, ...paramsQuery })
  }

  @Get('/tx/:transaction/:network')
  async getTransaction(@Param() params: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.blockService.getTransaction({ ...params })
  }

  @Post('/tx/:network')
  async postTransaction(
    @Param() paramsQuery: TransactionPostParamsDto,
    @Body() params: TransactionPostDto,
  ): Promise<TransactionResponseDto> {
    return await this.blockService.postTransaction({ ...params, ...paramsQuery })
  }
}
