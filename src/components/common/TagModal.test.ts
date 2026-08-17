import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = path.dirname(fileURLToPath(import.meta.url))

describe('TagModal color presets', () => {
  it('does not update list state when hovering preset dots', () => {
    const src = readFileSync(path.join(here, 'TagModal.tsx'), 'utf8')
    expect(src).not.toContain('setPreviewColor')
    expect(src).not.toContain('onMouseEnter')
    expect(src).not.toContain('onMouseLeave')
  })
})
