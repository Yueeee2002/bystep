import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '@/components/Filter/SearchBar'
import StatusFilterBar from '@/components/Filter/StatusFilter'
import TagFilter from '@/components/Filter/TagFilter'
import CardGrid from '@/components/Card/CardGrid'
import Button from '@/components/common/Button'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { filterCards } from '@/utils/filterCards'
import type { ViewMode } from '@/types'
import styles from './HomePage.module.css'

function Logo() {
  return (
    <svg className={styles.logoMark} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#cca251" />
      <path
        d="M9.2 20.4c1.6-1.1 2.1-2.8 1.2-4.1-.9-1.3-2.8-1.6-4.1-.5-1.3 1-1.5 2.9-.5 4.1.9 1.2 2.4 1.3 3.4.5Z"
        fill="#161616"
      />
      <ellipse cx="8.6" cy="13.2" rx="1.7" ry="2.4" transform="rotate(-18 8.6 13.2)" fill="#161616" />
      <ellipse cx="12.1" cy="12.1" rx="1.35" ry="1.9" transform="rotate(-8 12.1 12.1)" fill="#161616" />
      <ellipse cx="14.8" cy="13.4" rx="1.1" ry="1.55" transform="rotate(8 14.8 13.4)" fill="#161616" />
      <path
        d="M22.8 11.6c-1.6 1.1-2.1 2.8-1.2 4.1.9 1.3 2.8 1.6 4.1.5 1.3-1 1.5-2.9.5-4.1-.9-1.2-2.4-1.3-3.4-.5Z"
        fill="#161616"
      />
      <ellipse cx="23.4" cy="18.8" rx="1.7" ry="2.4" transform="rotate(162 23.4 18.8)" fill="#161616" />
      <ellipse cx="19.9" cy="19.9" rx="1.35" ry="1.9" transform="rotate(172 19.9 19.9)" fill="#161616" />
      <ellipse cx="17.2" cy="18.6" rx="1.1" ry="1.55" transform="rotate(-172 17.2 18.6)" fill="#161616" />
    </svg>
  )
}

export default function HomePage() {
  const cards = useCardStore((state) => state.cards)
  const searchQuery = useCardStore((state) => state.searchQuery)
  const statusFilter = useCardStore((state) => state.statusFilter)
  const selectedTagIds = useCardStore((state) => state.selectedTagIds)
  const viewMode = useCardStore((state) => state.viewMode)
  const setSearchQuery = useCardStore((state) => state.setSearchQuery)
  const setStatusFilter = useCardStore((state) => state.setStatusFilter)
  const toggleTagFilter = useCardStore((state) => state.toggleTagFilter)
  const setViewMode = useCardStore((state) => state.setViewMode)
  const deleteCard = useCardStore((state) => state.deleteCard)
  const tags = useTagStore((state) => state.tags)
  const nickname = useConfigStore((state) => state.nickname)
  const persistViewMode = useConfigStore((state) => state.setViewMode)
  const openUpload = useUiStore((state) => state.openUpload)
  const openEdit = useUiStore((state) => state.openEdit)
  const openTags = useUiStore((state) => state.openTags)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)

  const filtered = useMemo(
    () =>
      filterCards(cards, {
        query: searchQuery,
        status: statusFilter,
        selectedTagIds,
        tags,
      }),
    [cards, searchQuery, statusFilter, selectedTagIds, tags],
  )

  const greeting = nickname.trim() ? `${nickname.trim()}，今天想去哪走走？` : '今天想去哪走走？'
  const isEmptyAll = cards.length === 0
  const isEmptyFilter = !isEmptyAll && filtered.length === 0

  const changeView = (mode: ViewMode) => {
    setViewMode(mode)
    persistViewMode(mode)
  }

  const handleDelete = (id: string) => {
    openConfirm({
      title: '删除这张卡片？',
      message: '删除后无法恢复，相关图片也会从本地一并清掉。',
      confirmText: '删除',
      danger: true,
      onConfirm: () => {
        deleteCard(id)
        showToast('卡片已删除', 'info')
      },
    })
  }

  return (
    <div className="app-shell page-enter">
      <header className={styles.header}>
        <div className={styles.brand}>
          <Logo />
          <div>
            <h1>留步</h1>
            <p>把种草的店，轻轻收好</p>
          </div>
        </div>
        <Link to="/settings" className="icon-btn" aria-label="设置">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 16.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 7.1l1.6-1.6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </header>

      <p className={styles.greet}>{greeting}</p>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
      <TagFilter tags={tags} selectedIds={selectedTagIds} onToggle={toggleTagFilter} onManage={openTags} />

      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <Button onClick={openUpload}>上传图片</Button>
          <Button variant="ghost" onClick={openTags}>
            标签管理
          </Button>
        </div>
        <div className={styles.views} role="group" aria-label="视图切换">
          <button
            type="button"
            className={viewMode === 'grid' ? styles.viewActive : ''}
            onClick={() => changeView('grid')}
          >
            网格
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? styles.viewActive : ''}
            onClick={() => changeView('list')}
          >
            列表
          </button>
          <button type="button" className={styles.viewSoon} disabled title="V2.0 地图视图">
            地图
          </button>
        </div>
      </div>

      {isEmptyAll ? (
        <section className={styles.empty}>
          <div className={styles.emptyArt} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h2>还没有留下脚步</h2>
          <p>把抖音、小红书里种草的截图收进来。周末想出门时，再慢慢翻一翻。</p>
          <Button onClick={openUpload}>开始收纳</Button>
        </section>
      ) : isEmptyFilter ? (
        <section className={styles.empty}>
          <h2>没有符合条件的点位</h2>
          <p>换个关键词，或把筛选放宽一些，也许它还在。</p>
        </section>
      ) : (
        <CardGrid
          cards={filtered}
          tags={tags}
          viewMode={viewMode}
          onOpen={openEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
