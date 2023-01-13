import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { BlockchainService } from '../blockchain/blockchain.service'
import { AlertTx } from './alert-tx.model'
import { CreateAlertTxDto, ListAlertTxDto } from './dto'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { WebSocketClient, OnMessage } from 'nestjs-websocket'

@Injectable()
export class AlertTxService {
  private readonly logger = new Logger(AlertTxService.name)
  private data: Record<any, any> = {}

  constructor(
    @InjectModel(AlertTx)
    private alertTxModel: typeof AlertTx,
    private readonly blockchainService: BlockchainService,
    protected readonly httpService: HttpService,
  ) {}

  @OnMessage()
  messageWs(data: WebSocketClient.Data) {
    this.data = JSON.parse(data.toString())
    if (this.data.block) {
      this.checkAlertTx(this.data.block.height)
    }
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

    const triggeredAlerts = await this.alertTxModel.findAll({ where: { active: true } })

    if (triggeredAlerts.length === 0) return this.logger.debug(`No alerts triggered.`)

    // post triggered alerts to their webhooks
    triggeredAlerts.map(async (alert) => {
      const alertReturn = JSON.parse(JSON.stringify(alert))
      const data = await this.blockchainService.getTransaction({
        transaction: alert.txId,
      })
      if (data === null) return

      const status = data?.status
      if (status?.block_height) {
        const confirmations = block - status.block_height + 1 // +1 because block_height is 0 indexed
        alertReturn.currentConfirmation = confirmations
        alertReturn.currentBlock = block
        await lastValueFrom(
          this.httpService.post(alert.webhookUrl, alertReturn).pipe(
            map(async (response: any) => {
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

  async list(data: ListAlertTxDto): Promise<AlertTx[]> {
    return this.alertTxModel.findAll({ where: { webhookUrl: data.webhookUrl, active: true } })
  }

  async deactivateAlert(id: number): Promise<void> {
    await this.alertTxModel.update({ active: false }, { where: { id } })
  }
}
