import { describe, expect, it } from 'vitest'
import { filterCards } from '@/utils/filterCards'
import type { IExploreCard, ITag } from '@/types'

function card(patch: Partial<IExploreCard> & Pick<IExploreCard, 'id' | 'title'>): IExploreCard {
  return {
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

const tags: ITag[] = [
  { id: 't1', name: '咖啡', color: 'mocha', group: 'catering' },
  { id: 't2', name: '展览', color: 'mint', group: 'other' },
]

describe('filterCards', () => {
  const cards: IExploreCard[] = [
    card({
      id: 'a',
      title: '山间咖啡',
      address: '杭州西湖',
      notes: '手冲很稳',
      tags: ['t1'],
      status: 'pending',
      createdAt: 10,
    }),
    card({
      id: 'b',
      title: '美术馆',
      address: '上海',
      review: '周末特展',
      tags: ['t2'],
      status: 'done',
      createdAt: 20,
    }),
    card({
      id: 'c',
      title: '书店',
      address: '成都',
      tags: ['t1', 't2'],
      status: 'pending',
      createdAt: 30,
    }),
  ]

  it('sorts by createdAt descending', () => {
    const result = filterCards(cards, {
      query: '',
      status: 'all',
      selectedTagIds: [],
      tags,
    })
    expect(result.map((item) => item.id)).toEqual(['c', 'b', 'a'])
  })

  it('filters by status', () => {
    const result = filterCards(cards, {
      query: '',
      status: 'done',
      selectedTagIds: [],
      tags,
    })
    expect(result.map((item) => item.id)).toEqual(['b'])
  })

  it('filters by selected tags with OR logic', () => {
    const result = filterCards(cards, {
      query: '',
      status: 'all',
      selectedTagIds: ['t2'],
      tags,
    })
    expect(result.map((item) => item.id)).toEqual(['c', 'b'])
  })

  it('searches title, address, notes, review and tag names', () => {
    expect(
      filterCards(cards, { query: '西湖', status: 'all', selectedTagIds: [], tags }).map((item) => item.id),
    ).toEqual(['a'])
    expect(
      filterCards(cards, { query: '特展', status: 'all', selectedTagIds: [], tags }).map((item) => item.id),
    ).toEqual(['b'])
    expect(
      filterCards(cards, { query: '咖啡', status: 'all', selectedTagIds: [], tags }).map((item) => item.id),
    ).toEqual(['c', 'a'])
  })

  it('keeps pinned cards at the top', () => {
    const mixed = [
      card({ id: 'a', title: 'a', createdAt: 10 }),
      card({ id: 'b', title: 'b', createdAt: 30, pinned: true }),
      card({ id: 'c', title: 'c', createdAt: 20 }),
    ]
    expect(
      filterCards(mixed, { query: '', status: 'all', selectedTagIds: [], tags }).map((item) => item.id),
    ).toEqual(['b', 'c', 'a'])
  })

  it('filters by minimum rating', () => {
    const rated = [
      card({ id: 'a', title: 'a', rating: 2 }),
      card({ id: 'b', title: 'b', rating: 5 }),
    ]
    expect(
      filterCards(rated, { query: '', status: 'all', selectedTagIds: [], tags, minRating: 3 }).map((item) => item.id),
    ).toEqual(['b'])
  })

  it('filters by category tab', () => {
    const mixed = [
      card({ id: 'a', title: 'a', categoryGroup: 'catering' }),
      card({ id: 'b', title: 'b', categoryGroup: 'other' }),
    ]
    expect(
      filterCards(mixed, { query: '', status: 'all', selectedTagIds: [], tags, categoryTab: 'other' }).map(
        (item) => item.id,
      ),
    ).toEqual(['b'])
  })

  it('sorts by rating and checked-in first', () => {
    const mixed = [
      card({ id: 'a', title: 'a', rating: 2, createdAt: 30 }),
      card({ id: 'b', title: 'b', rating: 5, createdAt: 10 }),
      card({ id: 'c', title: 'c', status: 'done', createdAt: 20 }),
    ]
    expect(
      filterCards(mixed, { query: '', status: 'all', selectedTagIds: [], tags, sortMode: 'starDesc' }).map(
        (item) => item.id,
      ),
    ).toEqual(['b', 'a', 'c'])
    expect(
      filterCards(mixed, { query: '', status: 'all', selectedTagIds: [], tags, sortMode: 'checkedFirst' }).map(
        (item) => item.id,
      ),
    ).toEqual(['c', 'a', 'b'])
  })
})
