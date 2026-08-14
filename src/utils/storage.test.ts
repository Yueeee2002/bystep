import { beforeEach, describe, expect, it } from 'vitest'
import { load, loadPersisted, resetTagCache, save, STORAGE_KEYS, clearAllExploreData } from '@/utils/storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads json data', () => {
    save(STORAGE_KEYS.tags, [{ id: '1', name: '展览' }])
    expect(load(STORAGE_KEYS.tags, [])).toEqual([{ id: '1', name: '展览' }])
  })

  it('returns fallback when empty or invalid', () => {
    expect(load('missing', { ok: true })).toEqual({ ok: true })
    localStorage.setItem('bad', '{')
    expect(load('bad', [1])).toEqual([1])
  })

  it('prefers canonical keys and migrates legacy explore_* once', () => {
    localStorage.setItem('explore_tags', JSON.stringify([{ id: 't1', name: '咖啡' }]))
    expect(loadPersisted('tags', [])).toEqual([{ id: 't1', name: '咖啡' }])
    expect(localStorage.getItem(STORAGE_KEYS.tags)).toContain('咖啡')
    localStorage.setItem(STORAGE_KEYS.tags, JSON.stringify([{ id: 't2', name: '书店' }]))
    expect(loadPersisted('tags', [])).toEqual([{ id: 't2', name: '书店' }])
  })

  it('resetTagCache only clears tags', () => {
    save(STORAGE_KEYS.tags, [{ id: 't1' }])
    save(STORAGE_KEYS.cards, [{ id: 'c1' }])
    resetTagCache()
    expect(loadPersisted('tags', ['fallback'])).toEqual([])
    expect(loadPersisted('cards', [])).toEqual([{ id: 'c1' }])
  })

  it('clearAllExploreData removes new and legacy keys', () => {
    save(STORAGE_KEYS.tags, [1])
    localStorage.setItem('explore_cards', '[]')
    clearAllExploreData()
    expect(localStorage.getItem(STORAGE_KEYS.tags)).toBeNull()
    expect(localStorage.getItem('explore_cards')).toBeNull()
  })
})
