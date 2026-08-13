import type { CategoryGroup, IExploreCard, ITag, TagColor } from '@/types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getCoverSrc(card: Pick<IExploreCard, 'images' | 'coverIndex'>): string | undefined {
  if (card.images.length === 0) return undefined
  return card.images[clamp(card.coverIndex, 0, card.images.length - 1)] ?? card.images[0]
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list.slice()
  const next = list.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function remapIndexAfterMove(from: number, to: number, current: number): number {
  if (current === from) return to
  if (from < current && to >= current) return current - 1
  if (from > current && to <= current) return current + 1
  return current
}

export function removeImageAt(
  images: string[],
  coverIndex: number,
  index: number,
): { images: string[]; coverIndex: number; blocked: boolean } {
  if (images.length <= 1) {
    return { images, coverIndex, blocked: true }
  }
  const next = images.filter((_, i) => i !== index)
  let nextCover = coverIndex
  if (index === coverIndex) nextCover = 0
  else if (index < coverIndex) nextCover = coverIndex - 1
  return { images: next, coverIndex: clamp(nextCover, 0, next.length - 1), blocked: false }
}

export function normalizeCard(raw: Partial<IExploreCard> & Pick<IExploreCard, 'id'>): IExploreCard {
  const images = Array.isArray(raw.images) ? raw.images.filter(Boolean) : []
  return {
    id: raw.id,
    title: raw.title ?? '',
    images,
    coverIndex: clamp(raw.coverIndex ?? 0, 0, Math.max(0, images.length - 1)),
    address: raw.address ?? '',
    lat: raw.lat,
    lng: raw.lng,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    status: raw.status === 'done' ? 'done' : 'pending',
    notes: raw.notes ?? '',
    review: raw.review ?? '',
    rating: clamp(raw.rating ?? 0, 0, 5),
    pinned: Boolean(raw.pinned),
    plannedAt: typeof raw.plannedAt === 'string' ? raw.plannedAt : '',
    visitDate: typeof raw.visitDate === 'string' ? raw.visitDate : '',
    archived: Boolean(raw.archived),
    sortIndex: typeof raw.sortIndex === 'number' ? raw.sortIndex : (raw.createdAt ?? Date.now()),
    categoryGroup: raw.categoryGroup === 'other' ? 'other' : 'catering',
    likeCount: Math.max(0, raw.likeCount ?? 0),
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  }
}

const TAG_COLOR_SET = new Set<TagColor>(['mocha', 'mint', 'apricot', 'haze'])

const TAG_GROUP_SET = new Set<CategoryGroup>(['catering', 'other'])

export function normalizeTag(raw: Partial<ITag> & Pick<ITag, 'id' | 'name'>): ITag {
  const color = raw.color && TAG_COLOR_SET.has(raw.color) ? raw.color : 'mocha'
  const group = raw.group && TAG_GROUP_SET.has(raw.group) ? raw.group : 'catering'
  return { id: raw.id, name: raw.name, color, group }
}

export function isThisWeek(isoDate: string, now = new Date()): boolean {
  if (!isoDate) return false
  const target = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(target.getTime())) return false
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(now.getDate() + mondayOffset)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return target >= start && target <= end
}

export function countWeeklyPlans(cards: IExploreCard[], now = new Date()): number {
  return cards.filter((card) => card.status === 'pending' && isThisWeek(card.plannedAt, now)).length
}

export function collectDashboard(cards: IExploreCard[], tab: 'all' | CategoryGroup = 'all') {
  const pending = cards.filter((card) => card.status === 'pending').length
  const done = cards.filter((card) => card.status === 'done').length
  const words = cards.reduce((sum, card) => sum + card.notes.trim().length + card.review.trim().length, 0)
  const totalLine =
    tab === 'catering'
      ? `总共收录 ${cards.length} 家美味小店`
      : tab === 'other'
        ? `总共收录 ${cards.length} 处有趣小间`
        : `总共收录 ${cards.length} 条城市小记`
  return {
    total: cards.length,
    pending,
    done,
    words,
    totalLine,
  }
}
