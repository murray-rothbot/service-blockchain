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
  data: {
    txid: string
    version: number
    locktime: number
    vin: any[]
    vout: any[]
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
}

export class AddressUtxosResponseDto {
  data: {
    txid: string
    vout: number
    status: {
      confirmed: boolean
      block_height: number
      block_hash: string
      block_time: number
    }
    value: number
  }
}
