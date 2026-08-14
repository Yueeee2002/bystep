/**
 * 本地持久化层（GitHub Pages 无后端）。
 * 读写都走浏览器 localStorage：刷新、关浏览器、重新发布静态站点都不会清用户数据。
 * 后续若接云端，只需替换 load/save 实现，store 业务层不用改。
 *
 * 默认值不含任何测试标签/探店，避免发布覆盖本地缓存。
 */
export const STORAGE_KEYS = {
  /** 标签列表：[{ id, name, color, group }]，空数组表示两个分组都还没标签 */
  tags: 'liubu_tag_list',
  /** 探店卡片（含原图、缩略图、星级、备注等） */
  cards: 'liubu_card_list',
  /** 主题、标语、视图偏好等个人设置 */
  config: 'liubu_app_config',
  /** 纯 UI 状态，如标签分组折叠 */
  ui: 'liubu_ui_prefs',
} as const

/** 旧版 explore_* 键，首次读取时自动迁到 liubu_* */
const LEGACY_KEYS: Record<keyof typeof STORAGE_KEYS, string> = {
  tags: 'explore_tags',
  cards: 'explore_cards',
  config: 'explore_config',
  ui: 'explore_ui',
}

export class StorageQuotaError extends Error {
  constructor(message = '本地存储空间不足，请压缩图片或清理部分卡片后再试') {
    super(message)
    this.name = 'StorageQuotaError'
  }
}

function parseOr<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function load<T>(key: string, fallback: T): T {
  try {
    return parseOr(localStorage.getItem(key), fallback)
  } catch {
    return fallback
  }
}

/** 优先读新键；没有则把旧键迁过来，再没有才用空模板。 */
export function loadPersisted<T>(slot: keyof typeof STORAGE_KEYS, fallback: T): T {
  try {
    const canonical = STORAGE_KEYS[slot]
    const current = localStorage.getItem(canonical)
    if (current !== null) return parseOr(current, fallback)
    const legacy = localStorage.getItem(LEGACY_KEYS[slot])
    if (legacy !== null) {
      localStorage.setItem(canonical, legacy)
      return parseOr(legacy, fallback)
    }
    return fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    if (isQuota) {
      throw new StorageQuotaError()
    }
    throw error
  }
}

export function remove(key: string): void {
  localStorage.removeItem(key)
}

export function clearAllExploreData(): void {
  remove(STORAGE_KEYS.cards)
  remove(STORAGE_KEYS.tags)
  remove(STORAGE_KEYS.config)
  remove(STORAGE_KEYS.ui)
  remove(LEGACY_KEYS.cards)
  remove(LEGACY_KEYS.tags)
  remove(LEGACY_KEYS.config)
  remove(LEGACY_KEYS.ui)
}

/** 只清标签缓存，两个分组回到空白，探店卡片保留。 */
export function resetTagCache(): void {
  save(STORAGE_KEYS.tags, [])
  remove(LEGACY_KEYS.tags)
}
