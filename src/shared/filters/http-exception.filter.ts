import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'
import { IErrorResponse } from './interfaces/error.response.interface'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const message = (exception.getResponse() as any).message || exception.message

    const errorResponse: IErrorResponse = {
      error: {
        statusCode: status,
        messages: message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    }

    Logger.error(JSON.stringify(errorResponse))
    response.status(status).json(errorResponse)
  }
}
