import { Controller, Post, Body, Get, Query } from '@nestjs/common'
import { AlertFeeService } from './alert-fee.service'
import { CreateAlertFeeDto, ListAlertFeeDto } from './dto'

@Controller('alert-fee')
export class AlertFeeController {
  constructor(private readonly alertFeeService: AlertFeeService) {}

  @Post()
  create(@Body() createAlertFeeDto: CreateAlertFeeDto) {
    return this.alertFeeService.create(createAlertFeeDto)
  }

  @Get()
  list(@Query() listAlertFeeDto: ListAlertFeeDto) {
    return this.alertFeeService.list(listAlertFeeDto)
  }
}
