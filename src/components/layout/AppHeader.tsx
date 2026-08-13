import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/layout/Logo'
import { useUiStore } from '@/store/uiStore'
import { useConfigStore } from '@/store/configStore'
import { DEFAULT_HOME_SLOGAN } from '@/types'
import styles from './AppHeader.module.css'

interface AppHeaderProps {
  home?: boolean
  title?: string
  badge?: boolean
  actions?: ReactNode
}

export default function AppHeader({ home = false, title = '', badge, actions }: AppHeaderProps) {
  const navigate = useNavigate()
  const openDrawer = useUiStore((state) => state.openDrawer)
  const slogan = useConfigStore((state) => state.homeSlogan) || DEFAULT_HOME_SLOGAN
  const [scrolled, setScrolled] = useState(false)
  const [sloganIn, setSloganIn] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!home) return
    if (sessionStorage.getItem('liubu-slogan-flash')) {
      sessionStorage.removeItem('liubu-slogan-flash')
      setSloganIn(true)
      const timer = window.setTimeout(() => setSloganIn(false), 400)
      return () => window.clearTimeout(timer)
    }
  }, [home, slogan])

  const menu = (
    <button type="button" className={`icon-btn ${styles.menuBtn}`} aria-label="打开手账目录" onClick={openDrawer}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {badge ? <i className={styles.dot} /> : null}
    </button>
  )

  if (home) {
    return (
      <header className={`${styles.header} ${scrolled ? styles.compact : ''}`}>
        <div className={styles.brand}>
          {menu}
          <Logo className={styles.logoMark} />
          <div>
            <h1 className="brand-title">留步</h1>
            <p className={`${styles.slogan} ${sloganIn ? styles.sloganIn : ''}`}>{slogan}</p>
          </div>
        </div>
        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </header>
    )
  }

  return (
    <header className={`${styles.header} ${styles.sub} ${scrolled ? styles.compact : ''}`}>
      <div className={styles.subLead}>
        <button type="button" className={styles.back} aria-label="返回首页" onClick={() => navigate('/')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1>{title}</h1>
      </div>
      <div className={styles.headerActions}>
        {actions}
        {menu}
      </div>
    </header>
  )
}
