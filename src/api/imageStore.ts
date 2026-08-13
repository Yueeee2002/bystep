import { compressImageToBase64 } from '@/utils/imageHelper'

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

/**
 * 过渡期：前端本地独立副本（压缩 JPEG Base64）。
 * 不用 Blob URL：刷新或清缓存后无法从 localStorage 还原。
 */
const localTempUpload = async (file: File): Promise<string> => {
  return compressImageToBase64(file)
}

export const uploadImage = async (file: File): Promise<string> => {
  if (ENV_CONFIG.BACKEND_READY) {
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

  return localTempUpload(file)
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
  const results: string[] = []
  for (const file of files) {
    results.push(await imageStore.upload(file, recordId))
  }
  return results
}

export default imageStore
