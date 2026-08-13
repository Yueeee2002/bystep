import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useUiStore } from '@/store/uiStore'
import styles from './NavDrawer.module.css'

const LINKS: { to: string; label: string; icon: ReactNode }[] = [
  { to: '/profile', label: '个人主页', icon: <PersonIcon /> },
  { to: '/calendar', label: '打卡日历', icon: <CalendarIcon /> },
  { to: '/tags', label: '标签管理', icon: <TagIcon /> },
  { to: '/archive', label: '归档合集', icon: <FolderIcon /> },
  { to: '/stats', label: '数据统计', icon: <ChartIcon /> },
  { to: '/settings', label: '设置', icon: <GearIcon /> },
]

function LineIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  )
}

function PersonIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="8" r="3.05" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.6 18.6c.7-3.05 3.2-4.85 6.4-4.85s5.7 1.8 6.4 4.85" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </LineIcon>
  )
}

function CalendarIcon() {
  return (
    <LineIcon>
      <rect x="4.5" y="5.5" width="15" height="14" rx="1.8" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 4.5v3M16 4.5v3M4.5 9.5h15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </LineIcon>
  )
}

function TagIcon() {
  return (
    <LineIcon>
      <path
        d="M4.8 12.2 12.1 4.9a1.6 1.6 0 0 1 1.1-.45h5.1v5.1c0 .42-.17.83-.46 1.12L10.5 18.4a1.2 1.2 0 0 1-1.7 0L4.8 13.9a1.2 1.2 0 0 1 0-1.7Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="16.1" cy="7.9" r="0.9" stroke="currentColor" strokeWidth="1.2" />
    </LineIcon>
  )
}

function FolderIcon() {
  return (
    <LineIcon>
      <path
        d="M4.6 7.4h5.1l1.6 1.8h8.1v9.4H4.6V7.4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M4.6 11.2h14.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </LineIcon>
  )
}

function ChartIcon() {
  return (
    <LineIcon>
      <path d="M5 18.5V14M10 18.5V9.5M15 18.5v-6M20 18.5V7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M5 11.5 10 8l5 2.5 5-5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </LineIcon>
  )
}

function GearIcon() {
  return (
    <LineIcon>
      <circle cx="12" cy="12" r="2.9" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M12 4.6 12.7 6.8l2.3-.5.9 2.1 2.2.7-.5 2.3.5 2.3-2.2.7-.9 2.1-2.3-.5L12 19.4l-.7-2.2-2.3.5-.9-2.1-2.2-.7.5-2.3-.5-2.3 2.2-.7.9-2.1 2.3.5L12 4.6Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </LineIcon>
  )
}

export default function NavDrawer() {
  const open = useUiStore((state) => state.drawerOpen)
  const closeDrawer = useUiStore((state) => state.closeDrawer)
  const [shown, setShown] = useState(open)

  useEffect(() => {
    if (open) {
      setShown(true)
      return
    }
    const timer = window.setTimeout(() => setShown(false), 220)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!shown) return null

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={`${styles.backdrop} ${open ? '' : styles.backdropOut}`}
        aria-label="关闭菜单"
        onClick={closeDrawer}
      />
      <aside className={`${styles.panel} ${open ? '' : styles.panelOut}`}>
        <div className={styles.head}>
          <p>手账目录</p>
          <button type="button" className={styles.close} aria-label="关闭目录" onClick={closeDrawer}>
            ×
          </button>
        </div>
        <nav>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => `${styles.link} ${isActive ? styles.on : ''}`}
              onClick={closeDrawer}
            >
              <span className={styles.icon}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  )
}
