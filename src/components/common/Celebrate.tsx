import { useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'
import styles from './Celebrate.module.css'

export default function Celebrate() {
  const kind = useUiStore((state) => state.celebrate)
  const clearCelebrate = useUiStore((state) => state.clearCelebrate)

  useEffect(() => {
    if (!kind) return
    const timer = window.setTimeout(clearCelebrate, 1100)
    return () => window.clearTimeout(timer)
  }, [kind, clearCelebrate])

  if (!kind) return null

  const marks = kind === 'clover' ? ['🍀', '🍀', '🍀', '🍀', '🍀', '🍀'] : ['✦', '✧', '✦', '✧', '✦', '✧', '✦']

  return (
    <div className={styles.layer} aria-hidden="true">
      {marks.map((mark, index) => (
        <span key={`${mark}-${index}`} className={styles.bit} style={{ left: `${10 + index * 12}%`, animationDelay: `${index * 40}ms` }}>
          {mark}
        </span>
      ))}
    </div>
  )
}
