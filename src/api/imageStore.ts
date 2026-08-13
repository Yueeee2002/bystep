import { compressImageToBase64 } from '@/utils/imageHelper'

/** 图片存储适配器：V1.1 本地独立副本；后续可替换为 OSS 直传。 */

export interface ImageStore {
  upload(file: File, recordId?: string): Promise<string>
  remove(url: string, recordId?: string): Promise<void>
}

export const imageStore: ImageStore = {
  async upload(file) {
    return compressImageToBase64(file)
  },
  async remove() {
    // 图片以独立副本绑定在卡片上，删除卡片时一并解除引用。
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
