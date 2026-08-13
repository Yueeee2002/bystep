import { describe, expect, it } from 'vitest'
import { cardsToCsv, parseCardsCsv } from '@/utils/csv'
import type { IExploreCard, ITag } from '@/types'

describe('csv helpers', () => {
  it('round-trips a card row', () => {
    const tags: ITag[] = [{ id: 't1', name: '咖啡', color: 'mocha', group: 'catering' }]
    const cards = [
      {
        id: '1',
        title: '留一杯',
        images: [],
        coverIndex: 0,
        address: '杭州',
        tags: ['t1'],
        status: 'done',
        notes: '淡',
        review: '',
        rating: 5,
        pinned: false,
        plannedAt: '',
        visitDate: '2026-08-13',
        archived: false,
        sortIndex: 1,
        categoryGroup: 'catering',
        likeCount: 0,
        createdAt: 1,
        updatedAt: 1,
      },
    ] as IExploreCard[]
    const parsed = parseCardsCsv(cardsToCsv(cards, tags), tags)
    expect(parsed[0].title).toBe('留一杯')
    expect(parsed[0].tags).toEqual(['t1'])
    expect(parsed[0].visitDate).toBe('2026-08-13')
  })
})
