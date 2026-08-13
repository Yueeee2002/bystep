import { CATEGORY_META } from '@/types'
import type { CategoryGroup } from '@/types'
import styles from './CategoryRadios.module.css'

interface CategoryRadiosProps {
  value: CategoryGroup
  onChange: (value: CategoryGroup) => void
}

export default function CategoryRadios({ value, onChange }: CategoryRadiosProps) {
  return (
    <div className={styles.radios}>
      {(Object.keys(CATEGORY_META) as CategoryGroup[]).map((key) => (
        <button
          key={key}
          type="button"
          className={`${styles.radio} ${value === key ? styles.radioOn : ''}`}
          onClick={() => onChange(key)}
        >
          <i className={styles.mark} aria-hidden="true" />
          {CATEGORY_META[key].radio}
        </button>
      ))}
    </div>
  )
}
