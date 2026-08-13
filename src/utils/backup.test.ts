import { describe, expect, it } from 'vitest'
import { buildBackupPayload, DEFAULT_CONFIG, parseBackupPayload } from '@/utils/backup'

describe('backup', () => {
  it('round-trips cards, tags and config', () => {
    const payload = buildBackupPayload(
      [
        {
          id: '1',
          title: '留一杯',
          images: [],
          coverIndex: 0,
          address: '杭州',
          tags: [],
          status: 'pending',
          notes: '',
          review: '',
          rating: 0,
          pinned: false,
          plannedAt: '',
          createdAt: 1,
          updatedAt: 1,
        },
      ],
      [{ id: 't1', name: '咖啡', color: 'mocha' }],
      { ...DEFAULT_CONFIG, nickname: '小雨' },
    )

    const parsed = parseBackupPayload(JSON.stringify(payload))
    expect(parsed.cards).toHaveLength(1)
    expect(parsed.tags[0].name).toBe('咖啡')
    expect(parsed.cards[0].coverIndex).toBe(0)
    expect(parsed.config.nickname).toBe('小雨')
  })

  it('rejects invalid json', () => {
    expect(() => parseBackupPayload('{')).toThrow('备份文件不是有效的 JSON')
  })

  it('rejects payload without cards', () => {
    expect(() => parseBackupPayload(JSON.stringify({ tags: [] }))).toThrow('备份文件缺少卡片或标签数据')
  })
})
