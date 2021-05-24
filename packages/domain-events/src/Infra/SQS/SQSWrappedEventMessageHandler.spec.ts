import 'reflect-metadata'

import { Logger } from 'winston'

import { DomainEventHandlerInterface } from '../../Domain/Handler/DomainEventHandlerInterface'

import { SQSWrappedEventMessageHandler } from './SQSWrappedEventMessageHandler'

describe('SQSWrappedEventMessageHandler', () => {
  let handler: DomainEventHandlerInterface
  let handlers: Map<string, DomainEventHandlerInterface>
  let logger: Logger
  let wrapperFunction: <T>(name: string, handle: Promise<T>) => Promise<T>

  const createHandler = () => new SQSWrappedEventMessageHandler(handlers, wrapperFunction, logger)

  beforeEach(() => {
    handler = {} as jest.Mocked<DomainEventHandlerInterface>
    handler.handle = jest.fn()

    handlers = new Map([['TEST', handler]])

    wrapperFunction = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
    logger.error = jest.fn()
  })

  it('should handle messages', async () => {
    const sqsMessage = `{
      "Message" : "eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA=="
    }`

    await createHandler().handleMessage(sqsMessage)

    expect(wrapperFunction).toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    await createHandler().handleError(new Error('test'))

    expect(logger.error).toHaveBeenCalled()
  })

  it('should tell if there is no handler for an event', async () => {
    const sqsMessage = `{
      "Message" : "eJyrViqpLEhVslIKcQ0OMVLSUSpIrMzJT0xRsqpWSsvPB0okJRYp1dYCAABHDLY="
    }`

    await createHandler().handleMessage(sqsMessage)

    expect(logger.debug).toHaveBeenCalledWith('Event handler for event type TEST2 does not exist')

    expect(handler.handle).not.toHaveBeenCalled()
  })
})
