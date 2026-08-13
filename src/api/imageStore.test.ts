import { afterEach, describe, expect, it, vi } from 'vitest'
import { ENV_CONFIG, UPLOAD_HINT_BACKEND, UPLOAD_HINT_LOCAL, getUploadHint, uploadImage } from '@/api/imageStore'

describe('imageStore dual mode', () => {
  afterEach(() => {
    ENV_CONFIG.BACKEND_READY = false
    vi.unstubAllGlobals()
  })

  it('shows local cache hint until the server is switched on', () => {
    ENV_CONFIG.BACKEND_READY = false
    expect(getUploadHint()).toBe(UPLOAD_HINT_LOCAL)
    ENV_CONFIG.BACKEND_READY = true
    expect(getUploadHint()).toBe(UPLOAD_HINT_BACKEND)
  })

  it('posts FormData to the local upload API when backend is ready', async () => {
    ENV_CONFIG.BACKEND_READY = true
    class FakeImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 1
      height = 1
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.())
      }
    }
    vi.stubGlobal('Image', FakeImage)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, data: { url: 'http://127.0.0.1:3000/upload/a.jpg' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['x'], 'shop.jpg', { type: 'image/jpeg' })
    await expect(uploadImage(file)).resolves.toBe('http://127.0.0.1:3000/upload/a.jpg')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://localhost:3000/api/upload')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
  })
})
