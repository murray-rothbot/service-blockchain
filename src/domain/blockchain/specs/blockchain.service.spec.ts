import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { BlockchainService } from './../blockchain.service'

import { MempoolSpaceRepository } from './../repositories'

const current_height = 1e6

const RepositoryMock = {
  // Simulates an blockchain that started at Unix Epoch
  async getBlock({ hash, height }) {
    if (hash) {
      height = +hash.substring(4)
    } else if (!height) {
      height = current_height
    }

    if (height > current_height) {
      return null
    }

    if (!hash) {
      hash = `HASH${height}`
    }

    return { hash, height, timestamp: height * 6e2 }
  },
}

describe('BlockchainService', () => {
  let service: BlockchainService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: MempoolSpaceRepository,
          useValue: RepositoryMock,
        },
      ],
      imports: [HttpModule],
    }).compile()

    service = module.get<BlockchainService>(BlockchainService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('block2time', () => {
    it('should return current block timestamp when no hash and no height are provided', async () => {
      const { height, in_future } = await service.getBlockTime({})
      expect(height).toBe(current_height)
      expect(in_future).toBe(false)
    })
    it('should return past block timestamp when hash is provided', async () => {
      const test_height = current_height - 1
      const test_hash = `HASH${test_height}`

      const { height, in_future } = await service.getBlockTime({ hash: test_hash })
      expect(height).toBe(test_height)
      expect(in_future).toBe(false)
    })
    it('should return past block timestamp when past height is provided', async () => {
      const test_height = current_height - 1

      const { height, in_future } = await service.getBlockTime({ height: test_height })
      expect(height).toBe(test_height)
      expect(in_future).toBe(false)
    })
    it('should return future block timestamp estimation when height > current height', async () => {
      const test_height = current_height + 1

      const { height, in_future } = await service.getBlockTime({ height: test_height })
      expect(height).toBe(test_height)
      expect(in_future).toBe(true)
    })
  })
})
