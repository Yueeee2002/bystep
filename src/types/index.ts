export type CardStatus = 'pending' | 'done'
export type StatusFilter = 'all' | 'pending' | 'done'
export type ViewMode = 'grid' | 'list'
export type ThemeMode = 'cream' | 'night'
export type TagColor = 'mocha' | 'mint' | 'apricot' | 'haze'

export interface IExploreCard {
  id: string
  title: string
  images: string[]
  coverIndex: number
  address: string
  lat?: number
  lng?: number
  tags: string[]
  status: CardStatus
  notes: string
  review: string
  rating: number
  pinned: boolean
  plannedAt: string
  createdAt: number
  updatedAt: number
}

export interface ITag {
  id: string
  name: string
  color: TagColor
}

export interface IAppConfig {
  nickname: string
  defaultFilter: 'all' | 'pending'
  viewMode: ViewMode
  theme: ThemeMode
}

export interface IBackupPayload {
  version: string
  exportedAt: number
  cards: IExploreCard[]
  tags: ITag[]
  config: IAppConfig
}

export const APP_VERSION = 'V1.0'
export const APP_NAME = '留步'

export const TAG_COLORS: Record<TagColor, { bg: string; fg: string; label: string }> = {
  mocha: { bg: '#e8d5b7', fg: '#5c4630', label: '奶咖' },
  mint: { bg: '#d4ead9', fg: '#3d5c45', label: '浅绿' },
  apricot: { bg: '#f3d5c0', fg: '#6b3f2a', label: '淡橘' },
  haze: { bg: '#d5dce8', fg: '#3d4a5c', label: '雾霾蓝' },
}

export const TAG_COLOR_ORDER: TagColor[] = ['mocha', 'mint', 'apricot', 'haze']
