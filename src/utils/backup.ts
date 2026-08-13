import { APP_VERSION, CATEGORY_META, DEFAULT_HOME_SLOGAN } from '@/types'
import type { IAppConfig, IBackupPayload, IExploreCard, ITag } from '@/types'
import { normalizeCard, normalizeTag } from '@/utils/models'

export const DEFAULT_CONFIG: IAppConfig = {
  nickname: '',
  motto: '',
  avatar: '',
  phone: '',
  passwordSet: false,
  homeSlogan: DEFAULT_HOME_SLOGAN,
  defaultFilter: 'all',
  viewMode: 'grid',
  theme: 'cream',
  calendarView: 'month',
  motion: true,
  categoryLabels: {
    catering: CATEGORY_META.catering.tab,
    other: CATEGORY_META.other.tab,
  },
  customTagColors: [],
  archiveFolders: [{ id: 'pocket', name: '收纳袋' }],
  cloudBackup: false,
}

export function normalizeConfig(raw: Partial<IAppConfig> = {}): IAppConfig {
  const catering = raw.categoryLabels?.catering?.trim() || DEFAULT_CONFIG.categoryLabels.catering
  const other = raw.categoryLabels?.other?.trim() || DEFAULT_CONFIG.categoryLabels.other
  const slogan = (raw.homeSlogan ?? DEFAULT_HOME_SLOGAN).trim().slice(0, 20)
  return {
    nickname: raw.nickname ?? '',
    motto: raw.motto ?? '',
    avatar: typeof raw.avatar === 'string' ? raw.avatar : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    passwordSet: Boolean(raw.passwordSet),
    homeSlogan: slogan || DEFAULT_HOME_SLOGAN,
    defaultFilter: raw.defaultFilter === 'pending' ? 'pending' : 'all',
    viewMode: raw.viewMode === 'list' ? 'list' : 'grid',
    theme: raw.theme === 'night' ? 'night' : 'cream',
    calendarView: raw.calendarView === 'week' ? 'week' : 'month',
    motion: raw.motion !== false,
    categoryLabels: { catering, other },
    customTagColors: Array.isArray(raw.customTagColors) ? raw.customTagColors : [],
    archiveFolders:
      Array.isArray(raw.archiveFolders) && raw.archiveFolders.length > 0
        ? raw.archiveFolders
        : DEFAULT_CONFIG.archiveFolders,
    cloudBackup: Boolean(raw.cloudBackup),
  }
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
    config: normalizeConfig(data.config ?? {}),
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
