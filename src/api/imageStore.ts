import { makeCoverThumb, processImageFile, processImageFiles, type ProcessedImage } from '@/utils/imageHelper'

type EnvConfig = {
  /** 后端上线后改为 true */
  BACKEND_READY: boolean
  /** 后端接口地址 */
  BASE_API_URL: string
}

export const ENV_CONFIG: EnvConfig = {
  BACKEND_READY: false,
  BASE_API_URL: 'http://localhost:3000',
}

export const UPLOAD_HINT_LOCAL =
  '温馨小记：当前图片暂存浏览器缓存，清理浏览器数据会丢失，可定期在个人中心导出全部手账备份。删除手机相册原图不影响本次查看。'

export const UPLOAD_HINT_BACKEND =
  '温馨小记：照片已在服务端生成独立副本永久存档，可放心删除手机相册原图释放空间。'

export function getUploadHint(): string {
  return ENV_CONFIG.BACKEND_READY ? UPLOAD_HINT_BACKEND : UPLOAD_HINT_LOCAL
}

const uploadToServer = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${ENV_CONFIG.BASE_API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
  const result = (await res.json()) as { code?: number; data?: { url?: string }; msg?: string }
  if (!res.ok || !result.data?.url) {
    throw new Error(result.msg || '图片上传失败')
  }
  return result.data.url
}

export const processImage = async (file: File): Promise<ProcessedImage> => {
  if (!ENV_CONFIG.BACKEND_READY) return processImageFile(file)
  const original = await uploadToServer(file)
  try {
    const thumb = await makeCoverThumb(file)
    return { original, thumb }
  } catch {
    return { original, thumb: original }
  }
}

export const uploadImage = async (file: File): Promise<string> => {
  const processed = await processImage(file)
  return processed.original
}

export interface ImageStore {
  upload(file: File, recordId?: string): Promise<string>
  remove(url: string, recordId?: string): Promise<void>
}

export const imageStore: ImageStore = {
  async upload(file) {
    return uploadImage(file)
  },
  async remove() {
    // 本地模式图片绑定在卡片上；服务端删除接口后续按记录清理。
  },
}

export async function uploadImages(files: File[], recordId?: string): Promise<string[]> {
  const processed = await processImages(files, recordId)
  return processed.map((item) => item.original)
}

export async function processImages(files: File[], _recordId?: string): Promise<ProcessedImage[]> {
  if (ENV_CONFIG.BACKEND_READY) {
    const results: ProcessedImage[] = []
    for (const file of files) {
      results.push(await processImage(file))
    }
    return results
  }
  return processImageFiles(files)
}

export default imageStore
