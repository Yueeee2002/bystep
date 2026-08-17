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
          categoryGroup: 'catering',
          likeCount: 0,
          createdAt: 1,
          updatedAt: 1,
          visitDate: '',
          archived: false,
          sortIndex: 1,
        },
      ],
      [{ id: 't1', name: '咖啡', color: 'mocha', group: 'catering' }],
      { ...DEFAULT_CONFIG, nickname: '小雨' },
    )

    const parsed = parseBackupPayload(JSON.stringify(payload))
    expect(parsed.cards).toHaveLength(1)
    expect(parsed.tags[0].name).toBe('咖啡')
    expect(parsed.cards[0].coverIndex).toBe(0)
    expect(parsed.config.nickname).toBe('小雨')
    expect(parsed.config.homeSlogan).toBe('把种草的店，轻轻收好')
    expect(parsed.config.viewportPreference).toBe('auto')
  })

  it('keeps a saved viewport preference', () => {
    const parsed = parseBackupPayload(JSON.stringify({
      cards: [],
      tags: [],
      config: { viewportPreference: 'mobile' },
    }))
    expect(parsed.config.viewportPreference).toBe('mobile')
  })

  it('keeps default slogan and clips custom copy to 20 chars', () => {
    expect(parseBackupPayload(JSON.stringify({
      cards: [],
      tags: [],
      config: {},
    })).config.homeSlogan).toBe('把种草的店，轻轻收好')

    const long = '收集每一次烟火与闲逛再写一串超过二十个字的标语'
    expect(parseBackupPayload(JSON.stringify({
      cards: [],
      tags: [],
      config: { homeSlogan: long },
    })).config.homeSlogan).toBe(long.slice(0, 20))
  })

  it('keeps custom tag colors even when the internal name is empty', () => {
    const parsed = parseBackupPayload(JSON.stringify({
      cards: [],
      tags: [],
      config: {
        customTagColors: [{ id: 'custom_1', label: '', bg: '#d4ead9', fg: '#3d5c45' }],
      },
    }))
    expect(parsed.config.customTagColors).toEqual([
      { id: 'custom_1', label: '', bg: '#d4ead9', fg: '#3d5c45' },
    ])
  })

  it('rejects invalid json', () => {
    expect(() => parseBackupPayload('{')).toThrow('备份文件不是有效的 JSON')
  })

  it('rejects payload without cards', () => {
    expect(() => parseBackupPayload(JSON.stringify({ tags: [] }))).toThrow('备份文件缺少卡片或标签数据')
  })
})
