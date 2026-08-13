import { useRef } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { compressImageToBase64 } from '@/utils/imageHelper'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const cards = useCardStore((state) => state.cards)
  const tags = useTagStore((state) => state.tags)
  const nickname = useConfigStore((state) => state.nickname)
  const motto = useConfigStore((state) => state.motto)
  const avatar = useConfigStore((state) => state.avatar)
  const setAvatar = useConfigStore((state) => state.setAvatar)
  const showToast = useUiStore((state) => state.showToast)
  const fileRef = useRef<HTMLInputElement>(null)
  const live = cards.filter((card) => !card.archived)
  const done = live.filter((card) => card.status === 'done').length
  const pending = live.filter((card) => card.status === 'pending').length

  return (
    <div className="app-shell">
      <AppHeader title="个人主页" />
      <section className={styles.hero}>
        <button type="button" className={styles.avatar} onClick={() => fileRef.current?.click()} aria-label="更换头像">
          {avatar ? <img src={avatar} alt="" /> : <span>{(nickname || '留').slice(0, 1)}</span>}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            try {
              setAvatar(await compressImageToBase64(file))
              showToast('头像已更新', 'success')
            } catch (error) {
              showToast(error instanceof Error ? error.message : '头像更新失败', 'error')
            }
          }}
        />
        <h2>{nickname.trim() || '尚未署名的旅人'}</h2>
        <p>{motto.trim() || '把种草的店，轻轻收好'}</p>
      </section>
      <section className={styles.stats}>
        <div>
          <strong>{live.length}</strong>
          <span>点位</span>
        </div>
        <div>
          <strong>{done}</strong>
          <span>已打卡</span>
        </div>
        <div>
          <strong>{pending}</strong>
          <span>待出发</span>
        </div>
        <div>
          <strong>{tags.length}</strong>
          <span>标签</span>
        </div>
      </section>
      <Link to="/settings" className="btn btn-ghost">
        去设置里完善账号
      </Link>
    </div>
  )
}
