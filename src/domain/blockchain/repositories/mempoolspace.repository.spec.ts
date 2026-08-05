import { of, throwError } from 'rxjs'
import { MempoolSpaceRepository } from './mempoolspace.repository'

describe('MempoolSpaceRepository fallback', () => {
  const primary = 'https://mempool.space'
  const fallback = 'https://blockstream.info'
  let httpService: { get: jest.Mock }
  let repository: MempoolSpaceRepository

  beforeEach(() => {
    httpService = { get: jest.fn() }
    const configService = {
      get: jest.fn((key: string, defaultValue: string) => {
        if (key === 'MEMPOOL_URL') return primary
        if (key === 'MEMPOOL_FALLBACK_URL') return fallback
        if (key === 'MEMPOOL_HTTP_TIMEOUT_MS') return defaultValue
        return defaultValue
      }),
    }

    repository = new MempoolSpaceRepository(httpService as any, configService as any)
  })

  it('falls back to Blockstream when fetching the tip block from mempool.space fails', async () => {
    const hash = '00000000000000000001'
    const block = { id: hash, height: 961189, timestamp: 1785951623 }
    httpService.get
      .mockReturnValueOnce(throwError(() => new Error('read ECONNRESET')))
      .mockReturnValueOnce(of({ data: hash }))
      .mockReturnValueOnce(of({ data: block }))

    await expect(repository.getBlock({})).resolves.toEqual(block)
    expect(httpService.get).toHaveBeenNthCalledWith(
      2,
      `${fallback}/api/blocks/tip/hash`,
      expect.objectContaining({ timeout: 1500 }),
    )
    expect(httpService.get).toHaveBeenNthCalledWith(
      3,
      `${fallback}/api/block/${hash}`,
      expect.objectContaining({ timeout: 1500 }),
    )
  })

  it('converts Blockstream fee estimates when mempool.space precise fees fail', async () => {
    httpService.get
      .mockReturnValueOnce(throwError(() => new Error('status 524')))
      .mockReturnValueOnce(of({ data: { 1: 3.2, 3: 2.1, 6: 1.4, 144: 0.2, 1008: 0.1 } }))

    await expect(repository.getFeesRecommended()).resolves.toEqual({
      fastestFee: 4,
      halfHourFee: 3,
      hourFee: 2,
      economyFee: 1,
      minimumFee: 1,
    })
    expect(httpService.get).toHaveBeenNthCalledWith(
      2,
      `${fallback}/api/fee-estimates`,
      expect.objectContaining({ timeout: 1500 }),
    )
  })
})
