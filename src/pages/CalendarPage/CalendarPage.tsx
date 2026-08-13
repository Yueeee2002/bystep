import { useEffect, useMemo, useState } from 'react'
import AppHeader from '@/components/layout/AppHeader'
import BackArrow from '@/components/common/BackArrow'
import EmptyNote from '@/components/common/EmptyNote'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { resolveTagColor } from '@/utils/palette'
import type { CategoryTab, IExploreCard } from '@/types'
import {
  buildMonthCells,
  buildWeekCells,
  countStreak,
  monthVisitStats,
  startOfWeekMonday,
  visitsForMonth,
  visitsForRange,
} from '@/utils/calendar'
import { downloadMonthPoster } from '@/utils/calendarPoster'
import { monthLabel, shiftMonth, toIsoDate } from '@/utils/dates'
import styles from './CalendarPage.module.css'

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function Marks({ catering, other, stacked }: { catering: number; other: number; stacked?: boolean }) {
  if (catering + other === 0) return null
  if (stacked) {
    return (
      <span className={styles.stack} title={`${catering + other} 条打卡`}>
        {(catering + other).toString()}
      </span>
    )
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
  const popDate = useUiStore((state) => state.popDate)
  const calendarView = useConfigStore((state) => state.calendarView)
  const labels = useConfigStore((state) => state.categoryLabels)
  const extras = useConfigStore((state) => state.customTagColors)
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [anchor, setAnchor] = useState(now)
  const [tab, setTab] = useState<CategoryTab>('all')
  const [mode, setMode] = useState<'month' | 'week'>(calendarView)
  const [selected, setSelected] = useState<string | null>(null)
  const [bubble, setBubble] = useState<string | null>(null)
  const [flip, setFlip] = useState<'left' | 'right' | ''>('')

  const monthVisits = useMemo(() => visitsForMonth(cards, year, month, tab), [cards, year, month, tab])
  const weekStart = useMemo(() => startOfWeekMonday(anchor), [anchor])
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    return end
  }, [weekStart])
  const weekVisits = useMemo(
    () => visitsForRange(cards, toIsoDate(weekStart), toIsoDate(weekEnd), tab),
    [cards, weekStart, weekEnd, tab],
  )
  const visits = mode === 'week' ? weekVisits : monthVisits
  const stats = useMemo(() => monthVisitStats(monthVisits), [monthVisits])
  const monthCells = useMemo(() => buildMonthCells(year, month, monthVisits), [year, month, monthVisits])
  const cells = useMemo(
    () => (mode === 'week' ? buildWeekCells(anchor, weekVisits) : monthCells),
    [mode, anchor, weekVisits, monthCells],
  )
  const streak = useMemo(() => countStreak(cards), [cards])

  useEffect(() => {
    if (streak !== 3 && streak !== 7) return
    const key = `liubu-streak-${streak}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    showToast(streak === 3 ? '连续 3 天，贴上一枚小贴纸' : '连续 7 天，手账勋章已盖上', 'success')
  }, [streak, showToast])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setSelected(null)
      setBubble(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const dayCards: IExploreCard[] = visits.find((item) => item.date === selected)?.cards ?? []

  const turn = (delta: number) => {
    setFlip(delta > 0 ? 'left' : 'right')
    setSelected(null)
    setBubble(null)
    if (mode === 'week') {
      const next = new Date(anchor)
      next.setDate(next.getDate() + delta * 7)
      setAnchor(next)
      setYear(next.getFullYear())
      setMonth(next.getMonth() + 1)
    } else {
      const next = shiftMonth(year, month, delta)
      setYear(next.year)
      setMonth(next.month)
      setAnchor(new Date(next.year, next.month - 1, 1))
    }
    window.setTimeout(() => setFlip(''), 300)
  }

  const goToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
    setAnchor(now)
    setSelected(toIsoDate(now))
    setBubble(null)
  }

  const pickDay = (cell: (typeof cells)[number]) => {
    if (!cell.inMonth && mode === 'month') return
    if (cell.total > 0) {
      setSelected(cell.date)
      setBubble(null)
      return
    }
    setSelected(null)
    setBubble(cell.date)
  }

  const createFor = (date: string) => {
    openUpload({ visitDate: date, status: 'done' })
    showToast('将为所选日期记下打卡', 'info')
  }

  const exportPoster = () => {
    const ok = downloadMonthPoster(year, month, monthCells, stats)
    showToast(ok ? '本月手账海报已保存' : '当前环境无法生成图片', ok ? 'success' : 'error')
  }

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'month' ? 'week' : 'month'
      if (next === 'week') {
        const sameMonth = year === now.getFullYear() && month === now.getMonth() + 1
        setAnchor(sameMonth ? now : new Date(year, month - 1, 1))
      }
      return next
    })
    setSelected(null)
    setBubble(null)
  }

  return (
    <div className="app-shell page-enter">
      <AppHeader title="打卡日历" badge={streak >= 3} />
      <div className={styles.top}>
        <button type="button" className={styles.nav} onClick={() => turn(-1)} aria-label={mode === 'week' ? '上一周' : '上月'}>
          ←
        </button>
        <h2>{monthLabel(year, month)}</h2>
        <button type="button" className={styles.nav} onClick={() => turn(1)} aria-label={mode === 'week' ? '下一周' : '下月'}>
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
              ['catering', labels.catering],
              ['other', labels.other],
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
        <button type="button" className={styles.mode} onClick={toggleMode}>
          {mode === 'month' ? '周视图' : '月视图'}
        </button>
        <button type="button" className={styles.poster} onClick={exportPoster}>
          生成本月手账海报
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
                selected === cell.date || bubble === cell.date ? styles.cellOn : ''
              } ${popDate === cell.date ? styles.pop : ''}`}
              disabled={!cell.inMonth && mode === 'month'}
              onClick={() => pickDay(cell)}
            >
              <strong>{cell.day}</strong>
              <Marks catering={cell.catering} other={cell.other} stacked={cell.total >= 3} />
            </button>
          ))}
        </div>
      </div>

      <p key={`${tab}-${stats.total}-${stats.catering}-${stats.other}`} className={styles.foot}>
        当月总计打卡：{stats.total} 次・{labels.catering} {stats.catering} 次・{labels.other} {stats.other} 次
      </p>

      {stats.total === 0 ? (
        <EmptyNote title="本月还很安静" text="本月还没有出门探店，快去记录第一笔美好吧✨" action={{ label: '新建打卡', onClick: () => createFor(toIsoDate()) }} />
      ) : null}

      {bubble ? (
        <div className={styles.bubble}>
          <p>今日暂无打卡记录</p>
          <button type="button" className="btn btn-primary" onClick={() => createFor(bubble)}>
            新建打卡
          </button>
          <button type="button" className="btn btn-text" onClick={() => setBubble(null)}>
            收起
          </button>
        </div>
      ) : null}

      {selected ? (
        <aside className={styles.drawer}>
          <div className={styles.drawerHead}>
            <BackArrow small onClick={() => setSelected(null)} />
            <h3>{selected}</h3>
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
                    <span>{card.categoryGroup === 'catering' ? labels.catering : labels.other}</span>
                    <em>
                      {card.tags
                        .map((id) => tags.find((tag) => tag.id === id))
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((tag) => (
                          <i key={tag!.id} style={{ background: resolveTagColor(tag!.color, extras).bg }} />
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
