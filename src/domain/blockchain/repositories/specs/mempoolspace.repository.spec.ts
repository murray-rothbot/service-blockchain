import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { IBlockRepository } from '../../interfaces'
import { MempoolSpaceRepository } from '../mempoolspace.repository'

describe('mempool.space repository', () => {
  let repository: IBlockRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MempoolSpaceRepository],
      imports: [HttpModule, ConfigModule],
    }).compile()

    repository = module.get<IBlockRepository>(MempoolSpaceRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('get block', () => {
    it(`should return block by hash`, async () => {
      const { height } = await repository.getBlock({
        hash: '00000000000000000024fb37364cbf81fd49cc2d51c09c75c35433c3a1945d04',
      })
      expect(height).toBe(500000)
    })

    it(`should return block by height`, async () => {
      const { id: hash } = await repository.getBlock({
        height: 500000,
      })
      expect(hash).toBe('00000000000000000024fb37364cbf81fd49cc2d51c09c75c35433c3a1945d04')
    })

    it(`should return current block, when no hash is informed`, async () => {
      const block = await repository.getBlock({ hash: null })
      const now = Date.now() / 1000
      expect(Math.abs(block.timestamp - now)).toBeLessThan(6000) // 100 minutes
    })
  })
})
