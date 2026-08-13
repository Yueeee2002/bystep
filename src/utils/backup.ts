import { APP_VERSION } from '@/types'
import type { IAppConfig, IBackupPayload, IExploreCard, ITag } from '@/types'
import { normalizeCard, normalizeTag } from '@/utils/models'

export const DEFAULT_CONFIG: IAppConfig = {
  nickname: '',
  motto: '',
  defaultFilter: 'all',
  viewMode: 'grid',
  theme: 'cream',
}

export function buildBackupPayload(
  cards: IExploreCard[],
  tags: ITag[],
  config: IAppConfig,
): IBackupPayload {
  return {
    version: APP_VERSION,
    exportedAt: Date.now(),
    cards,
    tags,
    config,
  }
}

export function parseBackupPayload(raw: string): IBackupPayload {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('备份文件不是有效的 JSON')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('备份文件格式不正确')
  }

  const data = parsed as Partial<IBackupPayload>
  if (!Array.isArray(data.cards) || !Array.isArray(data.tags)) {
    throw new Error('备份文件缺少卡片或标签数据')
  }

  return {
    version: typeof data.version === 'string' ? data.version : APP_VERSION,
    exportedAt: typeof data.exportedAt === 'number' ? data.exportedAt : Date.now(),
    cards: data.cards.map((card) => normalizeCard(card)),
    tags: data.tags.map((tag, index) =>
      normalizeTag({
        id: tag.id || `tag_${index}`,
        name: tag.name || `标签${index + 1}`,
        color: tag.color,
        group: tag.group,
      }),
    ),
    config: {
      ...DEFAULT_CONFIG,
      ...(data.config ?? {}),
    },
  }
}

export function downloadJson(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
