/** 点击粒子分三档随机大小，避免同一尺寸的实心圆点。 */
const STAR_SIZE_BANDS = [
  { min: 10, max: 14 },
  { min: 15, max: 21 },
  { min: 22, max: 28 },
] as const

export function pickBurstStarSize(random: () => number = Math.random): number {
  const band = STAR_SIZE_BANDS[Math.floor(random() * STAR_SIZE_BANDS.length)] ?? STAR_SIZE_BANDS[0]
  return band.min + random() * (band.max - band.min)
}
