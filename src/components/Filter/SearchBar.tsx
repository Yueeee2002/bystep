import { useEffect, useState } from 'react'
import styles from './FilterBar.module.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timer = window.setTimeout(() => onChange(draft), 180)
    return () => window.clearTimeout(timer)
  }, [draft, onChange])

  return (
    <label className={styles.search}>
      <span className="sr-only">搜索</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        value={draft}
        placeholder="搜索店名、地址、备注、心得、标签"
        onChange={(event) => setDraft(event.target.value)}
      />
    </label>
  )
}
