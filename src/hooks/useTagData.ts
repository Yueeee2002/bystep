import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'

export function useTagData() {
  const tags = useTagStore((state) => state.tags)
  const addTag = useTagStore((state) => state.addTag)
  const updateTag = useTagStore((state) => state.updateTag)
  const replaceAll = useTagStore((state) => state.replaceAll)

  const deleteTag = (id: string) => {
    useTagStore.getState().deleteTag(id)
    useCardStore.getState().removeTagFromAll(id)
  }

  return { tags, addTag, updateTag, deleteTag, replaceAll }
}
