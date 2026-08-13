import { useCallback } from 'react'
import { useCardStore } from '@/store/cardStore'
import type { IExploreCard } from '@/types'

export function useCardData() {
  const cards = useCardStore((state) => state.cards)
  const addCardsFromImages = useCardStore((state) => state.addCardsFromImages)
  const updateCard = useCardStore((state) => state.updateCard)
  const deleteCard = useCardStore((state) => state.deleteCard)
  const toggleStatus = useCardStore((state) => state.toggleStatus)
  const replaceAll = useCardStore((state) => state.replaceAll)
  const getFilteredCards = useCardStore((state) => state.getFilteredCards)

  const getCardById = useCallback(
    (id: string): IExploreCard | undefined => cards.find((card) => card.id === id),
    [cards],
  )

  return {
    cards,
    addCardsFromImages,
    updateCard,
    deleteCard,
    toggleStatus,
    replaceAll,
    getFilteredCards,
    getCardById,
  }
}
