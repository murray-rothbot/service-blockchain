import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { BlockchainService } from '../blockchain/blockchain.service'
import { CreateAlertFeeDto, ListAlertFeeDto } from './dto'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { PrismaService } from '../../prisma.service'
import { AlertFee } from '@prisma/client'

@Injectable()
export class AlertFeeService {
  private readonly logger = new Logger(AlertFeeService.name)

  constructor(
    private prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
    protected readonly httpService: HttpService,
  ) {}

  async create(data: CreateAlertFeeDto): Promise<AlertFee> {
    if (data.fee <= 0) {
      data.fee = 1
    }

    // check if tx already exists
    const alertFee = await this.prisma.alertFee.findFirst({
      where: {
        webhookUrl: data.webhookUrl,
        fee: data.fee,
        active: true,
      },
    })

    if (alertFee) return alertFee

    // create new alert
    const newAlertFee = await this.prisma.alertFee.create({
      data: {
        webhookUrl: data.webhookUrl,
        fee: data.fee,
        active: true,
      },
    })
    return newAlertFee
  }

  async list(data: ListAlertFeeDto): Promise<AlertFee[]> {
    return this.prisma.alertFee.findMany({
      where: { webhookUrl: data.webhookUrl, active: true },
      orderBy: [{ fee: 'desc' }],
    })
  }

  @Cron('*/15 * * * * *')
  async checkAlertPrices() {
    // get current prices
    const currentFee = await this.blockchainService.getFees()
    if (!currentFee) {
      this.logger.error(`ERROR CRON - checkAlertPrices`)
      return
    }

    // check if any alert is triggered
    const triggeredAlerts = await this.prisma.alertFee.findMany({
      where: {
        active: true,
        fee: {
          gte: +currentFee.fastestFee,
        },
      },
    })

    // post triggered alerts to their webhooks
    if (triggeredAlerts.length > 0) {
      triggeredAlerts.map(async (alert) => {
        await lastValueFrom(
          this.httpService.post(alert.webhookUrl, alert).pipe(
            map(async (response: any) => {
              // deactivate triggered alerts
              if (response.data.data.message === 'OK') {
                await this.deactivateAlert(alert.id)
              }
            }),
            catchError(async () => {
              this.logger.error(`ERROR POST ${alert.webhookUrl}`)
              return null
            }),
          ),
        )
      })
    }
  }

  async deactivateAlert(id: string): Promise<void> {
    await this.prisma.alertFee.update({
      data: {
        active: false,
      },
      where: {
        id,
      },
    })
  }
}
