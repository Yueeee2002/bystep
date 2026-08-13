import { describe, expect, it } from 'vitest'
import { filterCards } from '@/utils/filterCards'
import type { IExploreCard, ITag } from '@/types'

function card(patch: Partial<IExploreCard> & Pick<IExploreCard, 'id' | 'title'>): IExploreCard {
  return {
    images: [],
    address: '',
    tags: [],
    status: 'pending',
    notes: '',
    review: '',
    createdAt: 1,
    updatedAt: 1,
    ...patch,
  }
}

const tags: ITag[] = [
  { id: 't1', name: '咖啡' },
  { id: 't2', name: '展览' },
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
})
