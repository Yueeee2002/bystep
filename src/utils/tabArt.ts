import type { CategoryTab } from '@/types'
import catering1 from '@/assets/1.1.jpg'
import catering2 from '@/assets/1.2.jpg'
import catering3 from '@/assets/1.3.jpg'
import catering4 from '@/assets/1.4.jpg'
import catering5 from '@/assets/1.5.jpg'
import other1 from '@/assets/2.1.jpg'
import other2 from '@/assets/2.2.jpg'
import all1 from '@/assets/3.1.jpg'
import all2 from '@/assets/3.2.jpg'
import all3 from '@/assets/3.3.jpg'

/** 各 Tab 底层插画文件名。原图不做裁切或重处理，仅按文件名匹配。 */
export const TAB_ART_POOLS: Record<CategoryTab, readonly string[]> = {
  all: ['3.1.jpg', '3.2.jpg', '3.3.jpg'],
  catering: ['1.1.jpg', '1.2.jpg', '1.3.jpg', '1.4.jpg', '1.5.jpg'],
  other: ['2.1.jpg', '2.2.jpg'],
}

const TAB_ART_FILES = new Set(Object.values(TAB_ART_POOLS).flat())

const bundledTabPhotos = {
  '1.1.jpg': catering1,
  '1.2.jpg': catering2,
  '1.3.jpg': catering3,
  '1.4.jpg': catering4,
  '1.5.jpg': catering5,
  '2.1.jpg': other1,
  '2.2.jpg': other2,
  '3.1.jpg': all1,
  '3.2.jpg': all2,
  '3.3.jpg': all3,
} as const

export function fileNameFromAssetPath(path: string): string {
  const trimmed = path.split(/[?#]/, 1)[0] ?? path
  const parts = trimmed.split(/[/\\]/)
  return parts[parts.length - 1] ?? trimmed
}

/** 只收录 Tab 插画池里的文件；缺文件或值为空时静默跳过。 */
export function collectTabArtAssets(modules: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(modules)) {
    if (!url) continue
    const name = fileNameFromAssetPath(path)
    if (TAB_ART_FILES.has(name)) out[name] = url
  }
  return out
}

export const tabArtAssets = collectTabArtAssets(bundledTabPhotos)

export function availableTabArt(tab: CategoryTab, assets: Record<string, string>): string[] {
  const urls: string[] = []
  for (const name of TAB_ART_POOLS[tab]) {
    const url = assets[name]
    if (url) urls.push(url)
  }
  return urls
}

/** 每次切入该 Tab 时挑 1 张；池为空则不渲染。 */
export function pickTabArtUrl(
  tab: CategoryTab,
  assets: Record<string, string> = tabArtAssets,
  random: () => number = Math.random,
): string | undefined {
  const urls = availableTabArt(tab, assets)
  if (urls.length === 0) return undefined
  const index = Math.min(urls.length - 1, Math.floor(random() * urls.length))
  return urls[index]
}
