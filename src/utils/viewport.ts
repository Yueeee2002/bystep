import type { ViewportMode } from '@/types'

const PHONE_UA = /Mobile|Android.+Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i

export function detectDeviceViewport(ua = typeof navigator === 'undefined' ? '' : navigator.userAgent): ViewportMode {
  return PHONE_UA.test(ua) ? 'mobile' : 'pc'
}

export function resolveViewport(preference: 'auto' | ViewportMode, ua?: string): ViewportMode {
  if (preference === 'pc' || preference === 'mobile') return preference
  return detectDeviceViewport(ua)
}
