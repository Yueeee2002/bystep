const AVATAR_EDGE = 480
const AVATAR_QUALITY = 0.82
const THUMB_LONG_EDGE = 720
const THUMB_QUALITY = 0.9
export const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPT_TYPES = new Set(['image/jpeg', 'image/png', 'image/jpg'])

export function isAcceptedImage(file: File): boolean {
  if (ACCEPT_TYPES.has(file.type)) return true
  const name = file.name.toLowerCase()
  return name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')
}

export function assertImageFile(file: File): void {
  if (!isAcceptedImage(file)) {
    throw new Error('仅支持 JPG / PNG 图片')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('单张图片请控制在 10MB 以内')
  }
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

function drawCoverThumb(img: HTMLImageElement): string {
  const landscape = img.width >= img.height
  const targetW = landscape ? THUMB_LONG_EDGE : Math.round((THUMB_LONG_EDGE * 3) / 4)
  const targetH = landscape ? Math.round((THUMB_LONG_EDGE * 3) / 4) : THUMB_LONG_EDGE
  const scale = Math.max(targetW / img.width, targetH / img.height)
  const sw = targetW / scale
  const sh = targetH / scale
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法处理图片')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetW, targetH)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH)
  return canvas.toDataURL('image/jpeg', THUMB_QUALITY)
}

export async function readOriginalDataUrl(file: File): Promise<string> {
  assertImageFile(file)
  return readAsDataUrl(file)
}

export async function makeCoverThumb(source: File | string): Promise<string> {
  const dataUrl = typeof source === 'string' ? source : await readAsDataUrl(source)
  const img = await loadImage(dataUrl)
  return drawCoverThumb(img)
}

/** 头像仍需压到较小体积，探店配图请用 processImageFile。 */
export async function compressImageToBase64(file: File): Promise<string> {
  assertImageFile(file)
  const dataUrl = await readAsDataUrl(file)
  const img = await loadImage(dataUrl)
  const scale = Math.min(1, AVATAR_EDGE / Math.max(img.width, img.height))
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
  return canvas.toDataURL('image/jpeg', AVATAR_QUALITY)
}

export interface ProcessedImage {
  original: string
  thumb: string
}

export async function processImageFile(file: File): Promise<ProcessedImage> {
  const original = await readOriginalDataUrl(file)
  const thumb = await makeCoverThumb(file)
  return { original, thumb }
}

export async function processImageFiles(files: File[]): Promise<ProcessedImage[]> {
  const accepted = Array.from(files).filter(isAcceptedImage)
  if (accepted.length === 0) {
    throw new Error('请选择 JPG 或 PNG 图片')
  }
  const results: ProcessedImage[] = []
  for (const file of accepted) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('单张图片请控制在 10MB 以内')
    }
    results.push(await processImageFile(file))
  }
  return results
}
