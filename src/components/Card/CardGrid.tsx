import type { IExploreCard, ITag, ViewMode } from '@/types'
import CardItem from '@/components/Card/CardItem'
import styles from './CardGrid.module.css'

interface CardGridProps {
  cards: IExploreCard[]
  tags: ITag[]
  viewMode: ViewMode
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

export default function CardGrid({ cards, tags, viewMode, onOpen, onDelete }: CardGridProps) {
  return (
    <div className={viewMode === 'grid' ? styles.grid : styles.list}>
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          tags={tags}
          viewMode={viewMode}
          onOpen={onOpen}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
