import { Controller, Post, Body } from '@nestjs/common'
import { AlertFeeService } from './alert-fee.service'
import { CreateAlertFeeDto } from './dto/create-alert-fee.dto'

@Controller('alert-fee')
export class AlertFeeController {
  constructor(private readonly alertFeeService: AlertFeeService) {}

  @Post()
  create(@Body() createAlertFeeDto: CreateAlertFeeDto) {
    return this.alertFeeService.create(createAlertFeeDto)
  }
}
