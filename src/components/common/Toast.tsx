import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useUiStore } from '@/store/uiStore'
import styles from './Toast.module.css'

export default function Toast() {
  const toast = useUiStore((state) => state.toast)
  const clearToast = useUiStore((state) => state.clearToast)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!toast) return
    setLeaving(false)
    const fade = window.setTimeout(() => setLeaving(true), 2500)
    const timer = window.setTimeout(clearToast, 2900)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(timer)
    }
  }, [toast, clearToast])

  if (!toast) return null

  return createPortal(
    <div className={styles.hold} role="status">
      <div className={`${styles.toast} ${styles[toast.type]} ${leaving ? styles.out : ''}`}>{toast.message}</div>
    </div>,
    document.body,
  )
}
