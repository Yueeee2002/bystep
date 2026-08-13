import { describe, expect, it } from 'vitest'
import { getCoverSrc, remapIndexAfterMove, removeImageAt } from '@/utils/models'

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
