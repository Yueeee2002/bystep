import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import type { CategoryGroup, TagColor } from '@/types'

export function useTagData() {
  const tags = useTagStore((state) => state.tags)
  const addTagRaw = useTagStore((state) => state.addTag)
  const updateTagRaw = useTagStore((state) => state.updateTag)
  const moveTag = useTagStore((state) => state.moveTag)
  const replaceAll = useTagStore((state) => state.replaceAll)

  const addTag = (name: string, color?: TagColor, group?: CategoryGroup) => addTagRaw(name, color, group)

  const updateTag = (id: string, patch: Partial<{ name: string; color: TagColor; group: CategoryGroup }>) => {
    const current = useTagStore.getState().tags.find((tag) => tag.id === id)
    const ok = updateTagRaw(id, patch)
    if (ok && patch.group && current && patch.group !== current.group) {
      useCardStore.getState().rebindTagGroup(id, patch.group)
    }
    return ok
  }

  const deleteTag = (id: string) => {
    useTagStore.getState().deleteTag(id)
    useCardStore.getState().removeTagFromAll(id)
  }

  return { tags, addTag, updateTag, deleteTag, moveTag, replaceAll }
}
