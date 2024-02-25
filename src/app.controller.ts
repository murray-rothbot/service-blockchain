import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HealthDto } from './domain/blockchain/dto'

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @ApiTags('Server')
  @ApiOperation({
    summary: 'Health check.',
  })
  @ApiOkResponse({ type: HealthDto })
  async health() {
    return { message: 'OK' }
  }
}
