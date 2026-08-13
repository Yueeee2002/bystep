import { useMemo } from 'react'
import type { ITag, SortMode } from '@/types'
import { TAG_COLORS } from '@/types'
import { pickRandom, TAG_EMPTY_HINTS } from '@/utils/copy'
import SortMenu from '@/components/Filter/SortMenu'
import styles from './FilterBar.module.css'

interface TagFilterProps {
  tags: ITag[]
  selectedIds: string[]
  sortMode: SortMode
  onToggle: (id: string) => void
  onManage: () => void
  onSortChange: (mode: SortMode) => void
}

export default function TagFilter({
  tags,
  selectedIds,
  sortMode,
  onToggle,
  onManage,
  onSortChange,
}: TagFilterProps) {
  const emptyHint = useMemo(() => pickRandom(TAG_EMPTY_HINTS), [])

  return (
    <div className={styles.tags}>
      <div className={styles.tagMeta}>共 {tags.length} 个分类标签</div>
      <div className={styles.tagRow}>
        <div className={styles.tagScroll}>
          {tags.length === 0 ? (
            <span className={styles.hint}>{emptyHint}</span>
          ) : (
            tags.map((tag) => {
              const palette = TAG_COLORS[tag.color]
              const active = selectedIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`chip ${active ? 'active' : ''}`}
                  style={{
                    background: palette.bg,
                    color: palette.fg,
                    borderColor: active ? 'var(--gold)' : 'transparent',
                  }}
                  onClick={() => onToggle(tag.id)}
                >
                  {tag.name}
                </button>
              )
            })
          )}
        </div>
        <SortMenu value={sortMode} onChange={onSortChange} />
        <button type="button" className={styles.manage} onClick={onManage}>
          管理
        </button>
      </div>
    </div>
  )
}
