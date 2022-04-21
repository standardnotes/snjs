import { FileMemoryCache } from './FileMemoryCache'

describe('file memory cache', () => {
  const createFile = (size: number): Uint8Array => {
    return new TextEncoder().encode('a'.repeat(size))
  }

  it('should add file', () => {
    const cache = new FileMemoryCache(5)
    const file = createFile(1)
    cache.add('123', file)

    expect(cache.get('123')).toEqual(file)
  })

  it('should fail to add file if exceeds maximum', () => {
    const maxSize = 5
    const cache = new FileMemoryCache(maxSize)
    const file = createFile(maxSize + 1)

    expect(cache.add('123', file)).toEqual(false)
  })

  it('should allow filling files up to limit', () => {
    const maxSize = 5
    const cache = new FileMemoryCache(maxSize)

    cache.add('1', createFile(3))
    cache.add('2', createFile(2))

    expect(cache.get('1')).toBeTruthy()
    expect(cache.get('2')).toBeTruthy()
  })

  it('should clear early files when adding new files above limit', () => {
    const maxSize = 5
    const cache = new FileMemoryCache(maxSize)

    cache.add('1', createFile(3))
    cache.add('2', createFile(2))
    cache.add('3', createFile(3))

    expect(cache.get('1')).toBeFalsy()
    expect(cache.get('2')).toBeTruthy()
    expect(cache.get('3')).toBeTruthy()
  })

  it('should remove single file', () => {
    const maxSize = 5
    const cache = new FileMemoryCache(maxSize)

    cache.add('1', createFile(3))
    cache.add('2', createFile(2))

    cache.remove('1')

    expect(cache.get('1')).toBeFalsy()
    expect(cache.get('2')).toBeTruthy()
  })

  it('should clear all files', () => {
    const maxSize = 5
    const cache = new FileMemoryCache(maxSize)

    cache.add('1', createFile(3))
    cache.add('2', createFile(2))
    cache.clear()

    expect(cache.get('1')).toBeFalsy()
    expect(cache.get('2')).toBeFalsy()
  })

  it('should return correct size', () => {
    const cache = new FileMemoryCache(20)

    cache.add('1', createFile(3))
    cache.add('2', createFile(10))

    expect(cache.size).toEqual(13)
  })
})
