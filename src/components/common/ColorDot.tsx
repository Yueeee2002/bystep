import { useRef } from 'react'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from 'react'
import styles from './ColorDot.module.css'

export const COLOR_DOT_SIZE = 20

function dotVars(color: string, size: number): CSSProperties {
  return {
    '--dot-size': `${size}px`,
    '--dot-color': color,
  } as CSSProperties
}

interface ColorDotProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  color: string
  selected?: boolean
  size?: number
  decorative?: boolean
}

export default function ColorDot({
  color,
  selected = false,
  size = COLOR_DOT_SIZE,
  decorative = false,
  className = '',
  onClick,
  ...rest
}: ColorDotProps) {
  const classNames = `${styles.dot} ${selected ? styles.dotOn : ''} ${className}`.trim()
  const style = dotVars(color, size)

  if (onClick) {
    return (
      <button
        type="button"
        className={classNames}
        style={style}
        aria-pressed={selected}
        onClick={onClick}
        {...rest}
      />
    )
  }

  return (
    <span
      className={classNames}
      style={style}
      aria-hidden={decorative || undefined}
      {...(rest as HTMLAttributes<HTMLSpanElement>)}
    />
  )
}

interface ColorPickerDotProps {
  value: string
  onChange: (hex: string) => void
  ariaLabel: string
  size?: number
}

export function ColorPickerDot({
  value,
  onChange,
  ariaLabel,
  size = COLOR_DOT_SIZE,
}: ColorPickerDotProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <span className={styles.picker}>
      <ColorDot
        color={value}
        size={size}
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
      />
      <input
        ref={inputRef}
        type="color"
        className={styles.native}
        value={value}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  )
}
