import { useEffect, useMemo, useState } from 'react'
import AppHeader from '@/components/layout/AppHeader'
import EmptyNote from '@/components/common/EmptyNote'
import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { TAG_COLORS } from '@/types'
import type { CategoryTab, IExploreCard } from '@/types'
import { buildMonthCells, buildWeekCells, countStreak, monthVisitStats, visitsForMonth } from '@/utils/calendar'
import { monthLabel, shiftMonth, toIsoDate } from '@/utils/dates'
import styles from './CalendarPage.module.css'

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function Marks({ catering, other, stacked }: { catering: number; other: number; stacked?: boolean }) {
  if (catering + other === 0) return null
  if (stacked) {
    return <span className={styles.stack}>{(catering + other).toString()}</span>
  }
  return (
    <span className={styles.marks}>
      {catering > 0 ? <i className={styles.meal} title="食肆小店">餐</i> : null}
      {other > 0 ? <i className={styles.leaf} title="野趣小仓">叶</i> : null}
    </span>
  )
}

export default function CalendarPage() {
  const now = new Date()
  const cards = useCardStore((state) => state.cards)
  const tags = useTagStore((state) => state.tags)
  const openEdit = useUiStore((state) => state.openEdit)
  const openUpload = useUiStore((state) => state.openUpload)
  const showToast = useUiStore((state) => state.showToast)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [tab, setTab] = useState<CategoryTab>('all')
  const [mode, setMode] = useState<'month' | 'week'>('month')
  const [selected, setSelected] = useState<string | null>(null)
  const [flip, setFlip] = useState<'left' | 'right' | ''>('')

  const visits = useMemo(() => visitsForMonth(cards, year, month, tab), [cards, year, month, tab])
  const stats = useMemo(() => monthVisitStats(visits), [visits])
  const cells = useMemo(
    () =>
      mode === 'week'
        ? buildWeekCells(new Date(year, month - 1, 15), visits)
        : buildMonthCells(year, month, visits),
    [mode, year, month, visits],
  )
  const streak = useMemo(() => countStreak(cards), [cards])

  useEffect(() => {
    if (streak !== 3 && streak !== 7) return
    const key = `liubu-streak-${streak}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    showToast(streak === 3 ? '连续 3 天，贴上一枚小贴纸' : '连续 7 天，手账勋章已盖上', 'success')
  }, [streak, showToast])
  const dayCards: IExploreCard[] = visits.find((item) => item.date === selected)?.cards ?? []

  const turn = (delta: number) => {
    setFlip(delta > 0 ? 'left' : 'right')
    const next = shiftMonth(year, month, delta)
    setYear(next.year)
    setMonth(next.month)
    setSelected(null)
    window.setTimeout(() => setFlip(''), 300)
  }

  const goToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
    setSelected(toIsoDate(now))
  }

  const pickDay = (cell: (typeof cells)[number]) => {
    if (!cell.inMonth && mode === 'month') return
    setSelected(cell.date)
  }

  const createFor = (date: string) => {
    openUpload({ visitDate: date, status: 'done' })
    showToast('将为所选日期记下打卡', 'info')
  }

  return (
    <div className="app-shell page-enter">
      <AppHeader subtitle="把出门的日子，轻轻圈上" badge={streak >= 3} />
      <div className={styles.top}>
        <button type="button" className={styles.nav} onClick={() => turn(-1)} aria-label="上月">
          ←
        </button>
        <h2>{monthLabel(year, month)}</h2>
        <button type="button" className={styles.nav} onClick={() => turn(1)} aria-label="下月">
          →
        </button>
      </div>
      <div className={styles.tools}>
        <button type="button" className={styles.today} onClick={goToday}>
          回到本月
        </button>
        <div className={styles.filters}>
          {(
            [
              ['all', '全部'],
              ['catering', '食肆小店'],
              ['other', '野趣小仓'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`chip ${tab === value ? 'active' : ''}`}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className={styles.mode} onClick={() => setMode((prev) => (prev === 'month' ? 'week' : 'month'))}>
          {mode === 'month' ? '周视图' : '月视图'}
        </button>
      </div>
      {streak > 0 ? <p className={styles.streak}>已连续打卡 {streak} 天</p> : null}

      <div className={`${styles.book} ${flip === 'left' ? styles.flipLeft : ''} ${flip === 'right' ? styles.flipRight : ''}`}>
        <div className={styles.weekdays}>
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className={mode === 'week' ? styles.weekGrid : styles.grid}>
          {cells.map((cell) => (
            <button
              key={cell.date}
              type="button"
              className={`${styles.cell} ${cell.inMonth ? '' : styles.out} ${cell.isToday ? styles.todayCell : ''} ${
                selected === cell.date ? styles.cellOn : ''
              }`}
              disabled={!cell.inMonth && mode === 'month'}
              onClick={() => pickDay(cell)}
            >
              <strong>{cell.day}</strong>
              <Marks catering={cell.catering} other={cell.other} stacked={cell.total >= 3} />
            </button>
          ))}
        </div>
      </div>

      <p className={styles.foot}>
        当月总计打卡：{stats.total} 次・食肆小店 {stats.catering} 次・野趣小仓 {stats.other} 次
      </p>

      {stats.total === 0 ? (
        <EmptyNote title="本月还很安静" text="本月还没有出门探店，快去记录第一笔美好吧✨" action={{ label: '新建打卡', onClick: () => createFor(toIsoDate()) }} />
      ) : null}

      {selected ? (
        <aside className={styles.drawer}>
          <div className={styles.drawerHead}>
            <h3>{selected}</h3>
            <button type="button" className="btn btn-text" onClick={() => setSelected(null)}>
              关闭
            </button>
          </div>
          {dayCards.length === 0 ? (
            <div className={styles.emptyDay}>
              <p>今日暂无打卡记录</p>
              <button type="button" className="btn btn-primary" onClick={() => createFor(selected)}>
                新建打卡
              </button>
            </div>
          ) : (
            <ul className={styles.dayList}>
              {dayCards.map((card) => (
                <li key={card.id}>
                  <button type="button" onClick={() => openEdit(card.id)}>
                    <b>{card.title.trim() || '未命名地点'}</b>
                    <span>{card.categoryGroup === 'catering' ? '食肆小店' : '野趣小仓'}</span>
                    <em>
                      {card.tags
                        .map((id) => tags.find((tag) => tag.id === id))
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((tag) => (
                          <i key={tag!.id} style={{ background: TAG_COLORS[tag!.color].bg }} />
                        ))}
                    </em>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {dayCards.length > 0 ? (
            <button type="button" className="btn btn-primary" onClick={() => createFor(selected)}>
              + 新增今日打卡
            </button>
          ) : null}
        </aside>
      ) : null}
    </div>
  )
}
