import { describe, expect, it } from 'vitest'
import { assertImageFile, MAX_FILE_SIZE } from '@/utils/imageHelper'

describe('imageHelper size gate', () => {
  it('allows jpg/png under 10MB', () => {
    const file = new File([new Uint8Array(16)], 'shop.jpg', { type: 'image/jpeg' })
    expect(() => assertImageFile(file)).not.toThrow()
  })

  it('rejects files over 10MB without compressing pixels', () => {
    const file = new File([new Uint8Array(MAX_FILE_SIZE + 1)], 'huge.jpg', { type: 'image/jpeg' })
    expect(() => assertImageFile(file)).toThrow('单张图片请控制在 10MB 以内')
  })

  it('rejects unsupported types', () => {
    const file = new File([new Uint8Array(16)], 'note.gif', { type: 'image/gif' })
    expect(() => assertImageFile(file)).toThrow('仅支持 JPG / PNG 图片')
  })
})
