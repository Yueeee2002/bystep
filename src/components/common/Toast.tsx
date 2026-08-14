import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useUiStore } from '@/store/uiStore'
import styles from './Toast.module.css'

export default function Toast() {
  const toast = useUiStore((state) => state.toast)
  const clearToast = useUiStore((state) => state.clearToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(clearToast, 3000)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  return createPortal(
    <div className={`${styles.toast} ${styles[toast.type]}`} role="status">
      {toast.message}
    </div>,
    document.body,
  )
}
