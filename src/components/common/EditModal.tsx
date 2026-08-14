import { useEffect, useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import GalleryEditor from '@/components/common/GalleryEditor'
import Stars from '@/components/common/Stars'
import CategoryRadios from '@/components/common/CategoryRadios'
import TagPicker from '@/components/common/TagPicker'
import { DecorDot, DecorFood, DecorStar } from '@/components/decor/JournalMarks'
import SaveSticker from '@/components/common/SaveSticker'
import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { tagsForGroup } from '@/utils/filterCards'
import { alignedThumbs } from '@/utils/models'
import { TagCategoryMismatchError } from '@/utils/tagRules'
import type { CardStatus, CategoryGroup } from '@/types'
import styles from './EditModal.module.css'

interface Draft {
  title: string
  address: string
  notes: string
  review: string
  status: CardStatus
  tags: string[]
  images: string[]
  thumbs: string[]
  coverIndex: number
  rating: number
  plannedAt: string
  visitDate: string
  categoryGroup: CategoryGroup
}

const emptyDraft: Draft = {
  title: '',
  address: '',
  notes: '',
  review: '',
  status: 'pending',
  tags: [],
  images: [],
  thumbs: [],
  coverIndex: 0,
  rating: 0,
  plannedAt: '',
  visitDate: '',
  categoryGroup: 'catering',
}

export default function EditModal() {
  const open = useUiStore((state) => state.editOpen)
  const editingCardId = useUiStore((state) => state.editingCardId)
  const closeEdit = useUiStore((state) => state.closeEdit)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const openTags = useUiStore((state) => state.openTags)
  const showToast = useUiStore((state) => state.showToast)
  const flashCard = useUiStore((state) => state.flashCard)
  const popDay = useUiStore((state) => state.popDay)
  const triggerCelebrate = useUiStore((state) => state.triggerCelebrate)
  const cards = useCardStore((state) => state.cards)
  const updateCard = useCardStore((state) => state.updateCard)
  const deleteCard = useCardStore((state) => state.deleteCard)
  const tags = useTagStore((state) => state.tags)
  const card = cards.find((item) => item.id === editingCardId)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [imageIndex, setImageIndex] = useState(0)
  const [saved, setSaved] = useState(false)

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
      thumbs: alignedThumbs(card.images, card.thumbs),
      coverIndex: card.coverIndex,
      rating: card.rating,
      plannedAt: card.plannedAt,
      visitDate: card.visitDate,
      categoryGroup: card.categoryGroup,
    })
    setImageIndex(card.coverIndex)
    setSaved(false)
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
    try {
      updateCard(card.id, draft)
    } catch (error) {
      showToast(error instanceof TagCategoryMismatchError ? error.message : '保存失败', 'error')
      return
    }
    setSaved(true)
    flashCard(card.id)
    if (draft.visitDate) popDay(draft.visitDate)
    showToast('手账记录已妥善保存✨', 'success')
    if (becameDone) triggerCelebrate()
    window.setTimeout(() => closeEdit(), 420)
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
      <SaveSticker show={saved} />
      <div className={styles.layout}>
        <GalleryEditor
          images={draft.images}
          thumbs={draft.thumbs}
          coverIndex={draft.coverIndex}
          activeIndex={imageIndex}
          title={draft.title}
          onChange={(next) => {
            setDraft((prev) => ({
              ...prev,
              images: next.images,
              thumbs: next.thumbs,
              coverIndex: next.coverIndex,
            }))
            setImageIndex(next.activeIndex)
          }}
        />

        <div className={styles.form}>
          <div className={styles.field}>
            <span>所属大类</span>
            <CategoryRadios
              value={draft.categoryGroup}
              onChange={(key: CategoryGroup) =>
                setDraft((prev) => ({
                  ...prev,
                  categoryGroup: key,
                  tags: [],
                }))
              }
            />
          </div>
          <label className={styles.field}>
            <span>店名</span>
            <input
              value={draft.title}
              placeholder="这家店叫什么"
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>地址</span>
            <input
              value={draft.address}
              placeholder="记下详细地址，以后好找"
              onChange={(event) => setDraft((prev) => ({ ...prev, address: event.target.value }))}
            />
          </label>
          <div className={`${styles.field} ${styles.starField}`}>
            <span>心愿星级</span>
            <DecorStar className={styles.starMark} />
            <Stars value={draft.rating} onChange={(rating) => setDraft((prev) => ({ ...prev, rating }))} />
          </div>
          <label className={styles.field}>
            <span>计划探店日期</span>
            <input
              type="date"
              value={draft.plannedAt}
              onChange={(event) => setDraft((prev) => ({ ...prev, plannedAt: event.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>打卡日期</span>
            <input
              type="date"
              value={draft.visitDate}
              onChange={(event) => setDraft((prev) => ({ ...prev, visitDate: event.target.value }))}
            />
          </label>
          <label className={`${styles.field} ${styles.notesField}`}>
            <span>种草备注</span>
            <textarea
              className={styles.notes}
              value={draft.notes}
              placeholder="未打卡时写下种草理由、店铺亮点、必点…"
              onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
            />
            <DecorFood kind="cake" className={styles.cake} />
            <DecorDot size={2} className={styles.noteDotA} delay="0.4s" />
            <DecorDot size={4} tone="cream" className={styles.noteDotB} delay="1.1s" />
          </label>

          <div className={styles.field}>
            <span>标签</span>
            <TagPicker
              tags={tagsForGroup(tags, draft.categoryGroup)}
              selectedIds={draft.tags}
              onChange={(ids) => setDraft((prev) => ({ ...prev, tags: ids }))}
              onManage={openTags}
              slideKey={draft.categoryGroup}
            />
          </div>

          <div className={styles.field}>
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

          <label className={styles.field}>
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
