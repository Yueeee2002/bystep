import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { detectDeviceViewport, resolveViewport } from '@/utils/viewport'

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('viewport', () => {
  it('treats phone user agents as mobile and desktop as pc', () => {
    expect(detectDeviceViewport('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('mobile')
    expect(detectDeviceViewport('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36')).toBe(
      'mobile',
    )
    expect(detectDeviceViewport('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('pc')
  })

  it('lets a manual preference override auto detection', () => {
    expect(resolveViewport('mobile', 'Mozilla/5.0 (Macintosh)')).toBe('mobile')
    expect(resolveViewport('pc', 'Mozilla/5.0 (iPhone)')).toBe('pc')
    expect(resolveViewport('auto', 'Mozilla/5.0 (iPhone)')).toBe('mobile')
  })

  it('locks pinch-zoom and horizontal page overflow', () => {
    const html = readFileSync(path.join(repoRoot, 'index.html'), 'utf8')
    expect(html).toContain(
      'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"',
    )
    const css = readFileSync(path.join(repoRoot, 'src/index.css'), 'utf8')
    expect(css).toMatch(/html,\s*body,\s*#root \{[\s\S]*?overflow-x:\s*hidden/)
    expect(css).toMatch(/font-size:\s*16px\s*!important/)
    const styles = readFileSync(path.join(repoRoot, 'src/index.css'), 'utf8')
      + readFileSync(path.join(repoRoot, 'src/components/Filter/FilterBar.module.css'), 'utf8')
      + readFileSync(path.join(repoRoot, 'src/components/common/Modal.module.css'), 'utf8')
      + readFileSync(path.join(repoRoot, 'src/components/common/TagModal.module.css'), 'utf8')
      + readFileSync(path.join(repoRoot, 'src/components/common/Toast.module.css'), 'utf8')
      + readFileSync(path.join(repoRoot, 'src/components/common/TagPicker.module.css'), 'utf8')
    expect(styles).not.toMatch(/100vw/)
  })
})


describe('viewport', () => {
  it('treats phone user agents as mobile and desktop as pc', () => {
    expect(detectDeviceViewport('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('mobile')
    expect(detectDeviceViewport('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36')).toBe(
      'mobile',
    )
    expect(detectDeviceViewport('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('pc')
  })

  it('lets a manual preference override auto detection', () => {
    expect(resolveViewport('mobile', 'Mozilla/5.0 (Macintosh)')).toBe('mobile')
    expect(resolveViewport('pc', 'Mozilla/5.0 (iPhone)')).toBe('pc')
    expect(resolveViewport('auto', 'Mozilla/5.0 (iPhone)')).toBe('mobile')
  })
})
