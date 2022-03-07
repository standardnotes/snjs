import { formatSizeToReadableString, parseFileName } from './utils'

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

  describe('formatSizeToReadableString', () => {
    it('should show as bytes if less than 1KB', () => {
      const size = 999

      const formattedSize = formatSizeToReadableString(size)

      expect(formattedSize).toBe('999 B')
    })

    it('should show as bytes if more than or equal to 1KB', () => {
      const size = 1_000

      const formattedSize = formatSizeToReadableString(size)

      expect(formattedSize).toBe('1 KB')
    })

    it('should show as bytes if more than or equal to 1MB', () => {
      const size = 1_000_000

      const formattedSize = formatSizeToReadableString(size)

      expect(formattedSize).toBe('1 MB')
    })

    it('should only show fixed-point notation if calculated size is not an integer', () => {
      const size1 = 1_000_000
      const size2 = 1_500_000

      const formattedSize1 = formatSizeToReadableString(size1)
      const formattedSize2 = formatSizeToReadableString(size2)

      expect(formattedSize1).toBe('1 MB')
      expect(formattedSize2).toBe('1.50 MB')
    })
  })
})
