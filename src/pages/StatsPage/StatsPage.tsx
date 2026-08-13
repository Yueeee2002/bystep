import { useMemo } from 'react'
import AppHeader from '@/components/layout/AppHeader'
import EmptyNote from '@/components/common/EmptyNote'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { cardVisitDate } from '@/utils/dates'
import styles from './StatsPage.module.css'

export default function StatsPage() {
  const cards = useCardStore((state) => state.cards)
  const labels = useConfigStore((state) => state.categoryLabels)
  const live = cards.filter((card) => !card.archived)
  const catering = live.filter((card) => card.categoryGroup === 'catering').length
  const other = live.filter((card) => card.categoryGroup === 'other').length
  const done = live.filter((card) => card.status === 'done').length
  const pending = live.filter((card) => card.status === 'pending').length
  const total = Math.max(1, catering + other)
  const months = useMemo(() => {
    const map = new Map<string, number>()
    for (const card of live) {
      const date = cardVisitDate(card) || new Date(card.createdAt).toISOString().slice(0, 7)
      const key = date.slice(0, 7)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6)
  }, [live])

  return (
    <div className="app-shell">
      <AppHeader title="数据统计" />
      {live.length === 0 ? (
        <EmptyNote title="还没有可统计的足迹" text="先去首页收下第一家店，数字就会慢慢长出来。" />
      ) : (
        <>
          <section className={styles.stickers}>
            <div className={`${styles.blob} ${styles.meal}`} style={{ flex: catering }}>
              {labels.catering}
              <em>{catering} 条</em>
              <span>{Math.round((catering / total) * 100)}%</span>
            </div>
            <div className={`${styles.blob} ${styles.leaf}`} style={{ flex: other }}>
              {labels.other}
              <em>{other} 条</em>
              <span>{Math.round((other / total) * 100)}%</span>
            </div>
          </section>
          <section className={styles.nums}>
            <div>
              <strong>{live.length}</strong>
              <span>全部小记</span>
            </div>
            <div>
              <strong>{done}</strong>
              <span>已打卡</span>
            </div>
            <div>
              <strong>{pending}</strong>
              <span>待出发</span>
            </div>
          </section>
          <section className={styles.months}>
            <h2>近月足迹</h2>
            {months.length === 0 ? (
              <p>还没有按月落下的记录。</p>
            ) : (
              <ul>
                {months.map(([month, count]) => (
                  <li key={month}>
                    <span>{month.replace('-', '年')}月</span>
                    <b>{count}</b>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
