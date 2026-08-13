import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/layout/Logo'
import { useUiStore } from '@/store/uiStore'
import { useConfigStore } from '@/store/configStore'
import styles from './AppHeader.module.css'

interface AppHeaderProps {
  compact?: boolean
  badge?: boolean
  subtitle?: string
}

export default function AppHeader({ compact, badge, subtitle = '把种草的店，轻轻收好' }: AppHeaderProps) {
  const openDrawer = useUiStore((state) => state.openDrawer)
  const theme = useConfigStore((state) => state.theme)
  const toggleTheme = useConfigStore((state) => state.toggleTheme)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.header} ${compact || scrolled ? styles.compact : ''}`}>
      <div className={styles.brand}>
        <button type="button" className={`icon-btn ${styles.menuBtn}`} aria-label="打开菜单" onClick={openDrawer}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {badge ? <i className={styles.dot} /> : null}
        </button>
        <Logo className={styles.logoMark} />
        <div>
          <h1 className="brand-title">留步</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className={styles.headerActions}>
        <Link to="/settings" className="icon-btn" aria-label="个人中心">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8.2" r="3.05" stroke="currentColor" strokeWidth="1.35" />
            <path
              d="M5.4 18.6c.7-3.1 3.3-4.9 6.6-4.9s5.9 1.8 6.6 4.9"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <button type="button" className="icon-btn" aria-label="切换主题" onClick={toggleTheme}>
          {theme === 'night' ? '☾' : '☀'}
        </button>
      </div>
    </header>
  )
}
