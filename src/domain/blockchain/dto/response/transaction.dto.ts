export class TransactionResponseDto {
  data: {
    txid: string
    version: number
    locktime: number
    vin: any
    vout: any
    size: number
    weight: number
    fee: number
    status: {
      confirmed: boolean
      block_height?: number
      block_hash?: string
      block_time?: number
    }
  }
}

export class TransactionPostResponseDto {
  data: {
    txid: string
  }
}
