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
  return (
    <label className={styles.picker} style={dotVars(value, size)}>
      <ColorDot color={value} size={size} decorative />
      <input
        type="color"
        className={styles.native}
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
