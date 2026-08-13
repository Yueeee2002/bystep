import { TAG_COLORS } from '@/types'
import type { ICustomTagColor, TagColor } from '@/types'

export function resolveTagColor(
  color: string,
  extras: ICustomTagColor[] = [],
): { bg: string; fg: string; label: string } {
  if (color in TAG_COLORS) return TAG_COLORS[color as TagColor]
  const extra = extras.find((item) => item.id === color)
  if (extra) return { bg: extra.bg, fg: extra.fg, label: extra.label }
  return TAG_COLORS.mocha
}
