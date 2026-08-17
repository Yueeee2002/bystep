import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ColorDot, { ColorPickerDot } from '@/components/common/ColorDot'

describe('ColorDot', () => {
  it('renders a round swatch without any color name text', () => {
    const { container } = render(createElement(ColorDot, { color: '#e8d5b7', decorative: true }))
    expect(container.textContent).toBe('')
    expect(screen.queryByText('奶咖')).toBeNull()
    expect(screen.queryByText('浅绿')).toBeNull()
  })

  it('marks the selected preset and stays clickable', async () => {
    const onClick = vi.fn()
    render(
      createElement(ColorDot, {
        color: '#d4ead9',
        selected: true,
        'aria-label': '选择配色',
        onClick,
      }),
    )
    const button = screen.getByRole('button', { name: '选择配色' })
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(button.style.transform).toBe('')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('hides the native color input behind a round swatch', () => {
    const onChange = vi.fn()
    const { container } = render(
      createElement(ColorPickerDot, {
        value: '#5c4630',
        ariaLabel: '选择标签文字颜色',
        onChange,
      }),
    )
    const input = screen.getByLabelText('选择标签文字颜色')
    expect(input.getAttribute('type')).toBe('color')
    expect(container.querySelectorAll('input').length).toBe(1)
  })
})
