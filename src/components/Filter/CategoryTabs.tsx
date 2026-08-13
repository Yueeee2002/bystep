import { useConfigStore } from '@/store/configStore'
import type { CategoryTab } from '@/types'
import styles from './FilterBar.module.css'

interface CategoryTabsProps {
  value: CategoryTab
  onChange: (value: CategoryTab) => void
}

export default function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  const labels = useConfigStore((state) => state.categoryLabels)
  const tabs: { value: CategoryTab; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'catering', label: labels.catering },
    { value: 'other', label: labels.other },
  ]

  return (
    <nav className={styles.tabs} aria-label="品类">
      {tabs.map((tab, index) => (
        <span key={tab.value} className={styles.tabWrap}>
          {index > 0 ? <span className={styles.dot}>·</span> : null}
          <button
            type="button"
            className={`${styles.tab} ${value === tab.value ? styles.tabOn : ''}`}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        </span>
      ))}
    </nav>
  )
}
