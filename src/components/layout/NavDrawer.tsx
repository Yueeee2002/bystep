import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useUiStore } from '@/store/uiStore'
import { useCardStore } from '@/store/cardStore'
import { countWeeklyPlans } from '@/utils/models'
import styles from './NavDrawer.module.css'

const LINKS = [
  { to: '/', label: '首页', icon: '⌂' },
  { to: '/calendar', label: '打卡日历', icon: '日' },
  { to: '/archive', label: '归档', icon: '册' },
  { to: '/settings', label: '设置', icon: '○' },
]

export default function NavDrawer() {
  const open = useUiStore((state) => state.drawerOpen)
  const closeDrawer = useUiStore((state) => state.closeDrawer)
  const openTags = useUiStore((state) => state.openTags)
  const cards = useCardStore((state) => state.cards)
  const weekly = countWeeklyPlans(cards)
  const archived = cards.filter((card) => card.archived).length
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
              className={({ isActive }) => `${styles.link} ${isActive ? styles.on : ''}`}
              onClick={closeDrawer}
            >
              <span>{link.icon}</span>
              {link.label}
              {link.to === '/calendar' && weekly > 0 ? <em /> : null}
              {link.to === '/archive' && archived > 0 ? <em /> : null}
            </NavLink>
          ))}
          <button
            type="button"
            className={styles.link}
            onClick={() => {
              closeDrawer()
              openTags()
            }}
          >
            <span>签</span>
            标签管理
          </button>
        </nav>
      </aside>
    </div>
  )
}
