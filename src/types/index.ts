export type CardStatus = 'pending' | 'done'
export type StatusFilter = 'all' | 'pending' | 'done'
export type ViewMode = 'grid' | 'list'

export interface IExploreCard {
  id: string
  title: string
  images: string[]
  address: string
  lat?: number
  lng?: number
  tags: string[]
  status: CardStatus
  notes: string
  review: string
  createdAt: number
  updatedAt: number
}

export interface ITag {
  id: string
  name: string
}

export interface IAppConfig {
  nickname: string
  defaultFilter: 'all' | 'pending'
  viewMode: ViewMode
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
