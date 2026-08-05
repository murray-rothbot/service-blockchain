import { Logger } from '@nestjs/common'
import { BlockchainController } from './blockchain.controller'

describe('BlockchainController websocket errors', () => {
  it('registers an error listener and handles upstream connection failures', () => {
    const controller = new BlockchainController({ send: jest.fn() } as any, {} as any)
    const handler = (controller as any).handleWsError
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation()

    expect(Reflect.getMetadata('WebSocketEventMetadata', handler)).toEqual({ event: 'error' })
    expect(() => handler.call(controller, new Error('ETIMEDOUT'))).not.toThrow()
    expect(warn).toHaveBeenCalledWith('Mempool.Space websocket error: ETIMEDOUT')

    warn.mockRestore()
  })
})
