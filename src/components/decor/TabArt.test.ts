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
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('prints a lighter photo into the paper without a card shell', () => {
    expect(css).toMatch(/background-color:\s*transparent/)
    expect(css).toMatch(/border-radius:\s*0/)
    expect(css).toMatch(/box-shadow:\s*none/)
    expect(css).toMatch(/opacity:\s*0\.32/)
    expect(css).toMatch(/opacity:\s*0\.28/)
    expect(css).toMatch(/object-fit:\s*contain/)
    expect(css).toMatch(/mix-blend-mode:\s*multiply/)
    expect(css).toMatch(/pointer-events:\s*none/)
    expect(css).toMatch(/transparent 72%/)
    expect(css).toMatch(/max-width:\s*420px/)
    expect(css).toMatch(/max-height:\s*260px/)
    const photoBlock = css.match(/\.illustrationBg\s*\{[^}]+\}/)?.[0] ?? ''
    expect(photoBlock).not.toMatch(/mask-image/)
    expect(photoBlock).not.toMatch(/box-shadow/)
    expect(css).toMatch(/\.dots\s*\{/)
  })
})
