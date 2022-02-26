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

export function getFileMetadata(file: File): { name: string; ext: string } {
  const pattern = /(?:\.([^.]+))?$/
  const extMatches = pattern.exec(file.name)
  const ext = (extMatches?.[1] as string) || ''
  const name = file.name.split('.')[0]

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