import { useCallback, useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import CategoryRadios from '@/components/common/CategoryRadios'
import TagPicker from '@/components/common/TagPicker'
import SaveSticker from '@/components/common/SaveSticker'
import { getUploadHint, processImages } from '@/api/imageStore'
import type { ProcessedImage } from '@/utils/imageHelper'
import { StorageQuotaError } from '@/utils/storage'
import { tagsForGroup } from '@/utils/filterCards'
import { TagCategoryMismatchError } from '@/utils/tagRules'
import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { CATEGORY_META } from '@/types'
import type { CategoryGroup } from '@/types'
import styles from './UploadModal.module.css'

export default function UploadModal() {
  const open = useUiStore((state) => state.uploadOpen)
  const closeUpload = useUiStore((state) => state.closeUpload)
  const showToast = useUiStore((state) => state.showToast)
  const openTags = useUiStore((state) => state.openTags)
  const addCardsFromImages = useCardStore((state) => state.addCardsFromImages)
  const categoryTab = useCardStore((state) => state.categoryTab)
  const setBusy = useUiStore((state) => state.setBusy)
  const uploadPrefill = useUiStore((state) => state.uploadPrefill)
  const flashCard = useUiStore((state) => state.flashCard)
  const popDay = useUiStore((state) => state.popDay)
  const allTags = useTagStore((state) => state.tags)
  const [previews, setPreviews] = useState<ProcessedImage[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setLocalBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shake, setShake] = useState(false)
  const [group, setGroup] = useState<CategoryGroup>('catering')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const tags = tagsForGroup(allTags, group)

  useEffect(() => {
    if (!open) return
    setGroup(categoryTab === 'other' ? 'other' : 'catering')
    setSelectedTags([])
    setSaved(false)
  }, [open, categoryTab])

  const reset = () => {
    setPreviews([])
    setDragging(false)
    setLocalBusy(false)
    setBusy(false)
    setSelectedTags([])
    setSaved(false)
  }

  const handleClose = () => {
    reset()
    closeUpload()
  }

  const ingestFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (files.length === 0) {
      showToast('请选择图片文件', 'error')
      return
    }
    setLocalBusy(true)
    setBusy(true)
    try {
      const images = await processImages(files)
      setPreviews((prev) => [...prev, ...images])
    } catch (error) {
      showToast(error instanceof Error ? error.message : '图片处理失败', 'error')
    } finally {
      setLocalBusy(false)
      setBusy(false)
    }
  }, [showToast, setBusy])

  const onDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    await ingestFiles(event.dataTransfer.files)
  }

  const confirm = () => {
    if (previews.length === 0) {
      setShake(true)
      window.setTimeout(() => setShake(false), 360)
      return
    }
    try {
      const created = addCardsFromImages(
        previews.map((item) => item.original),
        {
          categoryGroup: group,
          tags: selectedTags,
          visitDate: uploadPrefill.visitDate,
          status: uploadPrefill.status,
          thumbs: previews.map((item) => item.thumb),
        },
      )
      setSaved(true)
      if (created[0]) flashCard(created[0].id)
      if (uploadPrefill.visitDate) popDay(uploadPrefill.visitDate)
      showToast('手账记录已妥善保存✨', 'success')
      window.setTimeout(() => handleClose(), 420)
    } catch (error) {
      if (error instanceof TagCategoryMismatchError) {
        showToast(error.message, 'error')
        return
      }
      const message = error instanceof StorageQuotaError ? error.message : '保存失败，请稍后重试'
      showToast(message, 'error')
    }
  }

  return (
    <Modal open={open} title="把想去的地方收进来" onClose={handleClose}>
      <SaveSticker show={saved} />
      <div className={styles.group}>
        <span>所属大类</span>
        <CategoryRadios
          value={group}
          onChange={(next) => {
            setGroup(next)
            setSelectedTags([])
          }}
        />
        <p className={styles.groupHint}>{CATEGORY_META[group].hint}</p>
      </div>

      <label
        className={`${styles.drop} ${dragging ? styles.dragging : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void ingestFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <strong>点击或拖拽上传</strong>
        <span>支持一次多张，确认后会生成未打卡卡片</span>
      </label>
      <p className={styles.note}>{getUploadHint()}</p>

      <div className={styles.tagBox}>
        <span>标签</span>
        <TagPicker
          tags={tags}
          selectedIds={selectedTags}
          onChange={setSelectedTags}
          onManage={openTags}
          slideKey={group}
        />
      </div>

      {previews.length > 0 ? (
        <div className={styles.preview}>
          {previews.map((item, index) => (
            <div key={`${item.thumb.slice(0, 24)}-${index}`} className={styles.thumb}>
              <img src={item.thumb || item.original} alt={`预览 ${index + 1}`} />
              <button
                type="button"
                aria-label="移除这张图片"
                onClick={() => setPreviews((prev) => prev.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={handleClose}>
          取消
        </Button>
        <Button className={shake ? 'shake' : ''} onClick={confirm} disabled={busy}>
          {busy ? '处理中…' : `确认导入 ${previews.length || ''}`}
        </Button>
      </div>
    </Modal>
  )
}
