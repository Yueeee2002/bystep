import { create } from 'zustand'
import type { IAppConfig, StatusFilter, ViewportMode } from '@/types'
import { normalizeConfig } from '@/utils/backup'
import { load, save, STORAGE_KEYS } from '@/utils/storage'

interface ConfigState extends IAppConfig {
  hydrate: (config: IAppConfig) => void
  patchConfig: (patch: Partial<IAppConfig>) => void
  setNickname: (nickname: string) => void
  setMotto: (motto: string) => void
  setAvatar: (avatar: string) => void
  setPhone: (phone: string) => void
  setPasswordSet: (passwordSet: boolean) => void
  setHomeSlogan: (homeSlogan: string) => void
  setDefaultFilter: (defaultFilter: IAppConfig['defaultFilter']) => void
  setViewMode: (viewMode: IAppConfig['viewMode']) => void
  setTheme: (theme: IAppConfig['theme']) => void
  toggleTheme: () => void
  setViewportPreference: (viewportPreference: IAppConfig['viewportPreference']) => void
  toggleViewport: (current: ViewportMode) => void
  setCalendarView: (calendarView: IAppConfig['calendarView']) => void
  setMotion: (motion: boolean) => void
  setCategoryLabels: (categoryLabels: IAppConfig['categoryLabels']) => void
  setCustomTagColors: (customTagColors: IAppConfig['customTagColors']) => void
  setArchiveFolders: (archiveFolders: IAppConfig['archiveFolders']) => void
  setCloudBackup: (cloudBackup: boolean) => void
  replaceAll: (config: IAppConfig) => void
  applyDefaultFilter: () => StatusFilter
}

function persistConfig(config: IAppConfig) {
  save(STORAGE_KEYS.config, config)
}

export const useConfigStore = create<ConfigState>((set, get) => {
  const initial = normalizeConfig(load<Partial<IAppConfig>>(STORAGE_KEYS.config, {}))
  const patchConfig = (patch: Partial<IAppConfig>) => {
    const next = normalizeConfig({ ...get(), ...patch })
    persistConfig(next)
    set(next)
  }
  return {
    ...initial,
    hydrate: (config) => set(normalizeConfig(config)),
    patchConfig,
    setNickname: (nickname) => patchConfig({ nickname }),
    setMotto: (motto) => patchConfig({ motto }),
    setAvatar: (avatar) => patchConfig({ avatar }),
    setPhone: (phone) => patchConfig({ phone }),
    setPasswordSet: (passwordSet) => patchConfig({ passwordSet }),
    setHomeSlogan: (homeSlogan) => patchConfig({ homeSlogan }),
    setDefaultFilter: (defaultFilter) => patchConfig({ defaultFilter }),
    setViewMode: (viewMode) => patchConfig({ viewMode }),
    setTheme: (theme) => patchConfig({ theme }),
    toggleTheme: () => patchConfig({ theme: get().theme === 'night' ? 'cream' : 'night' }),
    setViewportPreference: (viewportPreference) => patchConfig({ viewportPreference }),
    toggleViewport: (current) => patchConfig({ viewportPreference: current === 'pc' ? 'mobile' : 'pc' }),
    setCalendarView: (calendarView) => patchConfig({ calendarView }),
    setMotion: (motion) => patchConfig({ motion }),
    setCategoryLabels: (categoryLabels) => patchConfig({ categoryLabels }),
    setCustomTagColors: (customTagColors) => patchConfig({ customTagColors }),
    setArchiveFolders: (archiveFolders) => patchConfig({ archiveFolders }),
    setCloudBackup: (cloudBackup) => patchConfig({ cloudBackup }),
    replaceAll: (config) => {
      const next = normalizeConfig(config)
      persistConfig(next)
      set(next)
    },
    applyDefaultFilter: () => get().defaultFilter,
  }
})
