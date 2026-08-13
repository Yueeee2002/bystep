import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { SORT_OPTIONS } from '@/types'
import type { SortMode } from '@/types'
import styles from './FilterBar.module.css'

interface SortMenuProps {
  value: SortMode
  onChange: (value: SortMode) => void
}

export default function SortMenu({ value, onChange }: SortMenuProps) {
  const current = SORT_OPTIONS.find((item) => item.value === value) ?? SORT_OPTIONS[0]

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={styles.sortWrap}>
        <ListboxButton className={styles.sortBtn}>
          <span>{current.label}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.2 4.2 6 8l3.8-3.8" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </ListboxButton>
        <ListboxOptions className={styles.sortMenu} anchor="bottom end">
          {SORT_OPTIONS.map((item) => (
            <ListboxOption key={item.value} value={item.value} className={styles.sortOption}>
              {({ selected }) => <span className={selected ? styles.sortOn : ''}>{item.label}</span>}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
