import { useCallback, useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { uploadImages } from '@/api/imageStore'
import { StorageQuotaError } from '@/utils/storage'
import { tagsForGroup } from '@/utils/filterCards'
import { useCardStore } from '@/store/cardStore'
import { useTagStore } from '@/store/tagStore'
import { useUiStore } from '@/store/uiStore'
import { CATEGORY_META, TAG_COLORS } from '@/types'
import type { CategoryGroup } from '@/types'
import styles from './UploadModal.module.css'

export default function UploadModal() {
  const open = useUiStore((state) => state.uploadOpen)
  const closeUpload = useUiStore((state) => state.closeUpload)
  const showToast = useUiStore((state) => state.showToast)
  const addCardsFromImages = useCardStore((state) => state.addCardsFromImages)
  const categoryTab = useCardStore((state) => state.categoryTab)
  const setBusy = useUiStore((state) => state.setBusy)
  const allTags = useTagStore((state) => state.tags)
  const [previews, setPreviews] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setLocalBusy] = useState(false)
  const [group, setGroup] = useState<CategoryGroup>('catering')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const tags = tagsForGroup(allTags, group)

  useEffect(() => {
    if (!open) return
    setGroup(categoryTab === 'other' ? 'other' : 'catering')
    setSelectedTags([])
  }, [open, categoryTab])

  const reset = () => {
    setPreviews([])
    setDragging(false)
    setLocalBusy(false)
    setBusy(false)
    setSelectedTags([])
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
      const images = await uploadImages(files)
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
    if (previews.length === 0) return
    try {
      addCardsFromImages(previews, { categoryGroup: group, tags: selectedTags })
      showToast(`已收纳 ${previews.length} 个点位`, 'success')
      handleClose()
    } catch (error) {
      const message = error instanceof StorageQuotaError ? error.message : '保存失败，请稍后重试'
      showToast(message, 'error')
    }
  }

  return (
    <Modal open={open} title="把想去的地方收进来" onClose={handleClose}>
      <div className={styles.group}>
        <span>所属大类</span>
        <div className={styles.radios}>
          {(Object.keys(CATEGORY_META) as CategoryGroup[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`${styles.radio} ${group === key ? styles.radioOn : ''}`}
              onClick={() => {
                setGroup(key)
                setSelectedTags([])
              }}
            >
              {CATEGORY_META[key].radio}
            </button>
          ))}
        </div>
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
      <p className={styles.note}>温馨小记：照片已妥善存放，可清理手机相册原图释放存储空间哦。</p>

      {tags.length > 0 ? (
        <div className={styles.tagBox}>
          <span>标签</span>
          <div className={styles.tagRow}>
            {tags.map((tag) => {
              const palette = TAG_COLORS[tag.color]
              const active = selectedTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`chip ${active ? 'active' : ''}`}
                  style={{
                    background: palette.bg,
                    color: palette.fg,
                    borderColor: active ? 'var(--gold)' : 'transparent',
                  }}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id],
                    )
                  }
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {previews.length > 0 ? (
        <div className={styles.preview}>
          {previews.map((src, index) => (
            <div key={`${src.slice(0, 24)}-${index}`} className={styles.thumb}>
              <img src={src} alt={`预览 ${index + 1}`} />
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
        <Button onClick={confirm} disabled={busy || previews.length === 0}>
          {busy ? '处理中…' : `确认导入 ${previews.length || ''}`}
        </Button>
      </div>
    </Modal>
  )
}
