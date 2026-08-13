import type { CategoryTab, IExploreCard } from '@/types'
import { cardVisitDate, toIsoDate } from '@/utils/dates'

export interface CalendarCell {
  date: string
  day: number
  inMonth: boolean
  isToday: boolean
  catering: number
  other: number
  total: number
}

export interface DayVisit {
  date: string
  cards: IExploreCard[]
  catering: number
  other: number
}

export function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = copy.getDay() === 0 ? -6 : 1 - copy.getDay()
  copy.setDate(copy.getDate() + offset)
  return copy
}

export function visitsForMonth(
  cards: IExploreCard[],
  year: number,
  month: number,
  tab: CategoryTab = 'all',
): DayVisit[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const map = new Map<string, IExploreCard[]>()
  for (const card of cards) {
    if (card.archived) continue
    const date = cardVisitDate(card)
    if (!date.startsWith(prefix)) continue
    if (tab !== 'all' && card.categoryGroup !== tab) continue
    const list = map.get(date) ?? []
    list.push(card)
    map.set(date, list)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      cards: list,
      catering: list.filter((item) => item.categoryGroup === 'catering').length,
      other: list.filter((item) => item.categoryGroup === 'other').length,
    }))
}

export function buildMonthCells(
  year: number,
  month: number,
  visits: DayVisit[],
  today = toIsoDate(),
): CalendarCell[] {
  const first = new Date(year, month - 1, 1)
  const start = startOfWeekMonday(first)
  const visitMap = new Map(visits.map((item) => [item.date, item]))
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const iso = toIsoDate(date)
    const visit = visitMap.get(iso)
    return {
      date: iso,
      day: date.getDate(),
      inMonth: date.getMonth() === month - 1,
      isToday: iso === today,
      catering: visit?.catering ?? 0,
      other: visit?.other ?? 0,
      total: visit?.cards.length ?? 0,
    }
  })
}

export function buildWeekCells(
  anchor: Date,
  visits: DayVisit[],
  today = toIsoDate(),
): CalendarCell[] {
  const start = startOfWeekMonday(anchor)
  const visitMap = new Map(visits.map((item) => [item.date, item]))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const iso = toIsoDate(date)
    const visit = visitMap.get(iso)
    return {
      date: iso,
      day: date.getDate(),
      inMonth: true,
      isToday: iso === today,
      catering: visit?.catering ?? 0,
      other: visit?.other ?? 0,
      total: visit?.cards.length ?? 0,
    }
  })
}

export function monthVisitStats(visits: DayVisit[]) {
  return visits.reduce(
    (sum, item) => ({
      total: sum.total + item.cards.length,
      catering: sum.catering + item.catering,
      other: sum.other + item.other,
    }),
    { total: 0, catering: 0, other: 0 },
  )
}

export function countStreak(cards: IExploreCard[], today = toIsoDate()): number {
  const dates = new Set(
    cards.filter((card) => !card.archived && cardVisitDate(card)).map((card) => cardVisitDate(card)),
  )
  let streak = 0
  const cursor = new Date(`${today}T00:00:00`)
  while (dates.has(toIsoDate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

