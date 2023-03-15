import { AlertTxController } from './alert-tx.controller'
import { Module } from '@nestjs/common'
import { AlertTxService } from './alert-tx.service'
import { BlockchainModule } from '../blockchain/blockchain.module'
import { HttpModule } from '@nestjs/axios'
import { MempoolSpaceRepository } from '../blockchain/repositories'
import { PrismaService } from '../../prisma.service'

@Module({
  imports: [HttpModule, BlockchainModule],
  providers: [AlertTxService, MempoolSpaceRepository, PrismaService],
  controllers: [AlertTxController],
})
export class AlertTxModule {}
