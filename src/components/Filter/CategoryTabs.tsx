import { CATEGORY_META } from '@/types'
import type { CategoryTab } from '@/types'
import styles from './FilterBar.module.css'

interface CategoryTabsProps {
  value: CategoryTab
  onChange: (value: CategoryTab) => void
}

const TABS: { value: CategoryTab; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'catering', label: CATEGORY_META.catering.tab },
  { value: 'other', label: CATEGORY_META.other.tab },
]

export default function CategoryTabs({ value, onChange }: CategoryTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="品类">
      {TABS.map((tab, index) => (
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
