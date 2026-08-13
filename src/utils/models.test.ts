import { describe, expect, it } from 'vitest'
import { collectDashboard, getCoverSrc, remapIndexAfterMove, removeImageAt } from '@/utils/models'
import { CATEGORY_META } from '@/types'
import type { IExploreCard } from '@/types'

function card(patch: Partial<IExploreCard> & Pick<IExploreCard, 'id'>): IExploreCard {
  return {
    title: '',
    images: [],
    coverIndex: 0,
    address: '',
    tags: [],
    status: 'pending',
    notes: '',
    review: '',
    rating: 0,
    pinned: false,
    plannedAt: '',
    categoryGroup: 'catering',
    likeCount: 0,
    createdAt: 1,
    updatedAt: 1,
    ...patch,
  }
}

describe('gallery helpers', () => {
  it('returns the selected cover image', () => {
    expect(getCoverSrc({ images: ['a', 'b', 'c'], coverIndex: 2 })).toBe('c')
    expect(getCoverSrc({ images: ['a'], coverIndex: 9 })).toBe('a')
  })

  it('blocks deleting the last image and promotes a new cover', () => {
    expect(removeImageAt(['only'], 0, 0).blocked).toBe(true)
    const next = removeImageAt(['a', 'b', 'c'], 1, 1)
    expect(next.blocked).toBe(false)
    expect(next.images).toEqual(['a', 'c'])
    expect(next.coverIndex).toBe(0)
  })

  it('keeps cover on the same image after reorder', () => {
    expect(remapIndexAfterMove(0, 2, 0)).toBe(2)
    expect(remapIndexAfterMove(2, 0, 1)).toBe(2)
  })
})

describe('category display names', () => {
  it('uses 野趣小仓 for the other group everywhere', () => {
    expect(CATEGORY_META.catering.radio).toBe('食肆小店')
    expect(CATEGORY_META.other.tab).toBe('野趣小仓')
    expect(CATEGORY_META.other.radio).toBe('野趣小仓')
  })
})

describe('collectDashboard', () => {
  const cards = [
    card({ id: 'a', notes: 'abc', categoryGroup: 'catering' }),
    card({ id: 'b', review: 'de', status: 'done', categoryGroup: 'other' }),
  ]

  it('uses unified copy for each top-level tab', () => {
    expect(collectDashboard(cards, 'all').totalLine).toBe('总共收录 2 条城市小记')
    expect(collectDashboard(cards, 'catering').totalLine).toBe('总共收录 2 家美味小店')
    expect(collectDashboard(cards, 'other').totalLine).toBe('总共收录 2 处有趣小间')
  })
})
