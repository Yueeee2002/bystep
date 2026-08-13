import { create } from 'zustand'
import type { IAppConfig, StatusFilter, ThemeMode } from '@/types'
import { DEFAULT_CONFIG } from '@/utils/backup'
import { load, save, STORAGE_KEYS } from '@/utils/storage'

interface ConfigState extends IAppConfig {
  hydrate: (config: IAppConfig) => void
  setNickname: (nickname: string) => void
  setDefaultFilter: (defaultFilter: IAppConfig['defaultFilter']) => void
  setViewMode: (viewMode: IAppConfig['viewMode']) => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  replaceAll: (config: IAppConfig) => void
  applyDefaultFilter: () => StatusFilter
}

function snapshot(state: Pick<ConfigState, 'nickname' | 'defaultFilter' | 'viewMode' | 'theme'>): IAppConfig {
  return {
    nickname: state.nickname,
    defaultFilter: state.defaultFilter,
    viewMode: state.viewMode,
    theme: state.theme,
  }
}

function persistConfig(config: IAppConfig) {
  save(STORAGE_KEYS.config, config)
}

export const useConfigStore = create<ConfigState>((set, get) => {
  const initial = { ...DEFAULT_CONFIG, ...load<Partial<IAppConfig>>(STORAGE_KEYS.config, {}) }
  return {
    ...initial,
    hydrate: (config) => set(config),
    setNickname: (nickname) => {
      const next = snapshot({ ...get(), nickname })
      persistConfig(next)
      set({ nickname })
    },
    setDefaultFilter: (defaultFilter) => {
      const next = snapshot({ ...get(), defaultFilter })
      persistConfig(next)
      set({ defaultFilter })
    },
    setViewMode: (viewMode) => {
      const next = snapshot({ ...get(), viewMode })
      persistConfig(next)
      set({ viewMode })
    },
    setTheme: (theme) => {
      const next = snapshot({ ...get(), theme })
      persistConfig(next)
      set({ theme })
    },
    toggleTheme: () => {
      const theme = get().theme === 'night' ? 'cream' : 'night'
      get().setTheme(theme)
    },
    replaceAll: (config) => {
      const next = { ...DEFAULT_CONFIG, ...config }
      persistConfig(next)
      set(next)
    },
    applyDefaultFilter: () => get().defaultFilter,
  }
})
