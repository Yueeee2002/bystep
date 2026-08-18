import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import EmptyNote from '@/components/common/EmptyNote'

describe('EmptyNote', () => {
  it('keeps the plain home empty state as title, hint and button only', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: '开始收纳' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
