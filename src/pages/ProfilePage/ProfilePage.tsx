import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { compressImageToBase64 } from '@/utils/imageHelper'
import { countStreak, monthVisitStats, visitsForMonth } from '@/utils/calendar'
import { StorageQuotaError } from '@/utils/storage'
import useCountUp from '@/hooks/useCountUp'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const cards = useCardStore((state) => state.cards)
  const tags = useTagStore((state) => state.tags)
  const nickname = useConfigStore((state) => state.nickname)
  const motto = useConfigStore((state) => state.motto)
  const avatar = useConfigStore((state) => state.avatar)
  const labels = useConfigStore((state) => state.categoryLabels)
  const setAvatar = useConfigStore((state) => state.setAvatar)
  const showToast = useUiStore((state) => state.showToast)
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const live = cards.filter((card) => !card.archived)
  const done = live.filter((card) => card.status === 'done').length
  const pending = live.filter((card) => card.status === 'pending').length
  const catering = live.filter((card) => card.categoryGroup === 'catering').length
  const other = live.filter((card) => card.categoryGroup === 'other').length
  const empty = live.length === 0

  const monthStats = useMemo(() => {
    const now = new Date()
    return monthVisitStats(visitsForMonth(cards, now.getFullYear(), now.getMonth() + 1))
  }, [cards])
  const streak = useMemo(() => countStreak(cards), [cards])

  const totalShown = useCountUp(live.length)
  const doneShown = useCountUp(done)
  const pendingShown = useCountUp(pending)
  const tagsShown = useCountUp(tags.length)
  const monthShown = useCountUp(monthStats.total)
  const streakShown = useCountUp(streak)

  const pickAvatar = async (file: File) => {
    try {
      setAvatar(await compressImageToBase64(file))
      setAvatarOpen(false)
      showToast('头像已更新', 'success')
    } catch (error) {
      showToast(error instanceof StorageQuotaError || error instanceof Error ? error.message : '头像更新失败', 'error')
    }
  }

  return (
    <div className={`app-shell ${styles.page}`}>
      <AppHeader title="个人主页" showTheme={false} />

      <section className={styles.hero}>
        <button type="button" className={styles.avatar} onClick={() => setAvatarOpen(true)} aria-label="更换头像">
          {avatar ? <img src={avatar} alt="" /> : <span>{(nickname || '留').slice(0, 1)}</span>}
        </button>
        <h2>{nickname.trim() || '尚未署名的旅人'}</h2>
        <p>{motto.trim() || '走遍每一个角落'}</p>
      </section>

      <section className={styles.stats} aria-label="核心数据">
        <article>
          <strong>{totalShown}</strong>
          <b>点位总数</b>
          <span>全部收藏店铺</span>
        </article>
        <article>
          <strong>{doneShown}</strong>
          <b>已打卡</b>
          <span>完成探店记录</span>
        </article>
        <article>
          <strong>{pendingShown}</strong>
          <b>待出发</b>
          <span>计划打卡清单</span>
        </article>
        <article>
          <strong>{tagsShown}</strong>
          <b>标签</b>
          <span>自建分类标签</span>
        </article>
      </section>

      {empty ? (
        <section className={styles.empty}>
          <svg width="72" height="56" viewBox="0 0 72 56" fill="none" aria-hidden="true">
            <path d="M10 34h52v16H10z" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 34 36 16 64 34" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M22 50V40h12v10" stroke="currentColor" strokeWidth="1.2" />
            <path d="M42 28v-6h8v10" stroke="currentColor" strokeWidth="1.2" />
            <path d="M18 22h8M20 18h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          <p>还没有探店记录哦</p>
          <span>前往首页记下第一家喜欢的小店吧</span>
        </section>
      ) : (
        <section className={styles.panel}>
          <h3>打卡概览</h3>
          <div className={styles.row}>
            <span>本月打卡</span>
            <em>{monthShown} 次</em>
          </div>
          <div className={styles.row}>
            <span>分类分布</span>
            <em>
              {labels.catering} {catering} 家 / {labels.other} {other} 家
            </em>
          </div>
          <div className={styles.row}>
            <span>连续打卡</span>
            <em className={styles.medal}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="8" r="3.15" stroke="currentColor" strokeWidth="1.1" />
                <path d="M5.1 5.2 7 3.4l1.9 1.8" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
              </svg>
              {streakShown} 天
            </em>
          </div>
        </section>
      )}

      <section className={styles.actions}>
        <button type="button" className={styles.shortcut} onClick={() => navigate('/settings?open=account')}>
          编辑个人资料
        </button>
        <button type="button" className={styles.shortcut} onClick={() => navigate('/stats')}>
          查看完整数据
        </button>
      </section>

      <Modal open={avatarOpen} title="更换头像" onClose={() => setAvatarOpen(false)}>
        <div className={styles.avatarSheet}>
          <div className={styles.preview}>
            {avatar ? <img src={avatar} alt="" /> : <span>{(nickname || '留').slice(0, 1)}</span>}
          </div>
          <Button onClick={() => fileRef.current?.click()}>选择图片</Button>
          <p>支持 JPEG / PNG，会轻轻压成手账尺寸。</p>
        </div>
      </Modal>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void pickAvatar(file)
        }}
      />
    </div>
  )
}
