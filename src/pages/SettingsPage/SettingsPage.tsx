import { useRef, useState } from 'react'
import AppHeader from '@/components/layout/AppHeader'
import Button from '@/components/common/Button'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { APP_VERSION } from '@/types'
import { buildBackupPayload, downloadJson, parseBackupPayload } from '@/utils/backup'
import { clearAllExploreData, StorageQuotaError } from '@/utils/storage'
import type { IAppConfig } from '@/types'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const cards = useCardStore((state) => state.cards)
  const replaceCards = useCardStore((state) => state.replaceAll)
  const tags = useTagStore((state) => state.tags)
  const replaceTags = useTagStore((state) => state.replaceAll)
  const nickname = useConfigStore((state) => state.nickname)
  const defaultFilter = useConfigStore((state) => state.defaultFilter)
  const theme = useConfigStore((state) => state.theme)
  const motto = useConfigStore((state) => state.motto)
  const setNickname = useConfigStore((state) => state.setNickname)
  const setMotto = useConfigStore((state) => state.setMotto)
  const setDefaultFilter = useConfigStore((state) => state.setDefaultFilter)
  const setTheme = useConfigStore((state) => state.setTheme)
  const replaceConfig = useConfigStore((state) => state.replaceAll)
  const viewMode = useConfigStore((state) => state.viewMode)
  const setStatusFilter = useCardStore((state) => state.setStatusFilter)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)
  const fileRef = useRef<HTMLInputElement>(null)
  const [draftName, setDraftName] = useState(nickname)
  const [draftMotto, setDraftMotto] = useState(motto)

  const pendingCount = cards.filter((card) => card.status === 'pending').length
  const doneCount = cards.filter((card) => card.status === 'done').length

  const exportBackup = () => {
    const payload = buildBackupPayload(cards, tags, {
      nickname,
      motto,
      defaultFilter,
      viewMode,
      theme,
    })
    downloadJson(`liubu-backup-${new Date().toISOString().slice(0, 10)}.json`, payload)
    showToast('备份已导出', 'success')
  }

  const importBackup = async (file: File) => {
    try {
      const text = await file.text()
      const payload = parseBackupPayload(text)
      replaceCards(payload.cards)
      replaceTags(payload.tags)
      replaceConfig(payload.config)
      setStatusFilter(payload.config.defaultFilter)
      setDraftName(payload.config.nickname)
      setDraftMotto(payload.config.motto ?? '')
      showToast('数据已恢复', 'success')
    } catch (error) {
      const message =
        error instanceof StorageQuotaError
          ? error.message
          : error instanceof Error
            ? error.message
            : '导入失败'
      showToast(message, 'error')
    }
  }

  const clearAll = () => {
    openConfirm({
      title: '清空全部数据？',
      message: '卡片、标签和个人设置都会被永久清除。建议先导出一份备份。',
      confirmText: '确认清空',
      danger: true,
      requireText: '清空',
      onConfirm: () => {
        clearAllExploreData()
        replaceCards([])
        replaceTags([])
        const next: IAppConfig = { nickname: '', motto: '', defaultFilter: 'all', viewMode: 'grid', theme: 'cream' }
        replaceConfig(next)
        setStatusFilter('all')
        setDraftName('')
        setDraftMotto('')
        showToast('已清空全部数据', 'info')
      },
    })
  }

  return (
    <div className={`app-shell page-enter ${styles.page}`}>
      <AppHeader subtitle="把留步，安成自己喜欢的样子" />

      <section className={styles.card}>
        <h2>个性化</h2>
        <label className="field">
          <span>昵称</span>
          <input
            value={draftName}
            placeholder="例如：陈小雨"
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={() => setNickname(draftName.trim())}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setNickname(draftName.trim())
                event.currentTarget.blur()
              }
            }}
          />
        </label>
        <label className="field">
          <span>手账寄语</span>
          <input
            value={draftMotto}
            placeholder="例如：慢慢走，都会遇见。"
            onChange={(event) => setDraftMotto(event.target.value)}
            onBlur={() => setMotto(draftMotto.trim())}
          />
        </label>
        <div className="field">
          <span>默认筛选</span>
          <div className={styles.row}>
            <button
              type="button"
              className={`chip ${defaultFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setDefaultFilter('all')
                setStatusFilter('all')
              }}
            >
              进入时看全部
            </button>
            <button
              type="button"
              className={`chip ${defaultFilter === 'pending' ? 'active' : ''}`}
              onClick={() => {
                setDefaultFilter('pending')
                setStatusFilter('pending')
              }}
            >
              进入时看未打卡
            </button>
          </div>
        </div>
        <div className="field">
          <span>纸页明暗</span>
          <div className={styles.row}>
            <button
              type="button"
              className={`chip ${theme === 'cream' ? 'active' : ''}`}
              onClick={() => setTheme('cream')}
            >
              浅色内页
            </button>
            <button
              type="button"
              className={`chip ${theme === 'night' ? 'active' : ''}`}
              onClick={() => setTheme('night')}
            >
              夜间内页
            </button>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2>数据管理</h2>
        <div className={styles.stats}>
          <div>
            <strong>{cards.length}</strong>
            <span>点位</span>
          </div>
          <div>
            <strong>{pendingCount}</strong>
            <span>未打卡</span>
          </div>
          <div>
            <strong>{doneCount}</strong>
            <span>已打卡</span>
          </div>
          <div>
            <strong>{tags.length}</strong>
            <span>标签</span>
          </div>
        </div>
        <div className={styles.row}>
          <Button onClick={exportBackup}>导出全部记录与配图</Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            导入恢复
          </Button>
          <Button variant="danger-ghost" onClick={clearAll}>
            清空数据
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void importBackup(file)
              event.target.value = ''
            }}
          />
        </div>
      </section>

      <section className={styles.card}>
        <h2>关于留步</h2>
        <p className={styles.about}>
          版本 {APP_VERSION} · 照片以独立副本收纳，清理相册原图也不影响这里。
        </p>
        <p className={styles.soon}>
          下一次迭代预告：地图视图、路线规划和云端轻同步。地址已经按结构化文本保存，随时可以走向远方。
        </p>
      </section>
    </div>
  )
}
