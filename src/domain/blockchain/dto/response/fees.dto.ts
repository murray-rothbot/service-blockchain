export class FeesRecommendedResponseDto {
  data: {
    fastestFee: number
    halfHourFee: number
    hourFee: number
    economyFee: number
    minimumFee: number
  }
}
interface FeesMempoolResponse {
  blockSize: number
  blockVSize: number
  nTx: number
  totalFees: number
  medianFee: number
  feeRange: number[]
}
export class FeesMempoolBlocksResponseDto {
  data: FeesMempoolResponse[]
}
