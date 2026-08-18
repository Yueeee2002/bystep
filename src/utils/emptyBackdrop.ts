import type { CategoryTab } from '@/types'

/** 各 Tab 空状态底图文件名。原图不做裁切或重处理，仅按文件名匹配。 */
export const EMPTY_BACKDROP_POOLS: Record<CategoryTab, readonly string[]> = {
  all: ['3.1.jpg', '3.2.jpg', '3.3.jpg'],
  catering: ['1.1.jpg', '1.2.jpg', '1.3.jpg', '1.4.jpg', '1.5.jpg'],
  other: ['2.1.jpg', '2.2.jpg'],
}

const EMPTY_BACKDROP_FILES = new Set(Object.values(EMPTY_BACKDROP_POOLS).flat())

const globbed = import.meta.glob('../assets/*.jpg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

export function fileNameFromAssetPath(path: string): string {
  const trimmed = path.split(/[?#]/, 1)[0] ?? path
  const parts = trimmed.split(/[/\\]/)
  return parts[parts.length - 1] ?? trimmed
}

/** 只收录空状态池里的文件；缺文件或 glob 未命中时静默跳过。 */
export function collectEmptyBackdropAssets(modules: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(modules)) {
    if (!url) continue
    const name = fileNameFromAssetPath(path)
    if (EMPTY_BACKDROP_FILES.has(name)) out[name] = url
  }
  return out
}

export const emptyBackdropAssets = collectEmptyBackdropAssets(globbed)

export function availableEmptyBackdrops(tab: CategoryTab, assets: Record<string, string>): string[] {
  const urls: string[] = []
  for (const name of EMPTY_BACKDROP_POOLS[tab]) {
    const url = assets[name]
    if (url) urls.push(url)
  }
  return urls
}

/** 该 Tab 空状态每次进入时挑 1 张；池为空则不渲染。 */
export function pickEmptyBackdropUrl(
  tab: CategoryTab,
  assets: Record<string, string> = emptyBackdropAssets,
  random: () => number = Math.random,
): string | undefined {
  const urls = availableEmptyBackdrops(tab, assets)
  if (urls.length === 0) return undefined
  const index = Math.min(urls.length - 1, Math.floor(random() * urls.length))
  return urls[index]
}
