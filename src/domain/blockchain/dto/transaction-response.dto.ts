export class TransactionResponseDto {
  txid: string
  version: number
  locktime: number
  size: number
  weight: number
  fee: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
}
