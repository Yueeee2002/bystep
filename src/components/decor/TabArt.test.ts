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

  it('centers a smaller photo in the page without cropping or a radial mask', () => {
    expect(css).toMatch(/top:\s*50%/)
    expect(css).toMatch(/left:\s*50%/)
    expect(css).toMatch(/translate\(-50%,\s*calc\(-50% \+ 48px\)\)/)
    expect(css).toMatch(/max-height:\s*220px/)
    expect(css).toMatch(/max-width:\s*65%/)
    expect(css).toMatch(/max-width:\s*75vw/)
    expect(css).toMatch(/max-height:\s*30vh/)
    expect(css).toMatch(/object-fit:\s*contain/)
    expect(css).toMatch(/opacity:\s*0\.4/)
    expect(css).toMatch(/pointer-events:\s*none/)
    expect(css).not.toMatch(/radial-gradient/)
    expect(css).not.toMatch(/object-fit:\s*cover/)
    expect(css).not.toMatch(/bottom:\s*0/)
  })
})
