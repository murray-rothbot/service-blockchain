import { Injectable, Logger } from '@nestjs/common'
import { BlockchainService } from '../blockchain/blockchain.service'
import { CreateAlertTxDto, ListAlertTxDto } from './dto'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { WebSocketClient, OnMessage } from 'nestjs-websocket'
import { PrismaService } from '../../prisma.service'
import { AlertTx } from '@prisma/client'

@Injectable()
export class AlertTxService {
  private readonly logger = new Logger(AlertTxService.name)
  private data: Record<any, any> = {}

  constructor(
    private prisma: PrismaService,
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
    const alertTx = await this.prisma.alertTx.findFirst({
      where: {
        webhookUrl: data.webhookUrl,
        txid: data.txId,
        active: true,
      },
    })
    if (alertTx) return alertTx

    const newAlertFee = await this.prisma.alertTx.create({
      data: {
        webhookUrl: data.webhookUrl,
        txid: data.txId,
        confirmations: data.confirmationsAlert,
        active: true,
      },
    })
    return newAlertFee
  }

  async checkAlertTx(block: number) {
    const triggeredAlerts = await this.prisma.alertTx.findMany({ where: { active: true } })

    if (triggeredAlerts.length === 0) return this.logger.debug(`No alerts triggered.`)

    // post triggered alerts to their webhooks
    triggeredAlerts.map(async (alert) => {
      const alertReturn = JSON.parse(JSON.stringify(alert))
      const data = await this.blockchainService.getTransaction({
        transaction: alert.txid,
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
              if (response.data.data.message === 'OK' && confirmations >= alert.confirmations) {
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
    return this.prisma.alertTx.findMany({ where: { webhookUrl: data.webhookUrl, active: true } })
  }

  async deactivateAlert(id: string): Promise<void> {
    await this.prisma.alertFee.update({ data: { active: false }, where: { id } })
  }
}
