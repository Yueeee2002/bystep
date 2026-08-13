import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { APP_VERSION, DEFAULT_HOME_SLOGAN, SLOGAN_EXAMPLES, TAG_COLORS, TAG_COLOR_ORDER } from '@/types'
import { DEFAULT_CONFIG, buildBackupPayload, downloadJson, parseBackupPayload } from '@/utils/backup'
import { cardsToCsv, downloadText, parseCardsCsv } from '@/utils/csv'
import { downloadMonthPoster } from '@/utils/calendarPoster'
import { buildMonthCells, monthVisitStats, visitsForMonth } from '@/utils/calendar'
import { clearAllExploreData, StorageQuotaError } from '@/utils/storage'
import { compressImageToBase64 } from '@/utils/imageHelper'
import { createId } from '@/utils/filterCards'
import type { ICustomTagColor } from '@/types'
import styles from './SettingsPage.module.css'

type Sheet =
  | 'account'
  | 'password'
  | 'phone'
  | 'slogan'
  | 'color'
  | 'help'
  | 'privacy'
  | 'feedback'
  | 'folders'
  | 'labels'
  | null

export default function SettingsPage() {
  const navigate = useNavigate()
  const cards = useCardStore((state) => state.cards)
  const replaceCards = useCardStore((state) => state.replaceAll)
  const tags = useTagStore((state) => state.tags)
  const replaceTags = useTagStore((state) => state.replaceAll)
  const config = useConfigStore()
  const setStatusFilter = useCardStore((state) => state.setStatusFilter)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)
  const jsonRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [draftName, setDraftName] = useState(config.nickname)
  const [draftMotto, setDraftMotto] = useState(config.motto)
  const [draftSlogan, setDraftSlogan] = useState(config.homeSlogan)
  const [shakeSlogan, setShakeSlogan] = useState(false)
  const [restoreAsk, setRestoreAsk] = useState(false)
  const [phone, setPhone] = useState(config.phone)
  const [passA, setPassA] = useState('')
  const [passB, setPassB] = useState('')
  const [feedback, setFeedback] = useState('')
  const [labelA, setLabelA] = useState(config.categoryLabels.catering)
  const [labelB, setLabelB] = useState(config.categoryLabels.other)
  const [folderName, setFolderName] = useState('')
  const [colorDraft, setColorDraft] = useState({ label: '', bg: '#e8d5b7', fg: '#5c4630' })

  const closeSheet = () => setSheet(null)

  const exportJson = () => {
    downloadJson(
      `liubu-backup-${new Date().toISOString().slice(0, 10)}.json`,
      buildBackupPayload(cards, tags, useConfigStore.getState()),
    )
    showToast('备份已导出', 'success')
  }

  const exportCsv = () => {
    downloadText(`liubu-records-${new Date().toISOString().slice(0, 10)}.csv`, `\uFEFF${cardsToCsv(cards, tags)}`)
    showToast('表格已导出', 'success')
  }

  const exportPoster = () => {
    const now = new Date()
    const visits = visitsForMonth(cards, now.getFullYear(), now.getMonth() + 1)
    const ok = downloadMonthPoster(
      now.getFullYear(),
      now.getMonth() + 1,
      buildMonthCells(now.getFullYear(), now.getMonth() + 1, visits),
      monthVisitStats(visits),
    )
    showToast(ok ? '本月手账海报已保存' : '当前环境无法生成图片', ok ? 'success' : 'error')
  }

  const importJson = async (file: File) => {
    try {
      const payload = parseBackupPayload(await file.text())
      replaceCards(payload.cards)
      replaceTags(payload.tags)
      config.replaceAll(payload.config)
      setStatusFilter(payload.config.defaultFilter)
      showToast('数据已恢复', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : '导入失败', 'error')
    }
  }

  const importCsv = async (file: File) => {
    try {
      const imported = parseCardsCsv(await file.text(), tags)
      replaceCards([...cards, ...imported])
      showToast(`已导入 ${imported.length} 条记录`, 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : '表格导入失败', 'error')
    }
  }

  const clearAll = () => {
    openConfirm({
      title: '清空测试数据？',
      message: '卡片、标签和个人设置都会被永久清除。建议先导出一份备份。',
      confirmText: '确认清空',
      danger: true,
      requireText: '清空',
      onConfirm: () => {
        clearAllExploreData()
        replaceCards([])
        replaceTags([])
        config.replaceAll(DEFAULT_CONFIG)
        setStatusFilter('all')
        showToast('已清空全部数据', 'info')
      },
    })
  }

  const cancelAccount = () => {
    openConfirm({
      title: '注销账号？',
      message: '将清除本机全部手账数据，此操作不可恢复。',
      confirmText: '确认注销',
      danger: true,
      requireText: '注销',
      onConfirm: () => {
        clearAllExploreData()
        replaceCards([])
        replaceTags([])
        config.replaceAll(DEFAULT_CONFIG)
        setStatusFilter('all')
        showToast('账号已从本机注销', 'info')
        navigate('/')
      },
    })
  }

  const saveSlogan = () => {
    const next = draftSlogan.trim()
    if (!next) {
      setShakeSlogan(true)
      window.setTimeout(() => setShakeSlogan(false), 360)
      showToast('请输入个性标语内容', 'error')
      return
    }
    config.setHomeSlogan(next.slice(0, 20))
    sessionStorage.setItem('liubu-slogan-flash', '1')
    closeSheet()
    navigate('/')
  }

  const addCustomColor = () => {
    const label = colorDraft.label.trim()
    if (!label) {
      showToast('请填写色系名称', 'error')
      return
    }
    const item: ICustomTagColor = {
      id: `custom_${createId()}`,
      label,
      bg: colorDraft.bg,
      fg: colorDraft.fg,
    }
    config.setCustomTagColors([...config.customTagColors, item])
    setColorDraft({ label: '', bg: '#e8d5b7', fg: '#5c4630' })
    showToast('已加入自定义配色', 'success')
  }

  return (
    <div className={`app-shell ${styles.page}`}>
      <AppHeader title="设置" />

      <section className={styles.card}>
        <h2>账号设置</h2>
        <button type="button" className={styles.item} onClick={() => setSheet('account')}>
          <span>修改头像与昵称</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => setSheet('password')}>
          <span>修改登录密码</span>
          <em>{config.passwordSet ? '已设置' : '未设置'}</em>
        </button>
        <button type="button" className={styles.item} onClick={() => setSheet('phone')}>
          <span>绑定手机号</span>
          <em>{config.phone || '未绑定'}</em>
        </button>
        <button type="button" className={`${styles.item} ${styles.danger}`} onClick={cancelAccount}>
          <span>账号注销</span>
          <em>›</em>
        </button>
      </section>

      <section className={styles.card}>
        <h2>界面外观偏好</h2>
        <div className={styles.item}>
          <span>主题切换</span>
          <div className={styles.pills}>
            <button type="button" className={`chip ${config.theme === 'cream' ? 'active' : ''}`} onClick={() => config.setTheme('cream')}>
              奶油浅色
            </button>
            <button type="button" className={`chip ${config.theme === 'night' ? 'active' : ''}`} onClick={() => config.setTheme('night')}>
              深棕手账
            </button>
          </div>
        </div>
        <div className={styles.item}>
          <span>日历默认视图</span>
          <select
            className={styles.select}
            value={config.calendarView}
            onChange={(event) => config.setCalendarView(event.target.value === 'week' ? 'week' : 'month')}
          >
            <option value="month">月视图</option>
            <option value="week">周视图</option>
          </select>
        </div>
        <div className={styles.item}>
          <span>首页卡片布局</span>
          <select
            className={styles.select}
            value={config.viewMode}
            onChange={(event) => {
              const mode = event.target.value === 'list' ? 'list' : 'grid'
              config.setViewMode(mode)
              useCardStore.getState().setViewMode(mode)
            }}
          >
            <option value="grid">大图卡片</option>
            <option value="list">紧凑列表</option>
          </select>
        </div>
        <div className={styles.item}>
          <span>全局交互动效</span>
          <div className={styles.pills}>
            <button type="button" className={`chip ${config.motion ? 'active' : ''}`} onClick={() => config.setMotion(true)}>
              开启
            </button>
            <button type="button" className={`chip ${!config.motion ? 'active' : ''}`} onClick={() => config.setMotion(false)}>
              关闭
            </button>
          </div>
        </div>
        <button type="button" className={styles.item} onClick={() => setSheet('color')}>
          <span>自定义标签配色</span>
          <em>{config.customTagColors.length} 种</em>
        </button>
        <button type="button" className={styles.item} onClick={() => { setDraftSlogan(config.homeSlogan); setSheet('slogan') }}>
          <span>首页顶部个性标语</span>
          <em>{config.homeSlogan}</em>
        </button>
      </section>

      <section className={styles.card}>
        <h2>数据管理</h2>
        <button type="button" className={styles.item} onClick={exportCsv}>
          <span>导出全部探店数据（Excel）</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={exportPoster}>
          <span>当月打卡日历图片导出</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={exportJson}>
          <span>导出全部记录与配图</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => csvRef.current?.click()}>
          <span>导入批量记录</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => jsonRef.current?.click()}>
          <span>导入 JSON 备份</span>
          <em>›</em>
        </button>
        <div className={styles.item}>
          <span>云端自动备份</span>
          <div className={styles.pills}>
            <button type="button" className={`chip ${config.cloudBackup ? 'active' : ''}`} onClick={() => config.setCloudBackup(true)}>
              开启
            </button>
            <button type="button" className={`chip ${!config.cloudBackup ? 'active' : ''}`} onClick={() => config.setCloudBackup(false)}>
              关闭
            </button>
          </div>
        </div>
        <button
          type="button"
          className={styles.item}
          onClick={() => {
            exportJson()
            showToast(config.cloudBackup ? '已完成本机备份，云端通道稍后接通' : '已手动备份到本机', 'success')
          }}
        >
          <span>手动立即备份</span>
          <em>›</em>
        </button>
        <button type="button" className={`${styles.item} ${styles.danger}`} onClick={clearAll}>
          <span>清空测试数据</span>
          <em>›</em>
        </button>
        <input ref={jsonRef} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void importJson(file)
          event.target.value = ''
        }} />
        <input ref={csvRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void importCsv(file)
          event.target.value = ''
        }} />
      </section>

      <section className={styles.card}>
        <h2>分类体系管理</h2>
        <button type="button" className={styles.item} onClick={() => { setLabelA(config.categoryLabels.catering); setLabelB(config.categoryLabels.other); setSheet('labels') }}>
          <span>修改顶级大类显示名称</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => navigate('/tags')}>
          <span>跳转标签管理页</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => setSheet('folders')}>
          <span>归档合集文件夹管理</span>
          <em>{config.archiveFolders.length} 个</em>
        </button>
      </section>

      <section className={styles.card}>
        <h2>其他</h2>
        <div className={styles.item}>
          <span>当前版本</span>
          <em>{APP_VERSION}</em>
        </div>
        <button type="button" className={styles.item} onClick={() => showToast('已是最新版本', 'success')}>
          <span>检查更新</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => setSheet('help')}>
          <span>使用帮助</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => setSheet('feedback')}>
          <span>意见反馈</span>
          <em>›</em>
        </button>
        <button type="button" className={styles.item} onClick={() => setSheet('privacy')}>
          <span>隐私政策 / 用户协议</span>
          <em>›</em>
        </button>
      </section>

      <Modal open={sheet === 'account'} title="修改头像与昵称" onClose={closeSheet}>
        <div className={styles.sheet}>
          <button type="button" className={styles.avatar} onClick={() => avatarRef.current?.click()}>
            {config.avatar ? <img src={config.avatar} alt="" /> : '更换头像'}
          </button>
          <input ref={avatarRef} type="file" accept="image/jpeg,image/png" className="sr-only" onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            try {
              config.setAvatar(await compressImageToBase64(file))
              showToast('头像已更新', 'success')
            } catch (error) {
              showToast(error instanceof StorageQuotaError ? error.message : '头像更新失败', 'error')
            }
          }} />
          <label className="field">
            <span>昵称</span>
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="例如：陈小雨" />
          </label>
          <label className="field">
            <span>个性签名</span>
            <input value={draftMotto} onChange={(event) => setDraftMotto(event.target.value)} placeholder="例如：慢慢走，都会遇见。" />
          </label>
          <Button onClick={() => {
            config.setNickname(draftName.trim())
            config.setMotto(draftMotto.trim())
            closeSheet()
            showToast('资料已保存', 'success')
          }}>保存</Button>
        </div>
      </Modal>

      <Modal open={sheet === 'password'} title="修改登录密码" onClose={closeSheet}>
        <div className={styles.sheet}>
          <label className="field">
            <span>新密码</span>
            <input type="password" value={passA} onChange={(event) => setPassA(event.target.value)} />
          </label>
          <label className="field">
            <span>再次确认</span>
            <input type="password" value={passB} onChange={(event) => setPassB(event.target.value)} />
          </label>
          <Button onClick={() => {
            if (passA.length < 6 || passA !== passB) {
              showToast('请输入至少 6 位且两次一致的密码', 'error')
              return
            }
            config.setPasswordSet(true)
            setPassA('')
            setPassB('')
            closeSheet()
            showToast('本机密码锁已更新', 'success')
          }}>保存</Button>
        </div>
      </Modal>

      <Modal open={sheet === 'phone'} title="绑定手机号" onClose={closeSheet}>
        <div className={styles.sheet}>
          <label className="field">
            <span>手机号</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="11 位手机号" />
          </label>
          <Button onClick={() => {
            const next = phone.trim()
            if (next && !/^1\d{10}$/.test(next)) {
              showToast('请输入 11 位手机号', 'error')
              return
            }
            config.setPhone(next)
            closeSheet()
            showToast(next ? '手机号已绑定' : '已解除绑定', 'success')
          }}>保存</Button>
        </div>
      </Modal>

      <Modal open={sheet === 'slogan'} title="修改首页副标题标语" onClose={closeSheet}>
        <div className={styles.sheet}>
          <label className="field">
            <span>个性标语</span>
            <input
              value={draftSlogan}
              maxLength={20}
              onChange={(event) => setDraftSlogan(event.target.value.slice(0, 20))}
              placeholder={DEFAULT_HOME_SLOGAN}
            />
          </label>
          <p className={styles.hint}>限1-20个字符，仅展示在首页顶部品牌下方</p>
          <p className={styles.hint}>可以试试：{SLOGAN_EXAMPLES.join(' / ')}</p>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setRestoreAsk(true)}>恢复默认</Button>
            <Button className={shakeSlogan ? 'shake' : ''} onClick={saveSlogan}>保存</Button>
          </div>
          {restoreAsk ? (
            <span className={styles.bubble}>
              确定还原为官方默认标语吗？
              <button type="button" onClick={() => {
                config.setHomeSlogan(DEFAULT_HOME_SLOGAN)
                setDraftSlogan(DEFAULT_HOME_SLOGAN)
                setRestoreAsk(false)
                showToast('已恢复默认标语', 'success')
              }}>确认</button>
              <button type="button" onClick={() => setRestoreAsk(false)}>取消</button>
            </span>
          ) : null}
        </div>
      </Modal>

      <Modal open={sheet === 'color'} title="自定义标签配色" onClose={closeSheet}>
        <div className={styles.sheet}>
          <p className={styles.hint}>预设：{TAG_COLOR_ORDER.map((item) => TAG_COLORS[item].label).join(' / ')}</p>
          <label className="field">
            <span>色系名称</span>
            <input value={colorDraft.label} onChange={(event) => setColorDraft((prev) => ({ ...prev, label: event.target.value }))} />
          </label>
          <div className={styles.row}>
            <label className="field">
              <span>底色</span>
              <input type="color" value={colorDraft.bg} onChange={(event) => setColorDraft((prev) => ({ ...prev, bg: event.target.value }))} />
            </label>
            <label className="field">
              <span>文字</span>
              <input type="color" value={colorDraft.fg} onChange={(event) => setColorDraft((prev) => ({ ...prev, fg: event.target.value }))} />
            </label>
          </div>
          <Button onClick={addCustomColor}>新增色系</Button>
          <ul className={styles.list}>
            {config.customTagColors.map((item) => (
              <li key={item.id}>
                <i style={{ background: item.bg }} />
                {item.label}
                <button type="button" className="btn btn-text" onClick={() => config.setCustomTagColors(config.customTagColors.filter((color) => color.id !== item.id))}>
                  删除
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      <Modal open={sheet === 'labels'} title="修改顶级大类名称" onClose={closeSheet}>
        <div className={styles.sheet}>
          <label className="field">
            <span>原食肆小店</span>
            <input value={labelA} onChange={(event) => setLabelA(event.target.value)} />
          </label>
          <label className="field">
            <span>原野趣小仓</span>
            <input value={labelB} onChange={(event) => setLabelB(event.target.value)} />
          </label>
          <Button onClick={() => {
            if (!labelA.trim() || !labelB.trim()) {
              showToast('大类名称不能为空', 'error')
              return
            }
            config.setCategoryLabels({ catering: labelA.trim(), other: labelB.trim() })
            closeSheet()
            showToast('大类名称已更新', 'success')
          }}>保存</Button>
        </div>
      </Modal>

      <Modal open={sheet === 'folders'} title="归档合集文件夹" onClose={closeSheet}>
        <div className={styles.sheet}>
          <label className="field">
            <span>新文件夹名称</span>
            <input value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="例如：夏季短途" />
          </label>
          <Button onClick={() => {
            const name = folderName.trim()
            if (!name) return
            config.setArchiveFolders([...config.archiveFolders, { id: createId(), name }])
            setFolderName('')
            showToast('已新增归档夹', 'success')
          }}>新增</Button>
          <ul className={styles.list}>
            {config.archiveFolders.map((folder) => (
              <li key={folder.id}>
                {folder.name}
                <button
                  type="button"
                  className="btn btn-text"
                  onClick={() => {
                    if (config.archiveFolders.length <= 1) {
                      showToast('至少保留一个归档夹', 'info')
                      return
                    }
                    config.setArchiveFolders(config.archiveFolders.filter((item) => item.id !== folder.id))
                  }}
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      <Modal open={sheet === 'help'} title="使用帮助" onClose={closeSheet}>
        <div className={styles.article}>
          <p>1. 首页收下想去的店，长按可多选收纳。</p>
          <p>2. 打卡日历点日期，就能补记当天足迹。</p>
          <p>3. 标签要先选大类，食肆与野趣不会混在一起。</p>
          <p>4. 重要数据请定期导出备份，清理浏览器缓存会丢失本机记录。</p>
        </div>
      </Modal>

      <Modal open={sheet === 'feedback'} title="意见反馈" onClose={closeSheet}>
        <div className={styles.sheet}>
          <label className="field">
            <span>想说的话</span>
            <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="提交 bug 或新功能想法" />
          </label>
          <Button onClick={() => {
            if (!feedback.trim()) {
              showToast('请先写下反馈', 'error')
              return
            }
            setFeedback('')
            closeSheet()
            showToast('已记下，感谢反馈', 'success')
          }}>提交</Button>
        </div>
      </Modal>

      <Modal open={sheet === 'privacy'} title="隐私政策与用户协议" onClose={closeSheet}>
        <div className={styles.article}>
          <p>留步默认把探店记录保存在你的浏览器本地，不会擅自上传到云端。</p>
          <p>开启云端备份后，才会在后续版本把加密副本同步到服务器。</p>
          <p>你随时可以导出、清空或注销本机数据。</p>
        </div>
      </Modal>
    </div>
  )
}
