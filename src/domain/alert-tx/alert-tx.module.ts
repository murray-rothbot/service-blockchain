import { AlertTxController } from './alert-tx.controller'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { AlertTx } from './alert-tx.model'
import { AlertTxService } from './alert-tx.service'
import { BlockchainModule } from '../blockchain/blockchain.module'
import { HttpModule } from '@nestjs/axios'
import { MempoolSpaceRepository } from '../blockchain/repositories'

@Module({
  imports: [SequelizeModule.forFeature([AlertTx]), HttpModule, BlockchainModule],
  providers: [AlertTxService, MempoolSpaceRepository],
  controllers: [AlertTxController],
})
export class AlertTxModule {}
