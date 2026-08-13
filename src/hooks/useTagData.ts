import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import type { CategoryGroup, TagColor } from '@/types'

export function useTagData() {
  const tags = useTagStore((state) => state.tags)
  const addTagRaw = useTagStore((state) => state.addTag)
  const updateTag = useTagStore((state) => state.updateTag)
  const moveTag = useTagStore((state) => state.moveTag)
  const replaceAll = useTagStore((state) => state.replaceAll)

  const addTag = (name: string, color?: TagColor, group?: CategoryGroup) => addTagRaw(name, color, group)

  const deleteTag = (id: string) => {
    useTagStore.getState().deleteTag(id)
    useCardStore.getState().removeTagFromAll(id)
  }

  return { tags, addTag, updateTag, deleteTag, moveTag, replaceAll }
}
