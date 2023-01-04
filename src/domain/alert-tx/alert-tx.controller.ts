import { Controller, Post, Body } from '@nestjs/common'
import { AlertTxService } from './alert-tx.service'
import { CreateAlertTxDto } from './dto/create-alert-tx.dto'

@Controller('alert-tx')
export class AlertTxController {
  constructor(private readonly alertTxService: AlertTxService) {}

  @Post()
  create(@Body() createAlertTxDto: CreateAlertTxDto) {
    return this.alertTxService.create(createAlertTxDto)
  }
}
