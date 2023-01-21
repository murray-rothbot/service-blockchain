export class AddressResponseDto {
  data: {
    address: string
    chain_stats: {
      funded_txo_count: number
      funded_txo_sum: number
      spent_txo_count: number
      spent_txo_sum: number
      tx_count: number
    }
    mempool_stats: {
      funded_txo_count: number
      funded_txo_sum: number
      spent_txo_count: number
      spent_txo_sum: number
      tx_count: number
    }
  }
}
export class AddressTxsResponseDto {
  txid: string
  version: number
  locktime: number
  vin: any
  vout: any
  size: number
  weight: number
  fee: number
  status: any
}
