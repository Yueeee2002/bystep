import { useEffect, useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import type { CardStatus } from '@/types'
import styles from './EditModal.module.css'

interface Draft {
  title: string
  address: string
  notes: string
  review: string
  status: CardStatus
  tags: string[]
}

const emptyDraft: Draft = {
  title: '',
  address: '',
  notes: '',
  review: '',
  status: 'pending',
  tags: [],
}

export default function EditModal() {
  const open = useUiStore((state) => state.editOpen)
  const editingCardId = useUiStore((state) => state.editingCardId)
  const closeEdit = useUiStore((state) => state.closeEdit)
  const openLightbox = useUiStore((state) => state.openLightbox)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const openTags = useUiStore((state) => state.openTags)
  const showToast = useUiStore((state) => state.showToast)
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
    })
    setImageIndex(0)
  }, [card])

  if (!card) {
    return (
      <Modal open={open} title="编辑点位" onClose={closeEdit}>
        <p>卡片不存在或已删除。</p>
      </Modal>
    )
  }

  const currentImage = card.images[imageIndex] ?? card.images[0]

  const save = () => {
    updateCard(card.id, draft)
    showToast('已保存', 'success')
    closeEdit()
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
        <div className={styles.gallery}>
          {currentImage ? (
            <button type="button" className={styles.hero} onClick={() => openLightbox(currentImage)}>
              <img src={currentImage} alt={draft.title || '点位图片'} />
              <span>点击放大</span>
            </button>
          ) : (
            <div className={styles.heroEmpty}>暂无图片</div>
          )}
          {card.images.length > 1 ? (
            <div className={styles.thumbs}>
              {card.images.map((src, index) => (
                <button
                  key={src.slice(0, 20) + index}
                  type="button"
                  className={index === imageIndex ? styles.thumbActive : ''}
                  onClick={() => setImageIndex(index)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

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
          <label className="field">
            <span>备注</span>
            <textarea
              value={draft.notes}
              placeholder="种草亮点、营业时间、必点…"
              onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </label>

          <div className="field">
            <span>标签</span>
            <div className={styles.tagRow}>
              {tags.length === 0 ? <p className={styles.hint}>还没有标签</p> : null}
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`chip ${draft.tags.includes(tag.id) ? 'active' : ''}`}
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
              ))}
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
            <span>探店心得</span>
            <textarea
              value={draft.review}
              placeholder="去过之后，留下一句给未来的自己"
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
