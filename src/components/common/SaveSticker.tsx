import styles from './SaveSticker.module.css'

export default function SaveSticker({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className={styles.sticker} aria-hidden="true">
      ✓
    </span>
  )
}
