import { parseFileName } from './utils'

describe('utils', () => {
  describe('parseFileName', () => {
    it('should parse regular filenames', () => {
      const fileName = 'test.txt'

      const { name, ext } = parseFileName(fileName)

      expect(name).toBe('test')
      expect(ext).toBe('txt')
    })

    it('should parse filenames with multiple dots', () => {
      const fileName = 'Screen Shot 2022-03-06 at 12.13.32 PM.png'

      const { name, ext } = parseFileName(fileName)

      expect(name).toBe('Screen Shot 2022-03-06 at 12.13.32 PM')
      expect(ext).toBe('png')
    })

    it('should parse filenames without extensions', () => {
      const fileName = 'extensionless'

      const { name, ext } = parseFileName(fileName)

      expect(name).toBe('extensionless')
      expect(ext).toBe('')
    })
  })
})
