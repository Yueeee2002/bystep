import { useEffect, useState } from 'react'
import JournalScene from '@/components/decor/JournalScene'
import { useConfigStore } from '@/store/configStore'
import styles from './Splash.module.css'

const SPLASH_KEY = 'liubu_splash_seen'

export default function Splash() {
  const motion = useConfigStore((state) => state.motion)
  const [phase, setPhase] = useState<'show' | 'out' | 'done'>(() => {
    try {
      if (sessionStorage.getItem(SPLASH_KEY) === '1') return 'done'
    } catch {
      /* ignore */
    }
    return 'show'
  })

  useEffect(() => {
    if (phase === 'done') return
    if (!motion) {
      try {
        sessionStorage.setItem(SPLASH_KEY, '1')
      } catch {
        /* ignore */
      }
      setPhase('done')
      return
    }
    const fade = window.setTimeout(() => setPhase('out'), 1700)
    const done = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SPLASH_KEY, '1')
      } catch {
        /* ignore */
      }
      setPhase('done')
    }, 2200)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
    }
    // 只在首次挂载 / 动效开关变化时走一遍，避免 phase 变化重置计时
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion])

  if (phase === 'done') return null

  return (
    <div className={`${styles.layer} ${phase === 'out' ? styles.out : ''}`} role="status" aria-label="留步开屏">
      <JournalScene kind="splash" />
      <p className={styles.copy}>留步</p>
      <span className={styles.sub}>把种草的店，轻轻收好</span>
    </div>
  )
}
