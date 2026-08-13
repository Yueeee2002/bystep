import { useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'
import styles from './KeyHint.module.css'

export default function KeyHint() {
  const hint = useUiStore((state) => state.keyHint)
  const clearKeyHint = useUiStore((state) => state.clearKeyHint)

  useEffect(() => {
    if (!hint) return
    const timer = window.setTimeout(clearKeyHint, 1200)
    return () => window.clearTimeout(timer)
  }, [hint, clearKeyHint])

  if (!hint) return null
  return <div className={styles.hint}>{hint}</div>
}
