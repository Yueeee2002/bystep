import { describe, expect, it } from 'vitest'
import { detectDeviceViewport, resolveViewport } from '@/utils/viewport'

describe('viewport', () => {
  it('treats phone user agents as mobile and desktop as pc', () => {
    expect(detectDeviceViewport('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('mobile')
    expect(detectDeviceViewport('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36')).toBe(
      'mobile',
    )
    expect(detectDeviceViewport('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('pc')
  })

  it('lets a manual preference override auto detection', () => {
    expect(resolveViewport('mobile', 'Mozilla/5.0 (Macintosh)')).toBe('mobile')
    expect(resolveViewport('pc', 'Mozilla/5.0 (iPhone)')).toBe('pc')
    expect(resolveViewport('auto', 'Mozilla/5.0 (iPhone)')).toBe('mobile')
  })
})
