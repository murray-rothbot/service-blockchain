export class FeesRecommendedResponseDto {
  data: {
    fastestFee: number
    halfHourFee: number
    hourFee: number
    economyFee: number
    minimumFee: number
  }
}
export class FeesMempoolBlocksResponseDto {
  data: {
    blockSize: number
    blockVSize: number
    nTx: number
    totalFees: number
    medianFee: number
    feeRange: number[]
  }[]
}
