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

  @Cron('*/5 * * * * *')
  async checkAlertPrices() {
    this.logger.debug(`Checking alert fee...`)

    // get current prices
    const currentFee = await this.blockchainService.getFees()

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
