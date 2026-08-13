import { describe, expect, it } from 'vitest'
import {
  assertTagsMatchGroup,
  filterGroupsForTab,
  isCrossCategory,
  sanitizeTagIds,
  TagCategoryMismatchError,
  tagsForGroup,
} from '@/utils/tagRules'
import type { ITag } from '@/types'

const tags: ITag[] = [
  { id: 't1', name: '咖啡', color: 'mocha', group: 'catering' },
  { id: 't2', name: '书店', color: 'mint', group: 'other' },
  { id: 't3', name: '甜品', color: 'apricot', group: 'catering' },
]

describe('tagRules', () => {
  it('filters tags by top-level group', () => {
    expect(tagsForGroup(tags, 'catering').map((tag) => tag.id)).toEqual(['t1', 't3'])
    expect(tagsForGroup(tags, 'all')).toHaveLength(3)
  })

  it('returns popover groups from the current tab', () => {
    expect(filterGroupsForTab('all')).toEqual(['catering', 'other'])
    expect(filterGroupsForTab('other')).toEqual(['other'])
  })

  it('detects cross-category selections on the all tab', () => {
    expect(isCrossCategory(['t1', 't3'], tags)).toBe(false)
    expect(isCrossCategory(['t1', 't2'], tags)).toBe(true)
  })

  it('sanitizes and rejects mismatched tags', () => {
    expect(sanitizeTagIds(['t1', 't2'], tags, 'catering')).toEqual(['t1'])
    expect(() => assertTagsMatchGroup(['t1', 't2'], tags, 'catering')).toThrow(TagCategoryMismatchError)
    expect(() => assertTagsMatchGroup(['t1'], tags, 'catering')).not.toThrow()
  })
})
