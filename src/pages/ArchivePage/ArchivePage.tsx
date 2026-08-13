import { useMemo, useState } from 'react'
import AppHeader from '@/components/layout/AppHeader'
import EmptyNote from '@/components/common/EmptyNote'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useUiStore } from '@/store/uiStore'
import { cardVisitDate } from '@/utils/dates'
import styles from './ArchivePage.module.css'

export default function ArchivePage() {
  const cards = useCardStore((state) => state.cards)
  const archiveCards = useCardStore((state) => state.archiveCards)
  const labels = useConfigStore((state) => state.categoryLabels)
  const folders = useConfigStore((state) => state.archiveFolders)
  const openEdit = useUiStore((state) => state.openEdit)
  const showToast = useUiStore((state) => state.showToast)
  const [hover, setHover] = useState<'catering' | 'other' | null>(null)
  const archived = cards.filter((card) => card.archived)
  const live = cards.filter((card) => !card.archived)
  const catering = live.filter((card) => card.categoryGroup === 'catering').length
  const other = live.filter((card) => card.categoryGroup === 'other').length
  const total = Math.max(1, catering + other)

  const months = useMemo(() => {
    const map = new Map<string, typeof live>()
    for (const card of live) {
      const date = cardVisitDate(card) || new Date(card.createdAt).toISOString().slice(0, 7)
      const key = date.slice(0, 7)
      const list = map.get(key) ?? []
      list.push(card)
      map.set(key, list)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [live])

  return (
    <div className="app-shell">
      <AppHeader title="归档合集" />
      <section className={styles.stickers}>
        <button
          type="button"
          className={`${styles.blob} ${styles.meal}`}
          style={{ flex: catering }}
          onMouseEnter={() => setHover('catering')}
          onMouseLeave={() => setHover(null)}
        >
          {labels.catering}
          {hover === 'catering' ? <em>{catering} 条</em> : <span>{Math.round((catering / total) * 100)}%</span>}
        </button>
        <button
          type="button"
          className={`${styles.blob} ${styles.leaf}`}
          style={{ flex: other }}
          onMouseEnter={() => setHover('other')}
          onMouseLeave={() => setHover(null)}
        >
          {labels.other}
          {hover === 'other' ? <em>{other} 条</em> : <span>{Math.round((other / total) * 100)}%</span>}
        </button>
      </section>

      {months.length === 0 ? (
        <EmptyNote title="册页还空着" text="走过的店会在这里按月叠成手账。" />
      ) : (
        months.map(([month, list]) => (
          <section key={month} className={styles.month}>
            <h2>{month.replace('-', '年')}月</h2>
            <ul>
              {list.map((card) => (
                <li key={card.id}>
                  <button type="button" onClick={() => openEdit(card.id)}>
                    {card.title.trim() || '未命名地点'}
                    <span>{labels[card.categoryGroup]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {folders.map((folder) => (
        <section key={folder.id} className={styles.pocket}>
          <h2>{folder.name}</h2>
          {archived.length === 0 ? (
            <p>多选首页卡片后，可以收进这里，需要时再展开。</p>
          ) : (
            <ul>
              {archived.map((card) => (
                <li key={card.id}>
                  <button type="button" onClick={() => openEdit(card.id)}>
                    {card.title.trim() || '未命名地点'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-text"
                    onClick={() => {
                      archiveCards([card.id], false)
                      showToast('已从收纳袋取出', 'success')
                    }}
                  >
                    取出
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
