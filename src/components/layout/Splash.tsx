import { useEffect, useRef, useState } from 'react'
import plateSrc from '@/assets/1.png'
import houseSrc from '@/assets/2.jpg'
import { DecorDot, DecorStar } from '@/components/decor/JournalMarks'
import Logo from '@/components/layout/Logo'
import { useConfigStore } from '@/store/configStore'
import styles from './Splash.module.css'

/** 与 JournalMarks 手绘星星同一 path，保证粒子和页面装饰统一。 */
const STAR_PATH =
  'M12 2.2c.55 3.4 1.7 6.1 4.9 9.8-3.2 3.6-4.35 6.4-4.9 9.8-.55-3.4-1.7-6.2-4.9-9.8C10.3 8.3 11.45 5.6 12 2.2Z'

const BG_ONLY_MS = 400
const FADE_IN_MS = 700
const LIVE_AT_MS = BG_ONLY_MS + FADE_IN_MS
const HOUSE_IN_AT_MS = 1600
const STAR_MS = 450
const CLICK_COOLDOWN_MS = 500
const FADE_OUT_MS = 360
const PLATE_WAIT_FALLBACK_MS = 4000

function spawnBurstStars(layer: HTMLElement, x: number, y: number) {
  const count = 2 + Math.floor(Math.random() * 2)
  const base = Math.random() * Math.PI * 2
  for (let i = 0; i < count; i += 1) {
    const size = 8 + Math.random() * 6
    const angle = base + (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.75
    const dist = 20 + Math.random() * 25
    const star = document.createElement('span')
    star.className = styles.burstStar
    star.style.width = `${size}px`
    star.style.height = `${size}px`
    star.style.left = `${x - size / 2}px`
    star.style.top = `${y - size / 2}px`
    star.style.setProperty('--tx', `${Math.cos(angle) * dist}px`)
    star.style.setProperty('--ty', `${Math.sin(angle) * dist}px`)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('aria-hidden', 'true')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', STAR_PATH)
    svg.appendChild(path)
    star.appendChild(svg)
    const destroy = () => star.remove()
    star.addEventListener('animationend', destroy)
    window.setTimeout(destroy, STAR_MS + 80)
    layer.appendChild(star)
  }
}

/**
 * v1.10 开屏：沿用参考图拼贴（轻食盘 + 小屋同框）。
 * 轻食盘先淡入并保持；小屋 1600ms 起 600ms 缓缓浮现，不替换轻食盘。
 * 仅点击可进入主页。
 */
export default function Splash() {
  const motion = useConfigStore((state) => state.motion)
  const layerRef = useRef<HTMLDivElement>(null)
  const starLayerRef = useRef<HTMLDivElement>(null)
  const plateMarked = useRef(false)
  const leaveScheduled = useRef(false)
  const clickLockedUntil = useRef(0)
  const leaveTimers = useRef<number[]>([])

  const [phase, setPhase] = useState<'show' | 'out' | 'done'>('show')
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [live, setLive] = useState(false)
  const [houseShown, setHouseShown] = useState(false)
  const [pressed, setPressed] = useState(false)

  const markPlateReady = () => {
    if (plateMarked.current) return
    plateMarked.current = true
    setReady(true)
  }

  const beginLeave = (delay: number) => {
    if (leaveScheduled.current) return
    leaveScheduled.current = true
    leaveTimers.current.push(window.setTimeout(() => setPhase('out'), delay))
    leaveTimers.current.push(window.setTimeout(() => setPhase('done'), delay + FADE_OUT_MS))
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
    if (!ready) return
    if (!motion) {
      setEntered(true)
      setLive(true)
      setHouseShown(true)
      return
    }
    const fade = window.setTimeout(() => setEntered(true), BG_ONLY_MS)
    const hint = window.setTimeout(() => setLive(true), LIVE_AT_MS)
    const house = window.setTimeout(() => setHouseShown(true), HOUSE_IN_AT_MS)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(hint)
      window.clearTimeout(house)
    }
  }, [motion, ready])

  useEffect(() => {
    return () => {
      leaveTimers.current.forEach((id) => window.clearTimeout(id))
      leaveTimers.current = []
    }
  }, [])

  const onEnterAt = (clientX: number, clientY: number) => {
    if (phase !== 'show' || leaveScheduled.current) return
    const now = Date.now()
    if (now < clickLockedUntil.current) return
    clickLockedUntil.current = now + CLICK_COOLDOWN_MS

    if (motion) {
      const layer = layerRef.current
      const starLayer = starLayerRef.current
      if (layer && starLayer) {
        const rect = layer.getBoundingClientRect()
        spawnBurstStars(starLayer, clientX - rect.left, clientY - rect.top)
      }
      setPressed(true)
      leaveTimers.current.push(window.setTimeout(() => setPressed(false), 180))
      beginLeave(STAR_MS)
      return
    }

    beginLeave(0)
  }

  if (phase === 'done') return null

  return (
    <div
      ref={layerRef}
      className={`${styles.layer} ${phase === 'out' ? styles.out : ''} ${motion ? '' : styles.still}`.trim()}
      role="status"
      aria-label="留步开屏，点击开启手账"
      onPointerDown={(event) => onEnterAt(event.clientX, event.clientY)}
      onClick={(event) => onEnterAt(event.clientX, event.clientY)}
      onTouchStart={(event) => {
        const touch = event.changedTouches[0]
        if (touch) onEnterAt(touch.clientX, touch.clientY)
      }}
    >
      <div ref={starLayerRef} className={styles.starLayer} aria-hidden="true" />
      <div className={`${styles.brand} ${entered ? styles.fadeIn : ''}`.trim()}>
        <Logo className={styles.logo} />
        <span className={styles.wordmark}>留步</span>
      </div>
      <div className={styles.stage}>
        <span className={`${styles.deco} ${entered ? styles.fadeIn : ''}`.trim()} aria-hidden="true">
          <DecorStar tone="mint" delay="0s" className={styles.s1} />
          <DecorStar tone="mint" delay="0.5s" className={styles.s2} />
          <DecorStar tone="gold" delay="1s" className={styles.s3} />
          <DecorDot size={4} delay="0.3s" className={styles.d1} />
          <DecorDot size={2} tone="cream" delay="0.9s" className={styles.d2} />
        </span>
        <div className={`${styles.floatWrap} ${entered ? styles.floating : ''}`.trim()}>
          <div className={`${styles.pressWrap} ${pressed ? styles.pressed : ''}`.trim()}>
            <div className={`${styles.plateWrap} ${entered ? styles.plateIn : ''}`.trim()}>
              <img
                className={styles.plate}
                src={plateSrc}
                alt=""
                draggable={false}
                onLoad={markPlateReady}
                ref={(node) => {
                  if (node?.complete && node.naturalWidth > 0) markPlateReady()
                }}
              />
            </div>
            <img
              className={`${styles.house} ${houseShown ? styles.houseIn : ''}`.trim()}
              src={houseSrc}
              alt=""
              draggable={false}
            />
          </div>
        </div>
      </div>
      <p className={`${styles.hint} ${live ? styles.hintIn : ''}`.trim()}>点击开启手账</p>
    </div>
  )
}
