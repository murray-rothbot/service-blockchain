import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { IErrorResponse } from './interfaces/error.response.interface'

@Catch()
export class GenericExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    if (exception instanceof HttpException) return
    const message = exception.toString() || 'Internal Server Error'
    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR

    const errorResponse = {
      error: {
        statusCode: statusCode,
        messages: [message],
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      },
    } as IErrorResponse

    Logger.error(JSON.stringify(errorResponse))
    httpAdapter.reply(ctx.getResponse(), errorResponse, statusCode)
  }
}
