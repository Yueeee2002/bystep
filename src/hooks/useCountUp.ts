import { useEffect, useState } from 'react'
import { useConfigStore } from '@/store/configStore'

export default function useCountUp(value: number, duration = 560) {
  const motion = useConfigStore((state) => state.motion)
  const [shown, setShown] = useState(motion ? 0 : value)

  useEffect(() => {
    if (!motion) {
      setShown(value)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setShown(Math.round(value * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, motion])

  return shown
}
