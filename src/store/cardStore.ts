import { create } from 'zustand'
import type { IExploreCard, StatusFilter, ViewMode } from '@/types'
import { filterCards } from '@/utils/filterCards'
import { createId } from '@/utils/filterCards'
import { normalizeCard } from '@/utils/models'
import { load, save, STORAGE_KEYS } from '@/utils/storage'
import { useTagStore } from '@/store/tagStore'

interface CardState {
  cards: IExploreCard[]
  searchQuery: string
  statusFilter: StatusFilter
  selectedTagIds: string[]
  minRating: number
  viewMode: ViewMode
  hydrate: (cards: IExploreCard[]) => void
  persist: () => void
  addCardsFromImages: (images: string[]) => IExploreCard[]
  updateCard: (id: string, patch: Partial<Omit<IExploreCard, 'id' | 'createdAt'>>) => void
  deleteCard: (id: string) => void
  toggleStatus: (id: string) => void
  togglePin: (id: string) => void
  setRating: (id: string, rating: number) => void
  batchUpdate: (ids: string[], patch: Partial<Pick<IExploreCard, 'status' | 'tags'>>) => void
  batchAddTag: (ids: string[], tagId: string) => void
  removeTagFromAll: (tagId: string) => void
  setSearchQuery: (query: string) => void
  setStatusFilter: (status: StatusFilter) => void
  setMinRating: (rating: number) => void
  toggleTagFilter: (tagId: string) => void
  clearTagFilters: () => void
  setViewMode: (mode: ViewMode) => void
  replaceAll: (cards: IExploreCard[]) => void
  getFilteredCards: () => IExploreCard[]
}

function persistCards(cards: IExploreCard[]) {
  save(STORAGE_KEYS.cards, cards)
}

function emptyCard(image: string, createdAt: number): IExploreCard {
  return {
    id: createId(),
    title: '',
    images: [image],
    coverIndex: 0,
    address: '',
    tags: [],
    status: 'pending',
    notes: '',
    review: '',
    rating: 0,
    pinned: false,
    plannedAt: '',
    createdAt,
    updatedAt: createdAt,
  }
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: load<IExploreCard[]>(STORAGE_KEYS.cards, []).map((card) => normalizeCard(card)),
  searchQuery: '',
  statusFilter: 'all',
  selectedTagIds: [],
  minRating: 0,
  viewMode: 'grid',

  hydrate: (cards) => set({ cards: cards.map((card) => normalizeCard(card)) }),

  persist: () => persistCards(get().cards),

  addCardsFromImages: (images) => {
    const now = Date.now()
    const created = images.map((image, index) => emptyCard(image, now + index))
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
        card.id === id ? normalizeCard({ ...card, ...patch, updatedAt: Date.now() }) : card,
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

  togglePin: (id) => {
    const card = get().cards.find((item) => item.id === id)
    if (!card) return
    get().updateCard(id, { pinned: !card.pinned })
  },

  setRating: (id, rating) => {
    get().updateCard(id, { rating })
  },

  batchUpdate: (ids, patch) => {
    const idSet = new Set(ids)
    set((state) => {
      const cards = state.cards.map((card) =>
        idSet.has(card.id) ? normalizeCard({ ...card, ...patch, updatedAt: Date.now() }) : card,
      )
      persistCards(cards)
      return { cards }
    })
  },

  batchAddTag: (ids, tagId) => {
    const idSet = new Set(ids)
    set((state) => {
      const cards = state.cards.map((card) => {
        if (!idSet.has(card.id) || card.tags.includes(tagId)) return card
        return normalizeCard({ ...card, tags: [...card.tags, tagId], updatedAt: Date.now() })
      })
      persistCards(cards)
      return { cards }
    })
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
  setMinRating: (minRating) => set({ minRating }),
  toggleTagFilter: (tagId) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds.includes(tagId)
        ? state.selectedTagIds.filter((id) => id !== tagId)
        : [...state.selectedTagIds, tagId],
    })),
  clearTagFilters: () => set({ selectedTagIds: [] }),
  setViewMode: (viewMode) => set({ viewMode }),
  replaceAll: (cards) => {
    const next = cards.map((card) => normalizeCard(card))
    persistCards(next)
    set({ cards: next })
  },

  getFilteredCards: () => {
    const { cards, searchQuery, statusFilter, selectedTagIds, minRating } = get()
    return filterCards(cards, {
      query: searchQuery,
      status: statusFilter,
      selectedTagIds,
      minRating,
      tags: useTagStore.getState().tags,
    })
  },
}))
