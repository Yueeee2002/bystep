import { beforeEach, describe, expect, it } from 'vitest'
import { load, save, STORAGE_KEYS } from '@/utils/storage'

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
})
