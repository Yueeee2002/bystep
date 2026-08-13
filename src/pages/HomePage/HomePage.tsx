import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '@/components/Filter/SearchBar'
import StatusFilterBar from '@/components/Filter/StatusFilter'
import TagFilter from '@/components/Filter/TagFilter'
import CategoryTabs from '@/components/Filter/CategoryTabs'
import CardGrid from '@/components/Card/CardGrid'
import Button from '@/components/common/Button'
import BatchBar from '@/components/common/BatchBar'
import AppHeader from '@/components/layout/AppHeader'
import EmptyNote from '@/components/common/EmptyNote'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { filterCards, tagsForGroup } from '@/utils/filterCards'
import { collectDashboard, countWeeklyPlans } from '@/utils/models'
import { composeGreeting, GREETINGS, pickRandom } from '@/utils/copy'
import type { ViewMode } from '@/types'
import styles from './HomePage.module.css'

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
  const moveCard = useCardStore((state) => state.moveCard)
  const archiveCards = useCardStore((state) => state.archiveCards)
  const tags = useTagStore((state) => state.tags)
  const nickname = useConfigStore((state) => state.nickname)
  const persistViewMode = useConfigStore((state) => state.setViewMode)
  const openUpload = useUiStore((state) => state.openUpload)
  const openEdit = useUiStore((state) => state.openEdit)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)
  const triggerCelebrate = useUiStore((state) => state.triggerCelebrate)
  const navigate = useNavigate()
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
  const tabEmpty = cards.filter((card) => !card.archived && (categoryTab === 'all' || card.categoryGroup === categoryTab)).length === 0
  const isEmptyAll = cards.filter((card) => !card.archived).length === 0
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

  const pocket = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const ids = selectedIds.length > 0 ? selectedIds : [event.dataTransfer.getData('text/plain')].filter(Boolean)
    if (ids.length === 0) return
    archiveCards(ids, true)
    setSelectedIds([])
    showToast('已收纳入册', 'success')
  }

  return (
    <div className="app-shell page-enter">
      <AppHeader
        home
        badge={weekly > 0}
        actions={
          <Button className="home-header-add" onClick={() => openUpload()}>
            新增
          </Button>
        }
      />
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
        onManage={() => navigate('/tags')}
        onSortChange={setSortMode}
      />

      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <Button onClick={() => openUpload()}>上传图片</Button>
          <Button variant="ghost" onClick={() => navigate('/tags')}>
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
        <EmptyNote title="行囊尚空" text="把偶遇的小店，一一收纳进来吧" action={{ label: '开始收纳', onClick: () => openUpload() }} />
      ) : tabEmpty ? (
        <EmptyNote title="这一格还空着" text="换个品类看看，或把新的遇见轻轻收进来。" action={{ label: '开始收纳', onClick: () => openUpload() }} />
      ) : isEmptyFilter ? (
        <EmptyNote title="没有符合条件的点位" text="换个关键词，或把筛选放宽一些，也许它还在。" />
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
          onMove={moveCard}
          onLongPress={(id) => setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
          onToggleSelect={(id) =>
            setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
          }
        />
      )}

      {selectMode ? (
        <>
          <button
            type="button"
            className={styles.pocket}
            onDragOver={(event) => event.preventDefault()}
            onDrop={pocket}
            onClick={() => {
              archiveCards(selectedIds, true)
              setSelectedIds([])
              showToast('已收纳入册', 'success')
            }}
          >
            收纳袋
            <span>把选中的卡片轻轻放进来</span>
          </button>
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
        </>
      ) : null}

      <p className={styles.dash}>
        {stats.totalLine}｜已打卡：{stats.done}家｜待出发：{stats.pending}家｜累计探店文字：{stats.words}字
      </p>
      <footer className={styles.foot}>留步・收藏每一场不期而遇的探店</footer>
      <button type="button" className={styles.fab} aria-label="新增探店" onClick={() => openUpload()}>
        ＋
      </button>
    </div>
  )
}
