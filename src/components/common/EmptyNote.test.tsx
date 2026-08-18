import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EmptyNote from '@/components/common/EmptyNote'

describe('EmptyNote', () => {
  it('keeps the plain home empty state as title, hint and button only', () => {
    const onClick = vi.fn()
    const { container } = render(
      createElement(EmptyNote, {
        plain: true,
        title: '还没有收藏小店',
        text: '快来记录第一家吧',
        action: { label: '开始收纳', onClick },
      }),
    )
    expect(container.querySelectorAll('section')).toHaveLength(1)
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(container.querySelectorAll('div')).toHaveLength(0)
    expect(screen.getByRole('heading', { name: '还没有收藏小店' })).toBeTruthy()
    expect(screen.getByText('快来记录第一家吧')).toBeTruthy()
  })

  it('layers a single CSS backdrop under copy without blocking the button', async () => {
    const onClick = vi.fn()
    const { container } = render(
      createElement(EmptyNote, {
        plain: true,
        backdropUrl: '/assets/3.1.jpg',
        title: '还没有收藏小店',
        text: '快来记录第一家吧',
        action: { label: '开始收纳', onClick },
      }),
    )
    const section = container.querySelector('section')
    expect(section?.className).toMatch(/hasBackdrop/)
    expect(section?.style.getPropertyValue('--empty-backdrop')).toBe('url("/assets/3.1.jpg")')
    expect(container.querySelectorAll('img')).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: '开始收纳' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('stays blank when no backdrop url is resolved', () => {
    const { container } = render(
      createElement(EmptyNote, {
        plain: true,
        title: '这一格还空着',
        text: '换个品类看看，或把新的遇见轻轻收进来。',
      }),
    )
    const section = container.querySelector('section')
    expect(section?.className).not.toMatch(/hasBackdrop/)
    expect(section?.getAttribute('style')).toBeNull()
  })
})
