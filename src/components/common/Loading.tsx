import JournalScene from '@/components/decor/JournalScene'
import { useUiStore } from '@/store/uiStore'
import styles from './Loading.module.css'

export default function Loading() {
  const busy = useUiStore((state) => state.busy)
  if (!busy) return null

  return (
    <div className={styles.layer} role="status" aria-label="加载中">
      <JournalScene kind="loading" />
      <p className={styles.copy}>正在整理你的探店手账…</p>
    </div>
  )
}
