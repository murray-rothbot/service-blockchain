import { Controller, Get, Query, Param, Logger, Post } from '@nestjs/common'
import { InjectWebSocketProvider, WebSocketClient, OnOpen } from 'nestjs-websocket'
import { Cron } from '@nestjs/schedule'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BlockchainService } from './blockchain.service'
import {
  AddressRequestDto,
  AddressResponseDto,
  AddressTxsResponseDto,
  AddressUtxosResponseDto,
  BlockRequestDto,
  BlockResponseDto,
  BlockTimeResponseDto,
  FeesResponseDto,
  MempoolResponseDto,
  TransactionRequestDto,
  TransactionResponseDto,
  HashrateResponseDto,
  TransactionPostResponseDto,
  TransactionPostRequestDto,
} from './dto'

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
  @ApiTags('Mining')
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
  async getBlockTime(@Query() params: BlockRequestDto): Promise<BlockTimeResponseDto> {
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
  async getAddress(@Param() params: AddressRequestDto): Promise<AddressResponseDto> {
    return await this.blockService.getAddress({ ...params })
  }

  @ApiOperation({
    summary: 'Get address transactions.',
  })
  @ApiTags('Address')
  @Get('/address/:address/txs')
  @ApiOkResponse({ type: AddressTxsResponseDto })
  async getAddressTxs(@Param() params: AddressRequestDto): Promise<AddressTxsResponseDto> {
    return await this.blockService.getAddressTxs({ ...params })
  }

  @ApiOperation({
    summary: 'Get address transactions utxo.',
  })
  @ApiTags('Address')
  @Get('/address/:address/txs/utxo')
  @ApiOkResponse({ type: AddressUtxosResponseDto })
  async getAddressTxsUtxo(@Param() params: AddressRequestDto): Promise<AddressUtxosResponseDto> {
    return await this.blockService.getAddressTxsUtxo({ ...params })
  }

  @ApiOperation({
    summary: 'Get transaction information.',
  })
  @ApiTags('Transaction')
  @ApiOkResponse({ type: TransactionResponseDto })
  @Get('/tx/:transaction')
  async getTransaction(@Param() params: TransactionRequestDto): Promise<TransactionResponseDto> {
    return await this.blockService.getTransaction({ ...params })
  }

  @ApiOperation({
    summary: 'Post transaction.',
  })
  @ApiTags('Transaction')
  @ApiOkResponse({ type: TransactionPostRequestDto })
  @Post('/tx/:txHex')
  async postTransaction(
    @Param() params: TransactionPostRequestDto,
  ): Promise<TransactionPostResponseDto> {
    return await this.blockService.postTransaction({ ...params })
  }

  @Get('/hashrate')
  @ApiTags('Mining')
  @ApiOkResponse({ type: HashrateResponseDto })
  async getHashrate() {
    return await this.blockService.getHashRate()
  }
}
