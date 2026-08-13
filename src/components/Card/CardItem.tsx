import type { IExploreCard, ITag, ViewMode } from '@/types'
import styles from './CardItem.module.css'

interface CardItemProps {
  card: IExploreCard
  tags: ITag[]
  viewMode: ViewMode
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

export default function CardItem({ card, tags, viewMode, onOpen, onDelete }: CardItemProps) {
  const cover = card.images[0]
  const tagNames = card.tags
    .map((id) => tags.find((tag) => tag.id === id)?.name)
    .filter(Boolean)
    .slice(0, 3)

  return (
    <article
      className={`${styles.card} ${viewMode === 'list' ? styles.listCard : ''}`}
      onClick={() => onOpen(card.id)}
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
      </div>
      <div className={styles.body}>
        <h3>{card.title.trim() || '未命名地点'}</h3>
        {card.address ? <p className={styles.addr}>{card.address}</p> : <p className={styles.addr}>地址未填写</p>}
        {tagNames.length > 0 ? (
          <div className={styles.tags}>
            {tagNames.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
