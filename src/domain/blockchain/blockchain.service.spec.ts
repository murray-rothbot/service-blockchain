import { BlockchainService } from './blockchain.service'

describe('BlockchainService', () => {
  let mempoolRepository: { getHashrate: jest.Mock; getDifficulty: jest.Mock }
  let service: BlockchainService

  beforeEach(() => {
    mempoolRepository = {
      getHashrate: jest.fn(),
      getDifficulty: jest.fn(),
    }
    service = new BlockchainService(mempoolRepository as any, {} as any)
  })

  describe('getHashRate', () => {
    it('returns difficulty data when mempool hashrate endpoint is temporarily unavailable', async () => {
      const difficulty = {
        progressPercent: 74.2,
        difficultyChange: 1.5,
        estimatedRetargetDate: 1783166400,
      }
      mempoolRepository.getDifficulty.mockResolvedValue(difficulty)
      mempoolRepository.getHashrate.mockResolvedValue(null)

      await expect(service.getHashRate()).resolves.toEqual(difficulty)
    })

    it('returns hashrate data when mempool difficulty endpoint is temporarily unavailable', async () => {
      const hashrate = {
        hashrates: [{ timestamp: 1783162800, avgHashrate: 1_000 }],
        currentHashrate: 1_000,
      }
      mempoolRepository.getDifficulty.mockResolvedValue(null)
      mempoolRepository.getHashrate.mockResolvedValue(hashrate)

      await expect(service.getHashRate()).resolves.toEqual(hashrate)
    })
  })
})
