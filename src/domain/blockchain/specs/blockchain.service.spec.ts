import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { BlockchainService } from './../blockchain.service'

import { MempoolSpaceRepository } from './../repositories'

describe('BlockchainService', () => {
  let service: BlockchainService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService, MempoolSpaceRepository],
      imports: [HttpModule],
    }).compile()

    service = module.get<BlockchainService>(BlockchainService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
