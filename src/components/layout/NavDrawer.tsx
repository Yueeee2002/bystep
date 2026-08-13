import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useUiStore } from '@/store/uiStore'
import { useCardStore } from '@/store/cardStore'
import { countWeeklyPlans } from '@/utils/models'
import styles from './NavDrawer.module.css'

const LINKS = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/profile', label: '个人主页', icon: '👤' },
  { to: '/calendar', label: '打卡日历', icon: '📅' },
  { to: '/tags', label: '标签管理', icon: '🏷️' },
  { to: '/archive', label: '归档合集', icon: '📁' },
  { to: '/stats', label: '数据统计', icon: '📊' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export default function NavDrawer() {
  const open = useUiStore((state) => state.drawerOpen)
  const closeDrawer = useUiStore((state) => state.closeDrawer)
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
              end
              className={({ isActive }) => `${styles.link} ${isActive ? styles.on : ''}`}
              onClick={closeDrawer}
            >
              <span>{link.icon}</span>
              {link.label}
              {link.to === '/calendar' && weekly > 0 ? <em /> : null}
              {link.to === '/archive' && archived > 0 ? <em /> : null}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  )
}
