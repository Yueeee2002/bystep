import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import type { ITag, SortMode } from '@/types'
import { CATEGORY_META, TAG_COLORS } from '@/types'
import type { CategoryGroup } from '@/types'
import SortMenu from '@/components/Filter/SortMenu'
import styles from './FilterBar.module.css'

interface TagFilterProps {
  tags: ITag[]
  selectedIds: string[]
  sortMode: SortMode
  onToggle: (id: string) => void
  onReset: () => void
  onManage: () => void
  onSortChange: (mode: SortMode) => void
}

const GROUPS: CategoryGroup[] = ['catering', 'other']

export default function TagFilter({
  tags,
  selectedIds,
  sortMode,
  onToggle,
  onReset,
  onManage,
  onSortChange,
}: TagFilterProps) {
  return (
    <div className={styles.controlRow}>
      <SortMenu value={sortMode} onChange={onSortChange} />
      <Popover className={styles.filterWrap}>
        <PopoverButton className={`${styles.filterBtn} ${selectedIds.length ? styles.filterOn : ''}`}>
          <span>标签筛选</span>
          {selectedIds.length > 0 ? <em>{selectedIds.length}</em> : null}
          <span aria-hidden="true">▾</span>
        </PopoverButton>
        <PopoverPanel className={styles.filterPanel} anchor="bottom end">
          {({ close }) => (
            <div className={styles.filterInner}>
              <h3>标签筛选</h3>
              {GROUPS.map((group) => {
                const items = tags.filter((tag) => tag.group === group)
                return (
                  <section key={group} className={styles.filterGroup}>
                    <p>{CATEGORY_META[group].tab}</p>
                    <div className={styles.filterChips}>
                      {items.length === 0 ? (
                        <span className={styles.hint}>还没有这一类的标签</span>
                      ) : (
                        items.map((tag) => {
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
                  </section>
                )
              })}
              <div className={styles.filterFoot}>
                <button type="button" className={styles.reset} onClick={onReset}>
                  重置筛选
                </button>
                <button type="button" className={styles.close} onClick={() => close()}>
                  关闭
                </button>
              </div>
            </div>
          )}
        </PopoverPanel>
      </Popover>
      <button type="button" className={styles.manage} onClick={onManage}>
        管理
      </button>
    </div>
  )
}
