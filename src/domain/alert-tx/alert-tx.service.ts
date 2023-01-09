import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/sequelize'
import { BlockchainService } from '../blockchain/blockchain.service'
import { AlertTx } from './alert-tx.model'
import { CreateAlertTxDto, ListAlertTxDto } from './dto'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { InjectWebSocketProvider, WebSocketClient, OnOpen, OnMessage } from 'nestjs-websocket'

@Injectable()
export class AlertTxService {
  private readonly logger = new Logger(AlertTxService.name)
  private data: Record<any, any> = {}

  constructor(
    @InjectWebSocketProvider()
    private readonly ws: WebSocketClient,
    @InjectModel(AlertTx)
    private alertTxModel: typeof AlertTx,
    private readonly blockchainService: BlockchainService,
    protected readonly httpService: HttpService,
  ) {}

  @OnOpen()
  openWs() {
    this.logger.debug(`Mempool.Space Websocket watching 'blocks'.`)
    this.ws.send(
      JSON.stringify({
        action: 'want',
        data: ['blocks'],
      }),
    )
  }

  @OnMessage()
  messageWs(data: WebSocketClient.Data) {
    this.data = JSON.parse(data.toString())
    if (this.data.block) {
      this.checkAlertTx(this.data.block.height)
    }
    if (this.data.pong) {
      this.logger.debug(`Mempool.Space Websocket ping.`)
    }
  }

  @Cron('*/10 * * * * *')
  pingWs() {
    this.ws.send(
      JSON.stringify({
        action: 'ping',
      }),
    )
  }

  async create(data: CreateAlertTxDto): Promise<AlertTx> {
    if (!data.confirmationsAlert || data.confirmationsAlert < 1) {
      data.confirmationsAlert = 1
    }
    if (data.confirmationsAlert >= 6) {
      data.confirmationsAlert = 6
    }

    //check if tx already exists
    const alertTx = await this.alertTxModel.findOne({
      where: {
        webhookUrl: data.webhookUrl,
        txId: data.txId,
        active: true,
      },
    })
    if (alertTx) return alertTx

    const newAlertFee = await this.alertTxModel.create({
      webhookUrl: data.webhookUrl,
      txId: data.txId,
      confirmationsAlert: data.confirmationsAlert,
      active: true,
    })
    return newAlertFee
  }

  async checkAlertTx(block: number) {
    this.logger.debug(`Checking alert tx...`)

    // check if any alert is triggered
    const triggeredAlerts = await this.alertTxModel.findAll({
      where: {
        active: true,
      },
    })

    // post triggered alerts to their webhooks
    if (triggeredAlerts.length > 0) {
      triggeredAlerts.map(async (alert) => {
        const alertReturn = JSON.parse(JSON.stringify(alert))
        const { status } = await this.blockchainService.getTransaction({
          transaction: alert.txId,
        })
        if (status.block_height) {
          const { block_height } = status
          const confirmations = block - block_height + 1 // +1 because block_height is 0 indexed
          alertReturn.currentConfirmation = confirmations
          alertReturn.currentBlock = block
          await lastValueFrom(
            this.httpService.post(alert.webhookUrl, alertReturn).pipe(
              map(async (response: any) => {
                // deactivate triggered alerts
                // if webhook response is OK
                // and confirmations are reached
                if (
                  response.data.data.message === 'OK' &&
                  confirmations >= alert.confirmationsAlert
                ) {
                  await this.deactivateAlert(alert.id)
                }
              }),
              catchError(async () => {
                this.logger.error(`ERROR POST ${alert.webhookUrl}`)
                return null
              }),
            ),
          )
        }
      })
    }
  }

  async list(data: ListAlertTxDto): Promise<AlertTx[]> {
    return this.alertTxModel.findAll({
      where: { webhookUrl: data.webhookUrl, active: true },
    })
  }

  async deactivateAlert(id: number): Promise<void> {
    await this.alertTxModel.update(
      {
        active: false,
      },
      {
        where: {
          id,
        },
      },
    )
  }
}
