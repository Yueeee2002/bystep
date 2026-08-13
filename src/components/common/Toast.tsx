import { useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'
import styles from './Toast.module.css'

export default function Toast() {
  const toast = useUiStore((state) => state.toast)
  const clearToast = useUiStore((state) => state.clearToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(clearToast, 2400)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="status">
      {toast.message}
    </div>
  )
}
