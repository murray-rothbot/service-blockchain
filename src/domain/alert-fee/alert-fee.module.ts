import { AlertFeeController } from './alert-fee.controller'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AlertFee } from './alert-fee.model'
import { AlertFeeService } from './alert-fee.service'
import { BlockchainModule } from '../blockchain/blockchain.module'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [SequelizeModule.forFeature([AlertFee]), HttpModule, BlockchainModule],
  providers: [AlertFeeService],
  controllers: [AlertFeeController],
})
export class AlertFeeModule {}
