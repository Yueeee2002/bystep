import type { StatusFilter } from '@/types'
import styles from './FilterBar.module.css'

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '未打卡' },
  { value: 'done', label: '已打卡' },
]

interface StatusFilterProps {
  value: StatusFilter
  onChange: (value: StatusFilter) => void
}

export default function StatusFilterBar({ value, onChange }: StatusFilterProps) {
  return (
    <div className={styles.status} role="tablist" aria-label="按状态筛选">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={`${styles.statusBtn} ${value === option.value ? styles.statusActive : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
