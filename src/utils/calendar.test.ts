import { describe, expect, it } from 'vitest'
import { buildMonthCells, countStreak, visitsForMonth, visitsForRange } from '@/utils/calendar'
import type { IExploreCard } from '@/types'

function card(patch: Partial<IExploreCard> & Pick<IExploreCard, 'id'>): IExploreCard {
  return {
    title: '',
    images: [],
    coverIndex: 0,
    address: '',
    tags: [],
    status: 'done',
    notes: '',
    review: '',
    rating: 0,
    pinned: false,
    plannedAt: '',
    visitDate: '2026-08-13',
    archived: false,
    sortIndex: 1,
    categoryGroup: 'catering',
    likeCount: 0,
    createdAt: 1,
    updatedAt: 1,
    ...patch,
  }
}

describe('calendar helpers', () => {
  it('groups visits by date and category', () => {
    const visits = visitsForMonth(
      [
        card({ id: 'a', visitDate: '2026-08-13', categoryGroup: 'catering' }),
        card({ id: 'b', visitDate: '2026-08-13', categoryGroup: 'other' }),
        card({ id: 'c', visitDate: '2026-07-01', categoryGroup: 'catering' }),
      ],
      2026,
      8,
    )
    expect(visits).toHaveLength(1)
    expect(visits[0].catering).toBe(1)
    expect(visits[0].other).toBe(1)
  })

  it('builds a 42-cell month grid starting on Monday', () => {
    const cells = buildMonthCells(2026, 8, [], '2026-08-13')
    expect(cells).toHaveLength(42)
    const today = cells.find((cell) => cell.date === '2026-08-13')
    expect(today?.isToday).toBe(true)
    expect(today?.inMonth).toBe(true)
  })

  it('counts consecutive visit days', () => {
    expect(
      countStreak(
        [
          card({ id: 'a', visitDate: '2026-08-13' }),
          card({ id: 'b', visitDate: '2026-08-12' }),
        ],
        '2026-08-13',
      ),
    ).toBe(2)
  })

  it('collects visits across a week that spans months', () => {
    const visits = visitsForRange(
      [
        card({ id: 'a', visitDate: '2026-08-31' }),
        card({ id: 'b', visitDate: '2026-09-01', categoryGroup: 'other' }),
        card({ id: 'c', visitDate: '2026-09-08' }),
      ],
      '2026-08-31',
      '2026-09-06',
    )
    expect(visits).toHaveLength(2)
    expect(visits.map((item) => item.date)).toEqual(['2026-08-31', '2026-09-01'])
  })
})
