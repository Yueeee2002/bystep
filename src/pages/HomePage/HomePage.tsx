import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '@/components/Filter/SearchBar'
import StatusFilterBar from '@/components/Filter/StatusFilter'
import TagFilter from '@/components/Filter/TagFilter'
import CategoryTabs from '@/components/Filter/CategoryTabs'
import CardGrid from '@/components/Card/CardGrid'
import Button from '@/components/common/Button'
import BatchBar from '@/components/common/BatchBar'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { filterCards, tagsForGroup } from '@/utils/filterCards'
import { collectDashboard, countWeeklyPlans } from '@/utils/models'
import { composeGreeting, GREETINGS, pickRandom } from '@/utils/copy'
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
  const minRating = useCardStore((state) => state.minRating)
  const viewMode = useCardStore((state) => state.viewMode)
  const categoryTab = useCardStore((state) => state.categoryTab)
  const sortMode = useCardStore((state) => state.sortMode)
  const setSearchQuery = useCardStore((state) => state.setSearchQuery)
  const setStatusFilter = useCardStore((state) => state.setStatusFilter)
  const setMinRating = useCardStore((state) => state.setMinRating)
  const setCategoryTab = useCardStore((state) => state.setCategoryTab)
  const setSortMode = useCardStore((state) => state.setSortMode)
  const toggleTagFilter = useCardStore((state) => state.toggleTagFilter)
  const clearTagFilters = useCardStore((state) => state.clearTagFilters)
  const setViewMode = useCardStore((state) => state.setViewMode)
  const deleteCard = useCardStore((state) => state.deleteCard)
  const togglePin = useCardStore((state) => state.togglePin)
  const setRating = useCardStore((state) => state.setRating)
  const batchUpdate = useCardStore((state) => state.batchUpdate)
  const batchAddTag = useCardStore((state) => state.batchAddTag)
  const tags = useTagStore((state) => state.tags)
  const nickname = useConfigStore((state) => state.nickname)
  const theme = useConfigStore((state) => state.theme)
  const persistViewMode = useConfigStore((state) => state.setViewMode)
  const toggleTheme = useConfigStore((state) => state.toggleTheme)
  const openUpload = useUiStore((state) => state.openUpload)
  const openEdit = useUiStore((state) => state.openEdit)
  const openTags = useUiStore((state) => state.openTags)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)
  const triggerCelebrate = useUiStore((state) => state.triggerCelebrate)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const selectMode = selectedIds.length > 0
  const greeting = useMemo(() => composeGreeting(nickname, pickRandom(GREETINGS)), [nickname])
  const weekly = useMemo(() => countWeeklyPlans(cards), [cards])
  const visibleTags = useMemo(() => tagsForGroup(tags, categoryTab), [tags, categoryTab])

  const filtered = useMemo(
    () =>
      filterCards(cards, {
        query: searchQuery,
        status: statusFilter,
        selectedTagIds,
        minRating,
        categoryTab,
        sortMode,
        tags,
      }),
    [cards, searchQuery, statusFilter, selectedTagIds, minRating, categoryTab, sortMode, tags],
  )

  const stats = useMemo(() => collectDashboard(filtered, categoryTab), [filtered, categoryTab])
  const tabEmpty = cards.filter((card) => categoryTab === 'all' || card.categoryGroup === categoryTab).length === 0
  const isEmptyAll = cards.length === 0
  const isEmptyFilter = !isEmptyAll && !tabEmpty && filtered.length === 0

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
        <div className={styles.headerActions}>
          <Link to="/settings" className="icon-btn" aria-label="个人中心">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8.2" r="3.05" stroke="currentColor" strokeWidth="1.35" />
              <path
                d="M5.4 18.6c.7-3.1 3.3-4.9 6.6-4.9s5.9 1.8 6.6 4.9"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <button type="button" className="icon-btn" aria-label="切换主题" onClick={toggleTheme}>
            {theme === 'night' ? '☾' : '☀'}
          </button>
        </div>
      </header>

      <p className={styles.greet}>{greeting}</p>
      {weekly > 0 ? <p className={styles.ticker}>{weekly} 家店铺计划本周打卡</p> : null}

      <CategoryTabs value={categoryTab} onChange={setCategoryTab} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
      <div className={styles.rating}>
        {[
          { value: 0, label: '不限星级' },
          { value: 3, label: '3星以上' },
          { value: 5, label: '只要5星' },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            className={`chip ${minRating === item.value ? 'active' : ''}`}
            onClick={() => setMinRating(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <TagFilter
        tags={tags}
        selectedIds={selectedTagIds}
        categoryTab={categoryTab}
        sortMode={sortMode}
        onToggle={toggleTagFilter}
        onReset={clearTagFilters}
        onManage={openTags}
        onSortChange={setSortMode}
      />

      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <Button onClick={openUpload}>上传图片</Button>
          <Button variant="ghost" onClick={openTags}>
            标签管理
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (selectMode) setSelectedIds([])
              else if (filtered[0]) setSelectedIds([filtered[0].id])
            }}
          >
            {selectMode ? '退出多选' : '多选'}
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
          <h2>行囊尚空</h2>
          <p>把偶遇的小店，一一收纳进来吧</p>
          <Button onClick={openUpload}>开始收纳</Button>
        </section>
      ) : tabEmpty ? (
        <section className={styles.empty}>
          <h2>这一格还空着</h2>
          <p>换个品类看看，或把新的遇见轻轻收进来。</p>
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
          selectedIds={selectedIds}
          selectMode={selectMode}
          onOpen={openEdit}
          onDelete={handleDelete}
          onPin={(id) => {
            togglePin(id)
            showToast('置顶已更新', 'success')
          }}
          onRate={setRating}
          onLongPress={(id) => setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
          onToggleSelect={(id) =>
            setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
          }
        />
      )}

      {selectMode ? (
        <BatchBar
          count={selectedIds.length}
          tags={visibleTags}
          onAddTag={(tagId) => {
            batchAddTag(selectedIds, tagId)
            showToast('已批量添加标签', 'success')
          }}
          onStatus={(status) => {
            batchUpdate(selectedIds, { status })
            if (status === 'done') triggerCelebrate()
            showToast('已批量更新状态', 'success')
            setSelectedIds([])
          }}
          onCancel={() => setSelectedIds([])}
        />
      ) : null}

      <p className={styles.dash}>
        {stats.totalLine}｜已打卡：{stats.done}家｜待出发：{stats.pending}家｜累计探店文字：{stats.words}字
      </p>
      <footer className={styles.foot}>留步・收藏每一场不期而遇的探店</footer>
    </div>
  )
}
