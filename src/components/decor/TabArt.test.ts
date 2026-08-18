import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TabArt from '@/components/decor/TabArt'

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'TabArt.module.css'), 'utf8')

describe('TabArt', () => {
  it('renders a single photo and surrounding dots that do not capture clicks', () => {
    const { container } = render(createElement(TabArt, { src: '/assets/3.1.jpg' }))
    const photos = container.querySelectorAll('img')
    expect(photos).toHaveLength(1)
    expect(photos[0]?.getAttribute('src')).toBe('/assets/3.1.jpg')
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('pins a contained photo to the page bottom with mocha dots around all four sides', () => {
    expect(css).toMatch(/left:\s*50%/)
    expect(css).toMatch(/bottom:\s*12px/)
    expect(css).toMatch(/translateX\(-50%\)/)
    expect(css).toMatch(/max-width:\s*420px/)
    expect(css).toMatch(/max-height:\s*260px/)
    expect(css).toMatch(/max-width:\s*240px/)
    expect(css).toMatch(/max-height:\s*180px/)
    expect(css).toMatch(/opacity:\s*0\.4/)
    expect(css).toMatch(/opacity:\s*0\.32/)
    expect(css).toMatch(/object-fit:\s*contain/)
    expect(css).toMatch(/pointer-events:\s*none/)
    expect(css).toMatch(/rgba\(145,\s*115,\s*85,\s*0\.65\)/)
    expect(css).not.toMatch(/object-fit:\s*cover/)
    expect(css).not.toMatch(/top:\s*55%/)
    const photoBlock = css.match(/\.illustrationBg\s*\{[^}]+\}/)?.[0] ?? ''
    expect(photoBlock).not.toMatch(/mask-image/)
    expect(photoBlock).not.toMatch(/radial-gradient/)
    expect(css).toMatch(/\.dots\s*\{[\s\S]*radial-gradient/)
  })
})
