import { DecorDot, DecorLayer, DecorStar } from '@/components/decor/JournalMarks'
import styles from './JournalScene.module.css'

type SceneKind = 'home' | 'tags' | 'search' | 'loading' | 'splash'

interface JournalSceneProps {
  kind?: SceneKind
  className?: string
}

/** 手绘小碗 + 日式小屋，开屏 / 空状态 / 加载共用。 */
export default function JournalScene({ kind = 'home', className = '' }: JournalSceneProps) {
  return (
    <div className={`${styles.wrap} ${styles[kind]} ${className}`.trim()} aria-hidden="true">
      {kind === 'search' ? <MagnifierArt /> : <BowlHouseArt compact={kind === 'loading' || kind === 'tags'} />}
      <DecorLayer className={styles.deco}>
        {kind === 'search' ? (
          <>
            <DecorStar delay="0.2s" className={styles.p1} />
            <DecorDot size={4} delay="0.8s" className={styles.p2} />
            <DecorDot size={2} tone="cream" delay="1.4s" className={styles.p3} />
          </>
        ) : (
          <>
            <DecorStar delay="0s" className={styles.p1} />
            <DecorDot size={6} delay="0.6s" className={styles.p2} />
            <DecorDot size={2} tone="cream" delay="1.2s" className={styles.p3} />
            {kind === 'home' || kind === 'splash' || kind === 'loading' ? (
              <>
                <DecorStar tone="warm" delay="1.6s" className={styles.p4} />
                <DecorDot size={4} delay="2s" className={styles.p5} />
              </>
            ) : null}
          </>
        )}
      </DecorLayer>
    </div>
  )
}

function BowlHouseArt({ compact }: { compact?: boolean }) {
  return (
    <svg className={styles.art} viewBox="0 0 240 140" fill="none">
      {/* 小屋 */}
      <path d="M128 86.5c1.2-18 8-38 34.5-46.2 21-6.4 46.2 3.2 52.4 24.8 3.4 12.2-1.2 29.4-18 36.6-18.4 8-49.6 4.6-68.9-15.2Z" fill="#efe4d2" stroke="#5b4a38" strokeWidth="1.35" />
      <path d="M150.2 48.4 206 62.2l-8.6 28.4-58.4-16.6 11.2-25.6Z" fill="#c9b08a" stroke="#5b4a38" strokeWidth="1.2" />
      <path d="M146 72h18.5v16.8H146z" fill="#f7f1e6" stroke="#5b4a38" strokeWidth="1.1" />
      <path d="M155.2 72v16.8" stroke="#5b4a38" strokeWidth="0.9" />
      <path d="M176.4 78.2h16.2v22.4c-2.2 1.6-8.4 2.4-16.2 0V78.2Z" fill="#d7c4a4" stroke="#5b4a38" strokeWidth="1.15" />
      <path d="M138.6 58.2h46" stroke="#7a90b0" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M141 55.4h6M151 55.2h6M161 55.6h6M171 55.3h6" stroke="#f7f1e6" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="214.4" cy="70.6" r="3.2" fill="#c5d0b8" stroke="#5b4a38" strokeWidth="0.8" />
      <path d="M214.4 73.6v12.4" stroke="#7a8a6e" strokeWidth="1.1" />

      {/* 小碗 */}
      <ellipse cx="68" cy="96" rx="46" ry="14" fill="#eadcc8" stroke="#5b4a38" strokeWidth="1.3" />
      <path d="M24.6 94c2.4 22 18.8 34.6 43.6 34.6S109 116 111.2 94" fill="#f4eee4" stroke="#5b4a38" strokeWidth="1.35" />
      <ellipse cx="68" cy="93.2" rx="38" ry="10.4" fill="#efe2cf" />
      <ellipse cx="56" cy="91.6" rx="9.4" ry="6.2" fill="#e8c56a" stroke="#c9a24a" strokeWidth="0.8" />
      <ellipse cx="76.4" cy="90.4" rx="8.2" ry="5.6" fill="#e8c56a" stroke="#c9a24a" strokeWidth="0.8" />
      <path d="M88.2 88.6c4.2-1.4 8.6 1.2 7.4 5.4" fill="#7ea077" stroke="#5b4a38" strokeWidth="0.9" />
      <path d="M48 78c-1.2-8.4 2.2-12.6 6.4-13.2" stroke="#c4b49a" strokeWidth="1.15" strokeLinecap="round" />
      <path d="M62.4 74.2c.2-9.2 4.8-13 8.8-12.4" stroke="#c4b49a" strokeWidth="1.15" strokeLinecap="round" />
      {compact ? null : <circle cx="39.6" cy="108.4" r="2.1" fill="#d8cfc0" opacity="0.7" />}
    </svg>
  )
}

function MagnifierArt() {
  return (
    <svg className={styles.art} viewBox="0 0 120 120" fill="none">
      <circle cx="52" cy="50" r="26" fill="#f7f1e6" stroke="#5b4a38" strokeWidth="1.6" />
      <circle cx="52" cy="50" r="16" fill="#efe4d2" stroke="#c4b49a" strokeWidth="1.1" />
      <path d="M70 70.4 92.6 96.2" stroke="#5b4a38" strokeWidth="6.2" strokeLinecap="round" />
      <path d="M70 70.4 92.6 96.2" stroke="#c9b08a" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}
