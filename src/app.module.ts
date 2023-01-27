import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { SequelizeModule } from '@nestjs/sequelize'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import config from './config/env.config'
import { AlertFee } from './domain/alert-fee/alert-fee.model'
import { AlertFeeModule } from './domain/alert-fee/alert-fee.module'
import { AlertTx } from './domain/alert-tx/alert-tx.model'
import { AlertTxModule } from './domain/alert-tx/alert-tx.module'
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
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [AlertFee, AlertTx],
      autoLoadModels: true,
      logging: false,
    }),
    WebSocketModule.forRoot({
      url: `${mempool_ws}/api/v1/ws`,
    }),
    BlockchainModule,
    AlertFeeModule,
    AlertTxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
