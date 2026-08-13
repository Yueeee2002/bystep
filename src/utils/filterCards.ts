import type { CategoryGroup, CategoryTab, IExploreCard, ITag, SortMode, StatusFilter } from '@/types'

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

export function compareCards(a: IExploreCard, b: IExploreCard, sortMode: SortMode): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
  switch (sortMode) {
    case 'oldest':
      return a.createdAt - b.createdAt
    case 'starDesc':
      return b.rating - a.rating || b.createdAt - a.createdAt
    case 'starAsc':
      return a.rating - b.rating || b.createdAt - a.createdAt
    case 'checkedFirst': {
      const av = a.status === 'done' ? 0 : 1
      const bv = b.status === 'done' ? 0 : 1
      return av - bv || b.createdAt - a.createdAt
    }
    default:
      return b.createdAt - a.createdAt
  }
}

export function filterCards(
  cards: IExploreCard[],
  options: {
    query: string
    status: StatusFilter
    selectedTagIds: string[]
    tags: ITag[]
    minRating?: number
    categoryTab?: CategoryTab
    sortMode?: SortMode
  },
): IExploreCard[] {
  const {
    query,
    status,
    selectedTagIds,
    tags,
    minRating = 0,
    categoryTab = 'all',
    sortMode = 'newest',
  } = options

  return cards
    .filter((card) => {
      if (categoryTab !== 'all' && card.categoryGroup !== categoryTab) return false
      if (status !== 'all' && card.status !== status) return false
      if (minRating > 0 && card.rating < minRating) return false
      if (selectedTagIds.length > 0) {
        const matched = selectedTagIds.some((id) => card.tags.includes(id))
        if (!matched) return false
      }
      return cardMatchesQuery(card, query, tags)
    })
    .slice()
    .sort((a, b) => compareCards(a, b, sortMode))
}

export function tagsForGroup(tags: ITag[], group?: CategoryGroup | 'all'): ITag[] {
  if (!group || group === 'all') return tags
  return tags.filter((tag) => tag.group === group)
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}
