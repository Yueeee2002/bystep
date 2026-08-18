import { useMemo } from 'react'
import { DecorCatBread, DecorClover, DecorDot } from '@/components/decor/JournalMarks'
import styles from './HomeCornerDoodle.module.css'

interface Speck {
  left: number
  bottom: number
  rotate: number
  scale: number
}

function scatter(count: number, seed: number): Speck[] {
  const bits: Speck[] = []
  let cursor = (seed % 97) + 1
  const next = () => {
    cursor = (cursor * 17 + 31) % 97
    return cursor / 97
  }
  for (let i = 0; i < count; i += 1) {
    bits.push({
      left: 6 + next() * 72,
      bottom: 8 + next() * 58,
      rotate: -24 + next() * 48,
      scale: 0.55 + next() * 0.4,
    })
  }
  return bits
}

/** 全部 Tab 右下角一小块手绘点缀，不参与点击、不盖住卡片。 */
export default function HomeCornerDoodle() {
  const specks = useMemo(
    () => ({
      clovers: scatter(2 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 97)),
      dots: scatter(3 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 97)),
    }),
    [],
  )

  return (
    <div className={styles.patch} aria-hidden="true">
      {specks.clovers.map((speck, index) => (
        <span
          key={`clover-${index}`}
          className={styles.speck}
          style={{
            left: `${speck.left}%`,
            bottom: `${speck.bottom}%`,
            transform: `rotate(${speck.rotate}deg) scale(${speck.scale})`,
          }}
        >
          <DecorClover delay={`${index * 0.4}s`} />
        </span>
      ))}
      {specks.dots.map((speck, index) => (
        <span
          key={`dot-${index}`}
          className={styles.speck}
          style={{
            left: `${speck.left}%`,
            bottom: `${speck.bottom}%`,
          }}
        >
          <DecorDot size={index % 2 === 0 ? 4 : 2} tone={index > 1 ? 'cream' : 'mocha'} delay={`${index * 0.3}s`} />
        </span>
      ))}
      <DecorCatBread className={styles.cat} delay="0.2s" />
    </div>
  )
}
