import { create } from 'zustand'
import type { ITag } from '@/types'
import { createId } from '@/utils/filterCards'
import { load, save, STORAGE_KEYS } from '@/utils/storage'

interface TagState {
  tags: ITag[]
  hydrate: (tags: ITag[]) => void
  addTag: (name: string) => ITag | null
  updateTag: (id: string, name: string) => boolean
  deleteTag: (id: string) => void
  replaceAll: (tags: ITag[]) => void
}

function persistTags(tags: ITag[]) {
  save(STORAGE_KEYS.tags, tags)
}

function normalizeName(name: string) {
  return name.trim()
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: load<ITag[]>(STORAGE_KEYS.tags, []),

  hydrate: (tags) => set({ tags }),

  addTag: (rawName) => {
    const name = normalizeName(rawName)
    if (!name) return null
    const exists = get().tags.some((tag) => tag.name === name)
    if (exists) return null
    const tag: ITag = { id: createId(), name }
    set((state) => {
      const tags = [...state.tags, tag]
      persistTags(tags)
      return { tags }
    })
    return tag
  },

  updateTag: (id, rawName) => {
    const name = normalizeName(rawName)
    if (!name) return false
    const duplicated = get().tags.some((tag) => tag.name === name && tag.id !== id)
    if (duplicated) return false
    set((state) => {
      const tags = state.tags.map((tag) => (tag.id === id ? { ...tag, name } : tag))
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

  replaceAll: (tags) => {
    persistTags(tags)
    set({ tags })
  },
}))
