import styles from './Stars.module.css'

interface StarsProps {
  value: number
  onChange?: (value: number) => void
  small?: boolean
}

export default function Stars({ value, onChange, small }: StarsProps) {
  return (
    <div className={`${styles.row} ${small ? styles.small : ''}`} role="img" aria-label={`期待值 ${value} 星`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= value ? styles.on : ''}`}
          aria-label={`${star} 星`}
          onClick={(event) => {
            event.stopPropagation()
            onChange?.(star === value ? 0 : star)
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.2 14.4 9l6.1.5-4.7 3.9 1.5 5.9L12 16.2 6.7 19.3l1.5-5.9L3.5 9.5 9.6 9 12 3.2Z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
