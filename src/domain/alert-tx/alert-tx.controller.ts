import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { AlertTxService } from './alert-tx.service'
import { CreateAlertTxDto, ListAlertTxDto } from './dto'

@Controller('alert-tx')
export class AlertTxController {
  constructor(private readonly alertTxService: AlertTxService) {}

  @Post()
  create(@Body() createAlertTxDto: CreateAlertTxDto) {
    return this.alertTxService.create(createAlertTxDto)
  }

  @Get()
  list(@Query() listAlertTxDto: ListAlertTxDto) {
    return this.alertTxService.list(listAlertTxDto)
  }
}
