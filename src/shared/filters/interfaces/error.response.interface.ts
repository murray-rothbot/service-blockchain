export interface IErrorResponse {
  error: {
    statusCode: number
    messages: string[]
    timestamp: string
    path: string
  }
}
