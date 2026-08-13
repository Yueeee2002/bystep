const MAX_EDGE = 720
const JPEG_QUALITY = 0.72
const MAX_FILE_SIZE = 12 * 1024 * 1024
const ACCEPT_TYPES = new Set(['image/jpeg', 'image/png', 'image/jpg'])

export function isAcceptedImage(file: File): boolean {
  if (ACCEPT_TYPES.has(file.type)) return true
  const name = file.name.toLowerCase()
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片解析失败'))
    img.src = src
  })
}

export async function compressImageToBase64(file: File): Promise<string> {
  if (!isAcceptedImage(file)) {
    throw new Error('仅支持 JPG / PNG 图片')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('单张图片请控制在 12MB 以内')
  }

  const dataUrl = await readAsDataUrl(file)
  const img = await loadImage(dataUrl)
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法处理图片')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

export async function compressImages(files: File[]): Promise<string[]> {
  const accepted = Array.from(files).filter(isAcceptedImage)
  if (accepted.length === 0) {
    throw new Error('请选择 JPG 或 PNG 图片')
  }
  const results: string[] = []
  for (const file of accepted) {
    results.push(await compressImageToBase64(file))
  }
  return results
}
