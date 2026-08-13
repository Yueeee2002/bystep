import { beforeEach, describe, expect, it } from 'vitest'
import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'

describe('tag and card binding', () => {
  beforeEach(() => {
    localStorage.clear()
    useTagStore.setState({ tags: [] })
    useCardStore.setState({
      cards: [],
      searchQuery: '',
      statusFilter: 'all',
      selectedTagIds: [],
      minRating: 0,
      viewMode: 'grid',
      categoryTab: 'all',
      sortMode: 'newest',
    })
  })

  it('rejects duplicate tag names', () => {
    expect(useTagStore.getState().addTag('咖啡')?.name).toBe('咖啡')
    expect(useTagStore.getState().addTag(' 咖啡 ')).toBeNull()
    expect(useTagStore.getState().tags).toHaveLength(1)
  })

  it('unbinds deleted tags from cards and filters', () => {
    const tag = useTagStore.getState().addTag('展览')
    expect(tag).toBeTruthy()
    useCardStore.setState({
      cards: [
        {
          id: 'c1',
          title: '美术馆',
          images: [],
          address: '',
          tags: [tag!.id],
          status: 'pending',
          notes: '',
          review: '',
          coverIndex: 0,
          rating: 0,
          pinned: false,
          plannedAt: '',
          categoryGroup: 'other',
          likeCount: 0,
          createdAt: 1,
          updatedAt: 1,
          visitDate: '',
          archived: false,
          sortIndex: 1,
        },
      ],
      selectedTagIds: [tag!.id],
    })

    useCardStore.getState().removeTagFromAll(tag!.id)
    useTagStore.getState().deleteTag(tag!.id)

    expect(useCardStore.getState().cards[0].tags).toEqual([])
    expect(useCardStore.getState().selectedTagIds).toEqual([])
    expect(useTagStore.getState().tags).toEqual([])
  })

  it('clears tag filters when switching category tabs', () => {
    const coffee = useTagStore.getState().addTag('咖啡', 'mocha', 'catering')
    useCardStore.setState({ selectedTagIds: [coffee!.id], categoryTab: 'all' })
    useCardStore.getState().setCategoryTab('other')
    expect(useCardStore.getState().categoryTab).toBe('other')
    expect(useCardStore.getState().selectedTagIds).toEqual([])
  })

  it('rejects saving a card with tags from another category', () => {
    const book = useTagStore.getState().addTag('书店', 'mint', 'other')
    expect(() =>
      useCardStore.getState().addCardsFromImages(['img'], {
        categoryGroup: 'catering',
        tags: [book!.id],
      }),
    ).toThrow('标签与所属大类不一致')
  })

  it('reorders tags with the same moveTag used by drag sort', () => {
    const a = useTagStore.getState().addTag('咖啡', 'mocha', 'catering')
    const b = useTagStore.getState().addTag('拉面', 'mint', 'catering')
    const c = useTagStore.getState().addTag('书店', 'haze', 'other')
    useTagStore.getState().moveTag(0, 2)
    expect(useTagStore.getState().tags.map((tag) => tag.id)).toEqual([b!.id, c!.id, a!.id])
  })

  it('stores original images with matching cover thumbs', () => {
    const created = useCardStore.getState().addCardsFromImages(['orig-a'], {
      thumbs: ['thumb-a'],
    })
    expect(created[0].images).toEqual(['orig-a'])
    expect(created[0].thumbs).toEqual(['thumb-a'])
  })
})
