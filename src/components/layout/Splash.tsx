import { useEffect, useState } from 'react'
import plateSrc from '@/assets/1.png'
import houseSrc from '@/assets/2.jpg'
import { DecorDot, DecorStar } from '@/components/decor/JournalMarks'
import { useConfigStore } from '@/store/configStore'
import styles from './Splash.module.css'

/**
 * 开屏用用户原图：1.png 轻食盘，2.jpg 杂货铺。
 * 0.00s 浅米色遮罩 + 轻食盘缓入
 * 0.50s 小屋从右侧滑入，停在盘子右下方
 * 到位后停留约 0.72s，1.50s 起整体渐隐
 */
const HUT_DELAY_MS = 500
const HUT_MS = 280
const HOLD_MS = 720
const FADE_MS = 220
const FADE_AT = HUT_DELAY_MS + HUT_MS + HOLD_MS
const DONE_AT = FADE_AT + FADE_MS

export default function Splash() {
  const motion = useConfigStore((state) => state.motion)
  const [phase, setPhase] = useState<'show' | 'out' | 'done'>('show')

  useEffect(() => {
    const fadeAt = motion ? FADE_AT : 420
    const doneAt = motion ? DONE_AT : 620
    const fade = window.setTimeout(() => setPhase('out'), fadeAt)
    const done = window.setTimeout(() => setPhase('done'), doneAt)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
    }
  }, [motion])

  if (phase === 'done') return null

  return (
    <div
      className={`${styles.layer} ${phase === 'out' ? styles.out : ''} ${motion ? '' : styles.still}`.trim()}
      role="status"
      aria-label="留步开屏"
    >
      <div className={styles.stage}>
        <span className={styles.deco} aria-hidden="true">
          <DecorStar tone="mint" delay="0s" className={styles.s1} />
          <DecorStar tone="mint" delay="0.6s" className={styles.s2} />
          <DecorDot size={4} delay="0.2s" className={styles.d1} />
          <DecorDot size={2} tone="cream" delay="0.9s" className={styles.d2} />
          <DecorDot size={6} delay="1.1s" className={styles.d3} />
        </span>
        <img className={styles.plate} src={plateSrc} alt="" draggable={false} />
        <img className={styles.house} src={houseSrc} alt="" draggable={false} />
      </div>
    </div>
  )
}
