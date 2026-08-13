import type { ITag } from '@/types'
import styles from './FilterBar.module.css'

interface TagFilterProps {
  tags: ITag[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onManage: () => void
}

export default function TagFilter({ tags, selectedIds, onToggle, onManage }: TagFilterProps) {
  return (
    <div className={styles.tags}>
      <div className={styles.tagScroll}>
        {tags.length === 0 ? (
          <span className={styles.hint}>还没有标签，先去整理一枚吧</span>
        ) : (
          tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`chip ${selectedIds.includes(tag.id) ? 'active' : ''}`}
              onClick={() => onToggle(tag.id)}
            >
              {tag.name}
            </button>
          ))
        )}
      </div>
      <button type="button" className={styles.manage} onClick={onManage}>
        管理
      </button>
    </div>
  )
}
