import { useState } from 'react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import type { CategoryTab, ITag, SortMode } from '@/types'
import { useConfigStore } from '@/store/configStore'
import { resolveTagColor } from '@/utils/palette'
import type { CategoryGroup } from '@/types'
import { filterGroupsForTab, isCrossCategory } from '@/utils/tagRules'
import SortMenu from '@/components/Filter/SortMenu'
import styles from './FilterBar.module.css'

interface TagFilterProps {
  tags: ITag[]
  selectedIds: string[]
  categoryTab: CategoryTab
  sortMode: SortMode
  onToggle: (id: string) => void
  onReset: () => void
  onManage: () => void
  onSortChange: (mode: SortMode) => void
  variant?: 'menu' | 'chips'
}

const GROUPS: CategoryGroup[] = ['catering', 'other']

export default function TagFilter({
  tags,
  selectedIds,
  categoryTab,
  sortMode,
  onToggle,
  onReset,
  onManage,
  onSortChange,
  variant = 'menu',
}: TagFilterProps) {
  const [shaking, setShaking] = useState(false)
  const [chipsOpen, setChipsOpen] = useState(false)
  const labels = useConfigStore((state) => state.categoryLabels)
  const extras = useConfigStore((state) => state.customTagColors)
  const visible = filterGroupsForTab(categoryTab)
  const cross = categoryTab === 'all' && isCrossCategory(selectedIds, tags)
  const selectedTags = selectedIds
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is ITag => Boolean(tag))

  const reset = () => {
    if (selectedIds.length > 0) {
      setShaking(true)
      window.setTimeout(() => setShaking(false), 320)
    }
    onReset()
  }

  const renderGroupChips = (interactive = true) =>
    GROUPS.map((group) => {
      const items = tags.filter((tag) => tag.group === group)
      const hidden = !visible.includes(group)
      return (
        <section
          key={group}
          className={`${styles.filterGroup} ${hidden ? styles.filterGroupHide : ''} ${
            visible[0] === group ? styles.filterGroupLead : ''
          }`}
        >
          <div className={styles.filterGroupInner}>
            <p>{labels[group]}</p>
            <div className={`${styles.filterChips} ${shaking ? styles.shake : ''}`}>
              {items.length === 0 ? (
                <span className={styles.hint}>还没有这一类的标签</span>
              ) : (
                items.map((tag) => {
                  const palette = resolveTagColor(tag.color, extras)
                  const active = selectedIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`${styles.filterChip} ${active ? styles.filterChipOn : ''}`}
                      style={{
                        background: active ? palette.bg : 'var(--snow)',
                        color: active ? palette.fg : 'var(--ash)',
                      }}
                      onClick={() => interactive && onToggle(tag.id)}
                    >
                      <i className={styles.filterMark} aria-hidden="true" />
                      {tag.name}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </section>
      )
    })

  if (variant === 'chips') {
    return (
      <div className={styles.chipFilter}>
        {cross ? <p className={styles.crossHint}>已跨分类筛选</p> : null}
        <div className={styles.selectedRow}>
          {selectedTags.map((tag) => {
            const palette = resolveTagColor(tag.color, extras)
            return (
              <button
                key={tag.id}
                type="button"
                className={styles.selectedChip}
                style={{ background: palette.bg, color: palette.fg }}
                onClick={() => onToggle(tag.id)}
              >
                {tag.name}
                <span aria-hidden="true">×</span>
              </button>
            )
          })}
          <button
            type="button"
            className={`${styles.pickChip} ${chipsOpen ? styles.pickChipOn : ''}`}
            aria-expanded={chipsOpen}
            onClick={() => setChipsOpen((open) => !open)}
          >
            + 选择标签
          </button>
        </div>
        <div className={`${styles.chipFold} ${chipsOpen ? styles.chipFoldOpen : ''}`}>
          <div className={styles.chipFoldInner}>
            {renderGroupChips()}
            {selectedIds.length > 0 ? (
              <button type="button" className={styles.reset} onClick={reset}>
                重置筛选
              </button>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.controlRow}>
      <SortMenu value={sortMode} onChange={onSortChange} />
      <Popover className={styles.filterWrap}>
        <PopoverButton className={`${styles.filterBtn} ${selectedIds.length ? styles.filterOn : ''}`}>
          <span>标签筛选</span>
          {selectedIds.length > 0 ? <em>{selectedIds.length}</em> : null}
          <span aria-hidden="true">▾</span>
        </PopoverButton>
        <PopoverPanel transition className={styles.filterPanel} anchor="bottom end">
          {({ close }) => (
            <div className={styles.filterInner}>
              <h3>标签筛选</h3>
              {cross ? <p className={styles.crossHint}>已跨分类筛选</p> : null}
              {renderGroupChips()}
              <div className={styles.filterFoot}>
                <button type="button" className={styles.reset} onClick={reset}>
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
