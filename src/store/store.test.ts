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
          createdAt: 1,
          updatedAt: 1,
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
})
