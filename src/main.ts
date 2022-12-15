import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { swaggerConfig } from './config/swagger.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const cfgService = app.get(ConfigService)
  const PORT = cfgService.get<number>('APPLICATION_PORT', 3000)
  const NODE_ENV = cfgService.get<string>('NODE_ENV', 'LOCAL')

  await swaggerConfig(app)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  await app.listen(PORT).then(() => {
    Logger.log(`:: 🚀 Blockchain Info API :: ${NODE_ENV} ::`)
    Logger.log(`:: 💡 API Running on port ${PORT} ::`)
  })
}
bootstrap()
