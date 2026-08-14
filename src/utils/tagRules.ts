import type { CategoryGroup, CategoryTab, ITag } from '@/types'

export const TAG_EMPTY_COPY = '暂无该分类标签，请前往标签管理页添加'

export class TagCategoryMismatchError extends Error {
  constructor(message = '标签与所属大类不一致') {
    super(message)
    this.name = 'TagCategoryMismatchError'
  }
}

export function hasSameNameInGroup(
  tags: ITag[],
  name: string,
  group: CategoryGroup,
  exceptId?: string,
): boolean {
  const normalized = name.trim()
  if (!normalized) return false
  return tags.some((tag) => tag.name === normalized && tag.group === group && tag.id !== exceptId)
}

export function tagsForGroup(tags: ITag[], group?: CategoryGroup | 'all'): ITag[] {
  if (!group || group === 'all') return tags
  return tags.filter((tag) => tag.group === group)
}

export function filterGroupsForTab(tab: CategoryTab): CategoryGroup[] {
  if (tab === 'all') return ['catering', 'other']
  return [tab]
}

export function selectedTagGroups(selectedIds: string[], tags: ITag[]): CategoryGroup[] {
  const groups = new Set<CategoryGroup>()
  for (const id of selectedIds) {
    const tag = tags.find((item) => item.id === id)
    if (tag) groups.add(tag.group)
  }
  return [...groups]
}

export function isCrossCategory(selectedIds: string[], tags: ITag[]): boolean {
  const groups = selectedTagGroups(selectedIds, tags)
  return groups.includes('catering') && groups.includes('other')
}

export function sanitizeTagIds(selectedIds: string[], tags: ITag[], group: CategoryGroup): string[] {
  const allowed = new Set(tagsForGroup(tags, group).map((tag) => tag.id))
  return selectedIds.filter((id) => allowed.has(id))
}

export function assertTagsMatchGroup(selectedIds: string[], tags: ITag[], group: CategoryGroup): void {
  if (selectedIds.some((id) => !tags.some((tag) => tag.id === id && tag.group === group))) {
    throw new TagCategoryMismatchError()
  }
}
