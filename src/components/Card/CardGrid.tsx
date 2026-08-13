import type { IExploreCard, ITag, ViewMode } from '@/types'
import CardItem from '@/components/Card/CardItem'
import styles from './CardGrid.module.css'

interface CardGridProps {
  cards: IExploreCard[]
  tags: ITag[]
  viewMode: ViewMode
  selectedIds: string[]
  selectMode: boolean
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  onRate: (id: string, rating: number) => void
  onLongPress: (id: string) => void
  onToggleSelect: (id: string) => void
}

export default function CardGrid({
  cards,
  tags,
  viewMode,
  selectedIds,
  selectMode,
  onOpen,
  onDelete,
  onPin,
  onRate,
  onLongPress,
  onToggleSelect,
}: CardGridProps) {
  return (
    <div className={viewMode === 'grid' ? styles.grid : styles.list}>
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          tags={tags}
          viewMode={viewMode}
          selected={selectedIds.includes(card.id)}
          selectMode={selectMode}
          onOpen={onOpen}
          onDelete={onDelete}
          onPin={onPin}
          onRate={onRate}
          onLongPress={onLongPress}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}
