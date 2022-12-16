import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { IResponse } from './interfaces/response.interface'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponse> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse> {
    return next.handle().pipe(
      map((data) => {
        let pages: any

        if (data?.data && data.meta?.totalElements) {
          pages = Array.isArray(data.page) ? [...data.page] : [data.page]
        }

        return data && data.meta?.totalElements ? { data: { pages }, meta: data.meta } : { data }
      }),
    )
  }
}
