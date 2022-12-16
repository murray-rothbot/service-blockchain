import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { BlockRequestDto, BlockResponseDto } from './../dto'
import { BlockchainController } from './../blockchain.controller'
import { BlockchainService } from './../blockchain.service'

import { MempoolSpaceRepository } from './../repositories'

const RepositoryMock = {}

describe('BlockchainController', () => {
  let controller: BlockchainController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [
        BlockchainService,
        {
          provide: MempoolSpaceRepository,
          useValue: RepositoryMock,
        },
      ],
      imports: [HttpModule],
    }).compile()

    controller = module.get<BlockchainController>(BlockchainController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
