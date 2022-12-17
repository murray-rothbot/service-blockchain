export interface IPagination {
  pageSize: number
  pageNumber: number
  totalElements: number
  totalPages: number
}

export interface IMeta {
  pagination: IPagination
}

export interface IResponse {
  data: any
  meta?: IMeta
}
