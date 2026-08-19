export type CardStatus = 'pending' | 'done'
export type StatusFilter = 'all' | 'pending' | 'done'
export type ViewMode = 'grid' | 'list'
export type ThemeMode = 'cream' | 'night'
export type ViewportMode = 'pc' | 'mobile'
export type ViewportPreference = 'auto' | ViewportMode
export type CalendarViewMode = 'month' | 'week'
export type TagColor = 'mocha' | 'mint' | 'apricot' | 'haze'
export type CategoryGroup = 'catering' | 'other'
export type CategoryTab = 'all' | CategoryGroup
export type SortMode = 'newest' | 'oldest' | 'starDesc' | 'starAsc' | 'checkedFirst' | 'manual'

export interface IExploreCard {
  id: string
  title: string
  /** 原始高清图（data URL 或远程地址），预览弹窗使用 */
  images: string[]
  /** 卡片封面缩略图（长边 720、居中裁切），与 images 一一对应；缺省时回退到原图 */
  thumbs?: string[]
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
  visitDate: string
  archived: boolean
  sortIndex: number
  categoryGroup: CategoryGroup
  likeCount: number
  createdAt: number
  updatedAt: number
}

export interface ITag {
  id: string
  name: string
  color: string
  group: CategoryGroup
}

export interface ICustomTagColor {
  id: string
  label: string
  bg: string
  fg: string
}

export interface IArchiveFolder {
  id: string
  name: string
}

export interface IAppConfig {
  nickname: string
  motto: string
  avatar: string
  phone: string
  passwordSet: boolean
  homeSlogan: string
  defaultFilter: 'all' | 'pending'
  viewMode: ViewMode
  theme: ThemeMode
  viewportPreference: ViewportPreference
  calendarView: CalendarViewMode
  motion: boolean
  categoryLabels: Record<CategoryGroup, string>
  customTagColors: ICustomTagColor[]
  archiveFolders: IArchiveFolder[]
  cloudBackup: boolean
}

export interface IBackupPayload {
  version: string
  exportedAt: number
  cards: IExploreCard[]
  tags: ITag[]
  config: IAppConfig
}

export const APP_VERSION = 'v2.6'
export const APP_NAME = '留步'
export const DEFAULT_HOME_SLOGAN = '把种草的店，轻轻收好'
export const SLOGAN_EXAMPLES = [
  '收集每一次烟火与闲逛',
  '记录城市里的温柔落脚地',
  '慢慢逛，好好吃，认真生活',
  '收纳日常所有小美好',
  '奔赴下一场市井浪漫',
]

export const TAG_COLORS: Record<TagColor, { bg: string; fg: string; label: string }> = {
  mocha: { bg: '#e8d5b7', fg: '#5c4630', label: '奶咖' },
  mint: { bg: '#d4ead9', fg: '#3d5c45', label: '浅绿' },
  apricot: { bg: '#f3d5c0', fg: '#6b3f2a', label: '淡橘' },
  haze: { bg: '#d5dce8', fg: '#3d4a5c', label: '雾霾蓝' },
}

export const TAG_COLOR_ORDER: TagColor[] = ['mocha', 'mint', 'apricot', 'haze']

export const CATEGORY_META: Record<
  CategoryGroup,
  { tab: string; radio: string; hint: string; mapColor: string }
> = {
  catering: {
    tab: '食肆小店',
    radio: '食肆小店',
    hint: '咖啡、茶饮、小吃与餐桌边的温柔',
    mapColor: '#e8c4a8',
  },
  other: {
    tab: '野趣小仓',
    radio: '野趣小仓',
    hint: '书店、市集、展览与路上的风景',
    mapColor: '#c5cdd6',
  },
}

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'newest', label: '默认排序' },
  { value: 'oldest', label: '添加时间由早到晚' },
  { value: 'starDesc', label: '星级由高至低' },
  { value: 'starAsc', label: '星级由低至高' },
  { value: 'checkedFirst', label: '已打卡内容优先展示' },
  { value: 'manual', label: '手账贴序' },
]
