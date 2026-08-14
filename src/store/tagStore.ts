import { create } from 'zustand'
import type { CategoryGroup, ITag } from '@/types'
import { createId } from '@/utils/filterCards'
import { hasSameNameInGroup } from '@/utils/tagRules'
import { moveItem, normalizeTag } from '@/utils/models'
import { loadPersisted, save, STORAGE_KEYS } from '@/utils/storage'

interface TagState {
  tags: ITag[]
  hydrate: (tags: ITag[]) => void
  addTag: (name: string, color?: string, group?: CategoryGroup) => ITag | null
  updateTag: (id: string, patch: Partial<Pick<ITag, 'name' | 'color' | 'group'>>) => boolean
  deleteTag: (id: string) => void
  moveTag: (from: number, to: number) => void
  replaceAll: (tags: ITag[]) => void
}

function persistTags(tags: ITag[]) {
  save(STORAGE_KEYS.tags, tags)
}

function normalizeName(name: string) {
  return name.trim()
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: loadPersisted<ITag[]>('tags', []).map((tag) =>
    normalizeTag({ id: tag.id, name: tag.name, color: tag.color, group: tag.group }),
  ),

  hydrate: (tags) => set({ tags: tags.map((tag) => normalizeTag(tag)) }),

  addTag: (rawName, color = 'mocha', group = 'catering') => {
    const name = normalizeName(rawName)
    if (!name) return null
    const exists = hasSameNameInGroup(get().tags, name, group)
    if (exists) return null
    const tag: ITag = { id: createId(), name, color, group }
    set((state) => {
      const tags = [...state.tags, tag]
      persistTags(tags)
      return { tags }
    })
    return tag
  },

  updateTag: (id, patch) => {
    const current = get().tags.find((tag) => tag.id === id)
    if (!current) return false
    const name = patch.name !== undefined ? normalizeName(patch.name) : current.name
    if (!name) return false
    const nextGroup = patch.group ?? current.group
    const duplicated = hasSameNameInGroup(get().tags, name, nextGroup, id)
    if (duplicated) return false
    set((state) => {
      const tags = state.tags.map((tag) =>
        tag.id === id ? normalizeTag({ ...tag, ...patch, name }) : tag,
      )
      persistTags(tags)
      return { tags }
    })
    return true
  },

  deleteTag: (id) => {
    set((state) => {
      const tags = state.tags.filter((tag) => tag.id !== id)
      persistTags(tags)
      return { tags }
    })
  },

  moveTag: (from, to) => {
    set((state) => {
      const tags = moveItem(state.tags, from, to)
      persistTags(tags)
      return { tags }
    })
  },

  replaceAll: (tags) => {
    const next = tags.map((tag) => normalizeTag(tag))
    persistTags(next)
    set({ tags: next })
  },
}))
