import { useEffect, useMemo, useState } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { resolveTagColor } from '@/utils/palette'
import type { ITag } from '@/types'
import { TAG_EMPTY_COPY } from '@/utils/tagRules'
import { useConfigStore } from '@/store/configStore'
import styles from './TagPicker.module.css'

interface TagPickerProps {
  tags: ITag[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onManage?: () => void
  slideKey: string
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const index = text.toLowerCase().indexOf(q.toLowerCase())
  if (index < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, index)}
      <mark className={styles.hit}>{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  )
}

export default function TagPicker({ tags, selectedIds, onChange, onManage, slideKey }: TagPickerProps) {
  const extras = useConfigStore((state) => state.customTagColors)
  const [query, setQuery] = useState('')
  const selected = useMemo(
    () => tags.filter((tag) => selectedIds.includes(tag.id)),
    [tags, selectedIds],
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tags
    return tags.filter((tag) => tag.name.toLowerCase().includes(q))
  }, [tags, query])

  useEffect(() => {
    setQuery('')
  }, [slideKey])

  if (tags.length === 0) {
    return (
      <div className={styles.empty} key={slideKey}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3.2" y="2.4" width="11.6" height="13.2" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 6.4h6M6 9.2h4.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
        <p>{TAG_EMPTY_COPY}</p>
        {onManage ? (
          <button type="button" className={styles.emptyLink} onClick={onManage}>
            去添加
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className={styles.wrap} key={slideKey}>
      {selected.length > 0 ? (
        <div className={styles.picked}>
          {selected.map((tag) => {
            const palette = resolveTagColor(tag.color, extras)
            return (
              <button
                key={tag.id}
                type="button"
                className={styles.pill}
                style={{ background: palette.bg, color: palette.fg }}
                onClick={() => onChange(selectedIds.filter((id) => id !== tag.id))}
              >
                {tag.name}
                <span aria-hidden="true">×</span>
              </button>
            )
          })}
        </div>
      ) : null}

      <Combobox
        value={selected}
        by="id"
        onChange={(next) => onChange(next.map((tag) => tag.id))}
        multiple
        onClose={() => setQuery('')}
      >
        <div className={styles.field}>
          <ComboboxInput
            className={styles.search}
            displayValue={() => query}
            placeholder="搜索并选择标签"
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className={styles.caret} aria-label="展开标签">
            ▾
          </ComboboxButton>
        </div>
        <ComboboxOptions anchor="bottom start" className={styles.menu}>
          {filtered.length === 0 ? (
            <div className={styles.none}>没有匹配的标签</div>
          ) : (
            filtered.map((tag, index) => {
              const palette = resolveTagColor(tag.color, extras)
              const active = selectedIds.includes(tag.id)
              return (
                <ComboboxOption
                  key={tag.id}
                  value={tag}
                  className={styles.option}
                  style={{ animationDelay: `${index * 28}ms` }}
                >
                  <i style={{ background: palette.bg }} />
                  <span>
                    <Highlight text={tag.name} query={query} />
                  </span>
                  {active ? <em>✓</em> : null}
                </ComboboxOption>
              )
            })
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}
