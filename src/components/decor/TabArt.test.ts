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

  it('uses a slightly larger, lower-center PC layout and a smaller bottom photo on mobile', () => {
    expect(css).toMatch(/top:\s*55%/)
    expect(css).toMatch(/left:\s*50%/)
    expect(css).toMatch(/translate\(-50%,\s*-50%\)/)
    expect(css).toMatch(/max-width:\s*420px/)
    expect(css).toMatch(/max-height:\s*260px/)
    expect(css).toMatch(/max-width:\s*240px/)
    expect(css).toMatch(/max-height:\s*180px/)
    expect(css).toMatch(/bottom:\s*10px/)
    expect(css).toMatch(/opacity:\s*0\.4/)
    expect(css).toMatch(/opacity:\s*0\.32/)
    expect(css).toMatch(/object-fit:\s*contain/)
    expect(css).toMatch(/pointer-events:\s*none/)
    expect(css).not.toMatch(/object-fit:\s*cover/)
    const photoBlock = css.match(/\.illustrationBg\s*\{[^}]+\}/)?.[0] ?? ''
    expect(photoBlock).not.toMatch(/radial-gradient/)
    expect(css).toMatch(/\.dots\s*\{[\s\S]*radial-gradient/)
  })
})
