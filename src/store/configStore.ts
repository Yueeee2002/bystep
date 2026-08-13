import { create } from 'zustand'
import type { IAppConfig, StatusFilter } from '@/types'
import { DEFAULT_CONFIG } from '@/utils/backup'
import { load, save, STORAGE_KEYS } from '@/utils/storage'

interface ConfigState extends IAppConfig {
  hydrate: (config: IAppConfig) => void
  setNickname: (nickname: string) => void
  setDefaultFilter: (defaultFilter: IAppConfig['defaultFilter']) => void
  setViewMode: (viewMode: IAppConfig['viewMode']) => void
  replaceAll: (config: IAppConfig) => void
  applyDefaultFilter: () => StatusFilter
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
      const next = { nickname, defaultFilter: get().defaultFilter, viewMode: get().viewMode }
      persistConfig(next)
      set({ nickname })
    },
    setDefaultFilter: (defaultFilter) => {
      const next = { nickname: get().nickname, defaultFilter, viewMode: get().viewMode }
      persistConfig(next)
      set({ defaultFilter })
    },
    setViewMode: (viewMode) => {
      const next = { nickname: get().nickname, defaultFilter: get().defaultFilter, viewMode }
      persistConfig(next)
      set({ viewMode })
    },
    replaceAll: (config) => {
      persistConfig(config)
      set(config)
    },
    applyDefaultFilter: () => get().defaultFilter,
  }
})
