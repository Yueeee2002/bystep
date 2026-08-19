import { useEffect, useRef, useState } from 'react'
import plateSrc from '@/assets/1.png'
import houseSrc from '@/assets/2.jpg'
import { DecorDot, DecorStar } from '@/components/decor/JournalMarks'
import Logo from '@/components/layout/Logo'
import { pickBurstStarSize } from '@/components/layout/splashStars'
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
    const size = pickBurstStarSize()
    const angle = base + (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.75
    const dist = 20 + Math.random() * 25
    const star = document.createElement('span')
    star.className = styles.burstStar
    star.style.setProperty('--star-size', `${size}px`)
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

function GrassMark() {
  return (
    <svg className={styles.grass} viewBox="0 0 18 16" aria-hidden="true">
      <path d="M5.2 14.2c.2-4.6-1.4-8.4-3.6-11.2" fill="none" stroke="#8fa57a" strokeWidth="1.15" strokeLinecap="round" />
      <path d="M8.6 14.4c.1-5.2.8-9.2 2.8-12.4" fill="none" stroke="#7d9a6c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11.8 14.2c1.2-4.2 3.4-7.2 6-8.8" fill="none" stroke="#a3b58a" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function TapeKraft({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 18" aria-hidden="true">
      <path
        d="M1.2 4.4c2.2-1.8 6.2.3 10.4-.6 4.6-1 8.2 1.1 13.8.4 5.6-.7 9.6 1.2 15.4.2 2.8-.5 5.6.8 6.4 2.2v8.4c-2.4 1.6-6.2-.3-10.8.5-5 .9-9.2-1.1-14.8-.2-5.2.8-9.4-1.2-14.6-.4-2.8.4-5.6-1-6-2.4V4.4Z"
        fill="#e2d2ae"
      />
    </svg>
  )
}

function TapeDotted({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 48 18" aria-hidden="true">
      <path
        d="M1.4 5c2-1.6 5.8.4 10-.4 4.8-.9 8.4 1 14 .4 5.4-.6 9.8 1.1 15.2.3 2.6-.4 5.4.7 6.2 2v8c-2.2 1.5-6-.2-10.4.6-4.8.8-9-1-14.4-.2-5 .8-9.2-1.1-14.2-.3-2.6.4-5.2-.8-5.6-2.2V5Z"
        fill="#efe6d4"
      />
      <circle cx="10" cy="9.2" r="1.05" fill="#d2c4a8" />
      <circle cx="18.5" cy="8.6" r="1.05" fill="#d2c4a8" />
      <circle cx="27" cy="9.4" r="1.05" fill="#d2c4a8" />
      <circle cx="35.5" cy="8.8" r="1.05" fill="#d2c4a8" />
    </svg>
  )
}

function SwirlMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M15.6 9.4c.2-3.6-2.4-6.4-6-6.4S4 6.2 4.2 9.6c.2 3.2 2.8 5 5.8 4.8 2.2-.1 3.6-1.5 3.5-3.2-.1-1.6-1.4-2.5-2.8-2.4"
        fill="none"
        stroke="#c9b89a"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * v1.12 开屏：拼贴构图保持不变；主图四周少量贴纸点缀；
 * 底部文案改为「点击开启种草日记」+ Step by step...
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
      aria-label="留步开屏，点击开启种草日记"
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
        <div className={`${styles.floatWrap} ${entered ? styles.floating : ''}`.trim()}>
          <div className={`${styles.pressWrap} ${pressed ? styles.pressed : ''}`.trim()}>
            <span className={`${styles.deco} ${entered ? styles.fadeIn : ''}`.trim()} aria-hidden="true">
              <DecorStar tone="mint" className={styles.s1} />
              <DecorStar tone="mint" className={styles.s2} />
              <DecorDot size={4} className={styles.d1} />
              <DecorDot size={2} tone="cream" className={styles.d2} />
              <DecorDot size={2} className={styles.d3} />
              <SwirlMark className={styles.swirl} />
            </span>
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
              <TapeKraft className={styles.plateTape} />
            </div>
            <div className={`${styles.houseWrap} ${houseShown ? styles.houseIn : ''}`.trim()}>
              <img className={styles.house} src={houseSrc} alt="" draggable={false} />
              <TapeDotted className={styles.houseTape} />
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.hint} ${live ? styles.hintIn : ''}`.trim()}>
        <p className={styles.hintMain}>
          <GrassMark />
          点击开启种草日记
        </p>
        <p className={styles.hintSub}>Step by step...</p>
      </div>
    </div>
  )
}
