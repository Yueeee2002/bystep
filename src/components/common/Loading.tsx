import { useUiStore } from '@/store/uiStore'
import styles from './Loading.module.css'

export default function Loading() {
  const busy = useUiStore((state) => state.busy)
  if (!busy) return null

  return (
    <div className={styles.layer} role="status" aria-label="加载中">
      <div className={styles.book} aria-hidden="true">
        <span />
        <span />
      </div>
      <p className={styles.dots}>
        记下<span>.</span>
        <span>.</span>
        <span>.</span>
      </p>
    </div>
  )
}
