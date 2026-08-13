import { useEffect, useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import GalleryEditor from '@/components/common/GalleryEditor'
import Stars from '@/components/common/Stars'
import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { TAG_COLORS } from '@/types'
import type { CardStatus } from '@/types'
import styles from './EditModal.module.css'

interface Draft {
  title: string
  address: string
  notes: string
  review: string
  status: CardStatus
  tags: string[]
  images: string[]
  coverIndex: number
  rating: number
  plannedAt: string
}

const emptyDraft: Draft = {
  title: '',
  address: '',
  notes: '',
  review: '',
  status: 'pending',
  tags: [],
  images: [],
  coverIndex: 0,
  rating: 0,
  plannedAt: '',
}

export default function EditModal() {
  const open = useUiStore((state) => state.editOpen)
  const editingCardId = useUiStore((state) => state.editingCardId)
  const closeEdit = useUiStore((state) => state.closeEdit)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const openTags = useUiStore((state) => state.openTags)
  const showToast = useUiStore((state) => state.showToast)
  const triggerCelebrate = useUiStore((state) => state.triggerCelebrate)
  const cards = useCardStore((state) => state.cards)
  const updateCard = useCardStore((state) => state.updateCard)
  const deleteCard = useCardStore((state) => state.deleteCard)
  const tags = useTagStore((state) => state.tags)
  const card = cards.find((item) => item.id === editingCardId)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    if (!card) return
    setDraft({
      title: card.title,
      address: card.address,
      notes: card.notes,
      review: card.review,
      status: card.status,
      tags: card.tags,
      images: card.images,
      coverIndex: card.coverIndex,
      rating: card.rating,
      plannedAt: card.plannedAt,
    })
    setImageIndex(card.coverIndex)
  }, [card])

  if (!card) {
    return (
      <Modal open={open} title="编辑点位" onClose={closeEdit}>
        <p>卡片不存在或已删除。</p>
      </Modal>
    )
  }

  const save = () => {
    const becameDone = card.status !== 'done' && draft.status === 'done'
    updateCard(card.id, draft)
    showToast('已保存', 'success')
    closeEdit()
    if (becameDone) triggerCelebrate()
  }

  const requestDelete = () => {
    openConfirm({
      title: '删除这张卡片？',
      message: '删除后无法恢复。若只是暂时不去，也可以继续留着，等有空再走。',
      confirmText: '删除',
      danger: true,
      onConfirm: () => {
        deleteCard(card.id)
        closeEdit()
        showToast('卡片已删除', 'info')
      },
    })
  }

  return (
    <Modal
      open={open}
      title="编辑点位"
      onClose={() => {
        const ui = useUiStore.getState()
        if (ui.confirmOpen || ui.lightboxOpen || ui.tagsOpen) return
        closeEdit()
      }}
      wide
    >
      <div className={styles.layout}>
        <GalleryEditor
          images={draft.images}
          coverIndex={draft.coverIndex}
          activeIndex={imageIndex}
          title={draft.title}
          onChange={(next) => {
            setDraft((prev) => ({ ...prev, images: next.images, coverIndex: next.coverIndex }))
            setImageIndex(next.activeIndex)
          }}
        />

        <div className={styles.form}>
          <label className="field">
            <span>店名</span>
            <input
              value={draft.title}
              placeholder="这家店叫什么"
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>地址</span>
            <input
              value={draft.address}
              placeholder="记下详细地址，以后好找"
              onChange={(event) => setDraft((prev) => ({ ...prev, address: event.target.value }))}
            />
          </label>
          <div className="field">
            <span>心愿星级</span>
            <Stars value={draft.rating} onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))} />
          </div>
          <label className="field">
            <span>计划探店日期</span>
            <input
              type="date"
              value={draft.plannedAt}
              onChange={(event) => setDraft((prev) => ({ ...prev, plannedAt: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>种草备注</span>
            <textarea
              value={draft.notes}
              placeholder="未打卡时写下种草理由、店铺亮点、必点…"
              onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </label>

          <div className="field">
            <span>标签</span>
            <div className={styles.tagRow}>
              {tags.length === 0 ? <p className={styles.hint}>还没有标签</p> : null}
              {tags.map((tag) => {
                const palette = TAG_COLORS[tag.color]
                const active = draft.tags.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`chip ${active ? 'active' : ''}`}
                    style={{ background: palette.bg, color: palette.fg, borderColor: active ? 'var(--gold)' : 'transparent' }}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        tags: prev.tags.includes(tag.id)
                          ? prev.tags.filter((id) => id !== tag.id)
                          : [...prev.tags, tag.id],
                      }))
                    }
                  >
                    {tag.name}
                  </button>
                )
              })}
              <button type="button" className="chip" onClick={openTags}>
                管理标签
              </button>
            </div>
          </div>

          <div className="field">
            <span>状态</span>
            <div className={styles.status}>
              <button
                type="button"
                className={`chip ${draft.status === 'pending' ? 'active' : ''}`}
                onClick={() => setDraft((prev) => ({ ...prev, status: 'pending' }))}
              >
                未打卡
              </button>
              <button
                type="button"
                className={`chip ${draft.status === 'done' ? 'active' : ''}`}
                onClick={() => setDraft((prev) => ({ ...prev, status: 'done' }))}
              >
                已打卡
              </button>
            </div>
          </div>

          <label className="field">
            <span>探店复盘心得</span>
            <textarea
              value={draft.review}
              placeholder="打卡后写下真实体验、测评感受"
              onChange={(event) => setDraft((prev) => ({ ...prev, review: event.target.value }))}
            />
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="danger-ghost" onClick={requestDelete}>
          删除
        </Button>
        <div className={styles.right}>
          <Button variant="ghost" onClick={closeEdit}>
            取消
          </Button>
          <Button onClick={save}>保存</Button>
        </div>
      </div>
    </Modal>
  )
}
