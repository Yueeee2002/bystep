import { useEffect, useRef, useState } from 'react'
import plateSrc from '@/assets/1.png'
import houseSrc from '@/assets/2.jpg'
import { DecorDot, DecorStar } from '@/components/decor/JournalMarks'
import { useConfigStore } from '@/store/configStore'
import styles from './Splash.module.css'

/**
 * 开屏：浅米色遮罩先出，等 1.png 轻食盘加载并淡入完成后，
 * 2.jpg 杂货铺再从右侧滑入，稍作停留后整体渐隐。
 */
const PLATE_IN_MS = 420
const HOUSE_MS = 340
const HOLD_MS = 960
const FADE_MS = 280
const PLATE_WAIT_FALLBACK_MS = 4000

export default function Splash() {
  const motion = useConfigStore((state) => state.motion)
  const [phase, setPhase] = useState<'show' | 'out' | 'done'>('show')
  const [plateReady, setPlateReady] = useState(false)
  const [houseIn, setHouseIn] = useState(false)
  const plateMarked = useRef(false)

  const markPlateReady = () => {
    if (plateMarked.current) return
    plateMarked.current = true
    setPlateReady(true)
  }

  useEffect(() => {
    const img = new Image()
    img.src = houseSrc
  }, [])

  useEffect(() => {
    const fallback = window.setTimeout(markPlateReady, PLATE_WAIT_FALLBACK_MS)
    return () => window.clearTimeout(fallback)
  }, [])

  useEffect(() => {
    if (!plateReady) return
    const wait = motion ? PLATE_IN_MS : 80
    const timer = window.setTimeout(() => setHouseIn(true), wait)
    return () => window.clearTimeout(timer)
  }, [motion, plateReady])

  useEffect(() => {
    if (!houseIn) return
    const fadeAt = motion ? HOUSE_MS + HOLD_MS : 280
    const fade = window.setTimeout(() => setPhase('out'), fadeAt)
    const done = window.setTimeout(() => setPhase('done'), fadeAt + FADE_MS)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(done)
    }
  }, [houseIn, motion])

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
        <img
          className={`${styles.plate} ${plateReady ? styles.plateIn : ''}`.trim()}
          src={plateSrc}
          alt=""
          draggable={false}
          onLoad={markPlateReady}
          ref={(node) => {
            if (node?.complete && node.naturalWidth > 0) markPlateReady()
          }}
        />
        <img
          className={`${styles.house} ${houseIn ? styles.houseIn : ''}`.trim()}
          src={houseSrc}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  )
}
