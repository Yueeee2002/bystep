import type { IExploreCard, ITag, StatusFilter } from '@/types'

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function cardMatchesQuery(
  card: IExploreCard,
  query: string,
  tags: ITag[],
): boolean {
  const q = normalizeQuery(query)
  if (!q) return true

  const tagNames = card.tags
    .map((id) => tags.find((tag) => tag.id === id)?.name ?? '')
    .join(' ')

  const haystack = [card.title, card.address, card.notes, card.review, tagNames]
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function filterCards(
  cards: IExploreCard[],
  options: {
    query: string
    status: StatusFilter
    selectedTagIds: string[]
    tags: ITag[]
    minRating?: number
  },
): IExploreCard[] {
  const { query, status, selectedTagIds, tags, minRating = 0 } = options

  return cards
    .filter((card) => {
      if (status !== 'all' && card.status !== status) return false
      if (minRating > 0 && card.rating < minRating) return false
      if (selectedTagIds.length > 0) {
        const matched = selectedTagIds.some((id) => card.tags.includes(id))
        if (!matched) return false
      }
      return cardMatchesQuery(card, query, tags)
    })
    .slice()
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.createdAt - a.createdAt
    })
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}
