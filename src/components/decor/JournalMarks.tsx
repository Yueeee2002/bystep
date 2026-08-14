import type { ReactNode } from 'react'
import styles from './JournalMarks.module.css'

/** 装饰跟随设置「全局交互动效」：html.no-motion 时动画全部关闭，便于测试。 */
export type DotSize = 6 | 4 | 2
export type DotTone = 'cream' | 'mocha'
export type StarTone = 'warm' | 'gray' | 'gold' | 'mint'
export type FoodKind = 'coffee' | 'cake' | 'onigiri'

interface DelayProps {
  delay?: string
  className?: string
}

export function DecorStar({ tone = 'gold', delay = '0s', className = '', inline = false }: DelayProps & { tone?: StarTone; inline?: boolean }) {
  return (
    <span
      className={`${styles.mark} ${styles.star} ${styles[tone]} ${inline ? styles.inline : ''} ${className}`.trim()}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24">
        <path d="M12 2.2c.55 3.4 1.7 6.1 4.9 9.8-3.2 3.6-4.35 6.4-4.9 9.8-.55-3.4-1.7-6.2-4.9-9.8C10.3 8.3 11.45 5.6 12 2.2Z" />
      </svg>
    </span>
  )
}

export function DecorDot({
  size = 4,
  tone = 'mocha',
  delay = '0s',
  className = '',
}: DelayProps & { size?: DotSize; tone?: DotTone }) {
  return (
    <span
      className={`${styles.mark} ${styles.dot} ${styles[`s${size}`]} ${styles[tone]} ${className}`.trim()}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    />
  )
}

export function DecorFood({ kind, delay = '0s', className = '' }: DelayProps & { kind: FoodKind }) {
  return (
    <span
      className={`${styles.mark} ${styles.food} ${className}`.trim()}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      {kind === 'coffee' ? (
        <svg viewBox="0 0 32 28">
          <path d="M4.2 9.2h17.4c.7 6.4-1.6 13.8-8.7 13.8S3.5 15.6 4.2 9.2Z" fill="#f4eee6" stroke="#5c4a38" strokeWidth="1.2" />
          <path d="M6.4 12.2h13.2M6.8 15.4h12.4" stroke="#6b7aa0" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M21.6 11.2c4.4.2 5.6 4.6 2.2 6.4" fill="none" stroke="#5c4a38" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="12.8" cy="9.4" rx="6.4" ry="1.6" fill="#c4a07a" />
        </svg>
      ) : kind === 'cake' ? (
        <svg viewBox="0 0 30 28">
          <path d="M6 18.5 15 6.8 24.4 18.6c-3.1 4.6-10.6 5-18.4-.1Z" fill="#f3e0c8" stroke="#5c4a38" strokeWidth="1.15" />
          <path d="M8.2 18.2c2.6 1.8 6.4 2.4 11.6.4" fill="none" stroke="#c9897a" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="15.1" cy="8.4" r="1.5" fill="#d9a07a" />
          <path d="M14.4 8.2c.1-2.4 1.8-3.6 3.6-2.4" fill="none" stroke="#7a9a72" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 28 28">
          <path d="M14 4.2 23.4 21.6c-3 .9-6.2 1.4-9.4 1.3-3.3 0-6.4-.6-9.2-1.5L14 4.2Z" fill="#f7f1e6" stroke="#5c4a38" strokeWidth="1.2" />
          <path d="M10.4 16.2h7.4c.1 2.6-1.6 4.8-3.7 4.8s-3.8-2.1-3.7-4.8Z" fill="#4a5344" />
        </svg>
      )}
    </span>
  )
}

export function DecorLayer({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`${styles.layer} ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  )
}
