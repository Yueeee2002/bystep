import { create } from 'zustand'
import type { IExploreCard, StatusFilter, ViewMode } from '@/types'
import { filterCards } from '@/utils/filterCards'
import { createId } from '@/utils/filterCards'
import { load, save, STORAGE_KEYS } from '@/utils/storage'
import { useTagStore } from '@/store/tagStore'

interface CardState {
  cards: IExploreCard[]
  searchQuery: string
  statusFilter: StatusFilter
  selectedTagIds: string[]
  viewMode: ViewMode
  hydrate: (cards: IExploreCard[]) => void
  persist: () => void
  addCardsFromImages: (images: string[]) => IExploreCard[]
  updateCard: (id: string, patch: Partial<Omit<IExploreCard, 'id' | 'createdAt'>>) => void
  deleteCard: (id: string) => void
  toggleStatus: (id: string) => void
  removeTagFromAll: (tagId: string) => void
  setSearchQuery: (query: string) => void
  setStatusFilter: (status: StatusFilter) => void
  toggleTagFilter: (tagId: string) => void
  clearTagFilters: () => void
  setViewMode: (mode: ViewMode) => void
  replaceAll: (cards: IExploreCard[]) => void
  getFilteredCards: () => IExploreCard[]
}

function persistCards(cards: IExploreCard[]) {
  save(STORAGE_KEYS.cards, cards)
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: load<IExploreCard[]>(STORAGE_KEYS.cards, []),
  searchQuery: '',
  statusFilter: 'all',
  selectedTagIds: [],
  viewMode: 'grid',

  hydrate: (cards) => set({ cards }),

  persist: () => persistCards(get().cards),

  addCardsFromImages: (images) => {
    const now = Date.now()
    const created = images.map((image, index) => ({
      id: createId(),
      title: '',
      images: [image],
      address: '',
      tags: [],
      status: 'pending' as const,
      notes: '',
      review: '',
      createdAt: now + index,
      updatedAt: now + index,
    }))
    set((state) => {
      const cards = [...created, ...state.cards]
      persistCards(cards)
      return { cards }
    })
    return created
  },

  updateCard: (id, patch) => {
    set((state) => {
      const cards = state.cards.map((card) =>
        card.id === id ? { ...card, ...patch, updatedAt: Date.now() } : card,
      )
      persistCards(cards)
      return { cards }
    })
  },

  deleteCard: (id) => {
    set((state) => {
      const cards = state.cards.filter((card) => card.id !== id)
      persistCards(cards)
      return { cards }
    })
  },

  toggleStatus: (id) => {
    const card = get().cards.find((item) => item.id === id)
    if (!card) return
    get().updateCard(id, { status: card.status === 'done' ? 'pending' : 'done' })
  },

  removeTagFromAll: (tagId) => {
    set((state) => {
      const cards = state.cards.map((card) => ({
        ...card,
        tags: card.tags.filter((id) => id !== tagId),
        updatedAt: card.tags.includes(tagId) ? Date.now() : card.updatedAt,
      }))
      persistCards(cards)
      return {
        cards,
        selectedTagIds: state.selectedTagIds.filter((id) => id !== tagId),
      }
    })
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  toggleTagFilter: (tagId) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds.includes(tagId)
        ? state.selectedTagIds.filter((id) => id !== tagId)
        : [...state.selectedTagIds, tagId],
    })),
  clearTagFilters: () => set({ selectedTagIds: [] }),
  setViewMode: (viewMode) => set({ viewMode }),
  replaceAll: (cards) => {
    persistCards(cards)
    set({ cards })
  },

  getFilteredCards: () => {
    const { cards, searchQuery, statusFilter, selectedTagIds } = get()
    return filterCards(cards, {
      query: searchQuery,
      status: statusFilter,
      selectedTagIds,
      tags: useTagStore.getState().tags,
    })
  },
}))
