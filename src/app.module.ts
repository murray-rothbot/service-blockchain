import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import config from './config/env.config'
import { WebSocketModule } from 'nestjs-websocket'
import { BlockchainModule } from './domain/blockchain/blockchain.module'

const mempool_ws = process.env.MEMPOOL_WS || 'wss://mempool.space'
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ScheduleModule.forRoot(),
    WebSocketModule.forRoot({
      url: `${mempool_ws}/api/v1/ws`,
    }),
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
