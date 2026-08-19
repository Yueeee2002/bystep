import { describe, expect, it } from 'vitest'
import { pickBurstStarSize } from '@/components/layout/splashStars'

describe('splash star particles', () => {
  it('picks a small, medium or large star instead of one uniform size', () => {
    expect(pickBurstStarSize(() => 0)).toBe(10)
    expect(pickBurstStarSize(() => 0.4)).toBeCloseTo(17.4, 5)
    expect(pickBurstStarSize(() => 0.99)).toBeCloseTo(27.94, 5)
  })

  it('stays within the 10px–28px burst range', () => {
    const sizes = Array.from({ length: 40 }, () => pickBurstStarSize())
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(10)
    expect(Math.max(...sizes)).toBeLessThanOrEqual(28)
    expect(new Set(sizes.map((size) => Math.round(size))).size).toBeGreaterThan(1)
  })
})
