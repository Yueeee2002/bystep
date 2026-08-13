import { useRef } from 'react'
import type { IExploreCard, ITag, ViewMode } from '@/types'
import { resolveTagColor } from '@/utils/palette'
import { getCoverSrc } from '@/utils/models'
import { useConfigStore } from '@/store/configStore'
import Stars from '@/components/common/Stars'
import styles from './CardItem.module.css'

interface CardItemProps {
  card: IExploreCard
  tags: ITag[]
  viewMode: ViewMode
  selected?: boolean
  selectMode?: boolean
  highlight?: boolean
  index?: number
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  onRate: (id: string, rating: number) => void
  onLongPress: (id: string) => void
  onToggleSelect: (id: string) => void
  onMove?: (fromId: string, toId: string) => void
}

export default function CardItem({
  card,
  tags,
  viewMode,
  selected,
  selectMode,
  highlight,
  index = 0,
  onOpen,
  onDelete,
  onPin,
  onRate,
  onLongPress,
  onToggleSelect,
  onMove,
}: CardItemProps) {
  const cover = getCoverSrc(card)
  const timer = useRef<number | 0>(0)
  const extras = useConfigStore((state) => state.customTagColors)
  const boundTags = card.tags
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is ITag => Boolean(tag))
    .slice(0, 3)

  const startPress = () => {
    timer.current = window.setTimeout(() => onLongPress(card.id), 480)
  }

  const cancelPress = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = 0
  }

  return (
    <article
      className={`${styles.card} ${viewMode === 'list' ? styles.listCard : ''} ${selected ? styles.selected : ''} ${card.pinned ? styles.pinned : ''} ${highlight ? styles.flash : ''}`}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      draggable={
        !selectMode &&
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches
      }
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', card.id)
      }}
      onDragOver={(event) => {
        if (!onMove) return
        event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        const fromId = event.dataTransfer.getData('text/plain')
        if (fromId && onMove) onMove(fromId, card.id)
      }}
      onClick={() => (selectMode ? onToggleSelect(card.id) : onOpen(card.id))}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onPointerMove={cancelPress}
    >
      <div className={styles.photo}>
        {cover ? (
          <img src={cover} alt={card.title || '点位图片'} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>暂无图片</div>
        )}
        <span className={`${styles.stamp} ${card.status === 'done' ? styles.done : ''}`}>
          {card.status === 'done' ? '已打卡' : '未打卡'}
        </span>
        {card.images.length > 1 ? <span className={styles.count}>{card.images.length}P</span> : null}
        <button
          type="button"
          className={`${styles.pin} ${card.pinned ? styles.pinOn : ''}`}
          aria-label={card.pinned ? '取消置顶' : '置顶'}
          onClick={(event) => {
            event.stopPropagation()
            onPin(card.id)
          }}
        >
          ⌃
        </button>
        <button
          type="button"
          className={styles.delete}
          aria-label="删除卡片"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(card.id)
          }}
        >
          ×
        </button>
        <div className={styles.stars}>
          <Stars small value={card.rating} onChange={(rating) => onRate(card.id, rating)} />
        </div>
      </div>
      <div className={styles.body}>
        <h3>{card.title.trim() || '未命名地点'}</h3>
        {card.address ? <p className={styles.addr}>{card.address}</p> : <p className={styles.addr}>地址未填写</p>}
        {boundTags.length > 0 ? (
          <div className={styles.tags}>
            {boundTags.map((tag) => (
              <span key={tag.id} style={{ background: resolveTagColor(tag.color, extras).bg, color: resolveTagColor(tag.color, extras).fg }}>
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
