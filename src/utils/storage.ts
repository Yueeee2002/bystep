export const STORAGE_KEYS = {
  cards: 'explore_cards',
  tags: 'explore_tags',
  config: 'explore_config',
} as const

export class StorageQuotaError extends Error {
  constructor(message = '本地存储空间不足，请压缩图片或清理部分卡片后再试') {
    super(message)
    this.name = 'StorageQuotaError'
  }
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
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
}
