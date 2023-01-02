import { Module } from '@nestjs/common'
import { BlockchainService } from './blockchain.service'
import { BlockchainController } from './blockchain.controller'
import { HttpModule } from '@nestjs/axios'

import { MempoolSpaceRepository } from './repositories'

@Module({
  controllers: [BlockchainController],
  imports: [HttpModule],
  providers: [BlockchainService, MempoolSpaceRepository],
  exports: [BlockchainService],
})
export class BlockchainModule {}
