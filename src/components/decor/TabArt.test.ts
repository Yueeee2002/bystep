import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TabArt from '@/components/decor/TabArt'

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'TabArt.module.css'), 'utf8')

describe('TabArt', () => {
  it('renders a single photo that does not capture clicks', () => {
    const { container } = render(createElement(TabArt, { src: '/assets/3.1.jpg' }))
    const photos = container.querySelectorAll('img')
    expect(photos).toHaveLength(1)
    expect(photos[0]?.getAttribute('src')).toBe('/assets/3.1.jpg')
    expect(photos[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('keeps original aspect ratio and only slightly feathers the edge', () => {
    expect(css).toMatch(/object-fit:\s*contain/)
    expect(css).toMatch(/opacity:\s*0\.4/)
    expect(css).toMatch(/linear-gradient/)
    expect(css).not.toMatch(/radial-gradient/)
    expect(css).not.toMatch(/object-fit:\s*cover/)
  })
})
