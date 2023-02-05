import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { BlockchainService } from '../blockchain/blockchain.service'
import { AlertFee } from './alert-fee.model'
import { CreateAlertFeeDto, ListAlertFeeDto } from './dto'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'

@Injectable()
export class AlertFeeService {
  private readonly logger = new Logger(AlertFeeService.name)

  constructor(
    @InjectModel(AlertFee)
    private alertFeeModel: typeof AlertFee,
    private readonly blockchainService: BlockchainService,
    protected readonly httpService: HttpService,
  ) {}

  async create(data: CreateAlertFeeDto): Promise<AlertFee> {
    if (data.fee <= 0) {
      data.fee = 1
    }

    // check if tx already exists
    const alertFee = await this.alertFeeModel.findOne({
      where: {
        webhookUrl: data.webhookUrl,
        fee: data.fee,
        active: true,
      },
    })
    if (alertFee) return alertFee

    // create new alert
    const newAlertFee = await this.alertFeeModel.create({
      webhookUrl: data.webhookUrl,
      fee: data.fee,
      active: true,
    })
    return newAlertFee
  }

  async list(data: ListAlertFeeDto): Promise<AlertFee[]> {
    return this.alertFeeModel.findAll({
      where: { webhookUrl: data.webhookUrl, active: true },
      order: ['fee'],
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
    const triggeredAlerts = await this.alertFeeModel.findAll({
      where: {
        active: true,
        fee: {
          [Op.gte]: +currentFee.fastestFee,
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

  async deactivateAlert(id: number): Promise<void> {
    await this.alertFeeModel.update(
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
