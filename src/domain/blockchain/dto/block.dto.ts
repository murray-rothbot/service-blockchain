export interface BlockBodyDto {
  extras: {
    reward: number
    coinbaseTx: any
    coinbaseRaw: string
    usd: number
    medianFee: number
    feeRange: [number]
    totalFees: number
    avgFee: number
    avgFeeRate: number
    pool: { id: number; name: string; slug: string }
    matchRate: number
  }
  id: string
  height: number
  version: number
  timestamp: number
  bits: number
  nonce: number
  difficulty: number
  merkle_root: string
  tx_count: number
  size: number
  weight: number
  previousblockhash: string
}
