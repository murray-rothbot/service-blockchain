class FeeHistogramEntry {
  feeRate: number
  vsize: number
}

export class MempoolResponseDto {
  data: {
    count: number
    vsize: number
    total_fee: number
    fee_histogram: FeeHistogramEntry[]
  }
}
