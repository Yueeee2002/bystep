import { useConfigStore } from '@/store/configStore'
import type { CategoryGroup } from '@/types'
import styles from './CategoryRadios.module.css'

interface CategoryRadiosProps {
  value: CategoryGroup
  onChange: (value: CategoryGroup) => void
}

export default function CategoryRadios({ value, onChange }: CategoryRadiosProps) {
  const labels = useConfigStore((state) => state.categoryLabels)
  const keys: CategoryGroup[] = ['catering', 'other']
  return (
    <div className={styles.radios}>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          className={`${styles.radio} ${value === key ? styles.radioOn : ''}`}
          onClick={() => onChange(key)}
        >
          <i className={styles.mark} aria-hidden="true" />
          {labels[key]}
        </button>
      ))}
    </div>
  )
}
