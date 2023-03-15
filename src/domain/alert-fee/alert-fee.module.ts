import { AlertFeeController } from './alert-fee.controller'
import { Module } from '@nestjs/common'
import { AlertFeeService } from './alert-fee.service'
import { BlockchainModule } from '../blockchain/blockchain.module'
import { HttpModule } from '@nestjs/axios'
import { PrismaService } from '../../prisma.service'

@Module({
  imports: [HttpModule, BlockchainModule],
  providers: [AlertFeeService, PrismaService],
  controllers: [AlertFeeController],
})
export class AlertFeeModule {}
