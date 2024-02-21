import { Controller, Get, Query, Param, Logger, Post, Body } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import {
  AddressRequestDto,
  AddressRequestQueryDto,
  AddressResponseDto,
  AddressTxsResponseDto,
  AddressUtxosResponseDto,
  BlockRequestDto,
  BlockResponseDto,
  BlockTimeRequestDto,
  BlockTimeResponseDto,
  FeesResponseDto,
  MempoolResponseDto,
  TransactionPostDto,
  TransactionPostParamsDto,
  TransactionRequestDto,
  TransactionResponseDto,
} from './dto'
import { InjectWebSocketProvider, WebSocketClient, OnOpen } from 'nestjs-websocket'
import { Cron } from '@nestjs/schedule'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name)

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

  @ApiOperation({
    summary: 'Get mempool information.',
  })
  @ApiTags('Mempool')
  @ApiOkResponse({ type: MempoolResponseDto })
  @Get('/mempool')
  async getMempool(): Promise<MempoolResponseDto> {
    return await this.blockService.getMempool()
  }

  @ApiOperation({
    summary: 'Get block information.',
  })
  @ApiTags('Block')
  @ApiOkResponse({ type: BlockResponseDto })
  @Get('/block')
  async getBlock(@Query() params: BlockRequestDto): Promise<BlockResponseDto> {
    return await this.blockService.getBlock(params)
  }

  @ApiOperation({
    summary: 'Get block time.',
  })
  @ApiTags('Block')
  @ApiOkResponse({ type: BlockTimeResponseDto })
  @Get('/block2time')
  async getBlockTime(@Query() params: BlockTimeRequestDto): Promise<BlockTimeResponseDto> {
    return await this.blockService.getBlockTime(params)
  }

  @ApiOperation({
    summary: 'Get mempool fees.',
  })
  @ApiTags('Mining')
  @ApiOkResponse({ type: FeesResponseDto })
  @Get('/fees')
  async getFees(): Promise<FeesResponseDto> {
    return await this.blockService.getFees()
  }

  @ApiOperation({
    summary: 'Get address information.',
  })
  @ApiTags('Address')
  @Get('/address/:address')
  @ApiOkResponse({ type: AddressResponseDto })
  async getAddress(
    @Param() params: AddressRequestDto,
    @Query() paramsQuery: AddressRequestQueryDto,
  ): Promise<AddressResponseDto> {
    return await this.blockService.getAddress({ ...params, ...paramsQuery })
  }

  @ApiOperation({
    summary: 'Get address transactions.',
  })
  @ApiTags('Address')
  @Get('/address/:address/txs')
  @ApiOkResponse({ type: AddressTxsResponseDto })
  async getAddressTxs(
    @Param() params: AddressRequestDto,
    @Query() paramsQuery: AddressRequestQueryDto,
  ): Promise<AddressTxsResponseDto> {
    return await this.blockService.getAddressTxs({ ...params, ...paramsQuery })
  }

  @ApiOperation({
    summary: 'Get address transactions utxo.',
  })
  @ApiTags('Address')
  @Get('/address/:address/txs/utxo')
  @ApiOkResponse({ type: AddressUtxosResponseDto })
  async getAddressTxsUtxo(
    @Param() params: AddressRequestDto,
    @Query() paramsQuery: AddressRequestQueryDto,
  ): Promise<AddressUtxosResponseDto> {
    return await this.blockService.getAddressTxsUtxo({ ...params, ...paramsQuery })
  }

  @ApiOperation({
    summary: 'Get transaction information.',
  })
  @ApiTags('Transaction')
  @ApiOkResponse({ type: TransactionResponseDto })
  @Get('/tx/:transaction/:network')
  async getTransaction(@Param() params: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.blockService.getTransaction({ ...params })
  }

  @ApiOperation({
    summary: 'Post transaction.',
  })
  @ApiTags('Transaction')
  @ApiOkResponse({ type: TransactionResponseDto })
  @Post('/tx/:network')
  async postTransaction(
    @Param() paramsQuery: TransactionPostParamsDto,
    @Body() params: TransactionPostDto,
  ): Promise<TransactionResponseDto> {
    return await this.blockService.postTransaction({ ...params, ...paramsQuery })
  }

  @Get('/hashrate')
  async getHashrate() {
    return this.blockService.getHashRate()
  }
}
