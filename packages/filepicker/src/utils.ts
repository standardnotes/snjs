export async function readFile(file: File): Promise<Uint8Array> {
  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  return new Promise((resolve) => {
    reader.onload = (readerEvent) => {
      const target = readerEvent.target as FileReader
      const content = target.result as ArrayBuffer
      resolve(new Uint8Array(content))
    }
  })
}

export function parseFileName(fileName: string): {
  name: string
  ext: string
} {
  const pattern = /(?:\.([^.]+))?$/
  const extMatches = pattern.exec(fileName)
  const ext = extMatches?.[1] || ''
  const name = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName

  return { name, ext }
}

export function saveFile(name: string, bytes: Uint8Array): void {
  const link = document.createElement('a')
  const blob = new Blob([bytes], {
    type: 'text/plain;charset=utf-8',
  })
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', name)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(link.href)
}

const BYTES_IN_ONE_KILOBYTE = 1_000
const BYTES_IN_ONE_MEGABYTE = 1_000_000
const BYTES_IN_ONE_GIGABYTE = 1_000_000_000

export function formatSizeToReadableString(bytes: number): string {
  let size = bytes
  let unit = 'B'
  if (bytes >= BYTES_IN_ONE_GIGABYTE) {
    size = bytes / BYTES_IN_ONE_GIGABYTE
    unit = 'GB'
  } else if (bytes >= BYTES_IN_ONE_MEGABYTE) {
    size = bytes / BYTES_IN_ONE_MEGABYTE
    unit = 'MB'
  } else if (bytes >= BYTES_IN_ONE_KILOBYTE) {
    size = bytes / BYTES_IN_ONE_KILOBYTE
    unit = 'KB'
  }
  return `${Number.isInteger(size) ? size : size.toFixed(2)} ${unit}`
}
