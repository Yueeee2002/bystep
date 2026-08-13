import { useCallback, useState } from 'react'
import type { DragEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { compressImages } from '@/utils/imageHelper'
import { StorageQuotaError } from '@/utils/storage'
import { useCardStore } from '@/store/cardStore'
import { useUiStore } from '@/store/uiStore'
import styles from './UploadModal.module.css'

export default function UploadModal() {
  const open = useUiStore((state) => state.uploadOpen)
  const closeUpload = useUiStore((state) => state.closeUpload)
  const showToast = useUiStore((state) => state.showToast)
  const addCardsFromImages = useCardStore((state) => state.addCardsFromImages)
  const setBusy = useUiStore((state) => state.setBusy)
  const [previews, setPreviews] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setLocalBusy] = useState(false)

  const reset = () => {
    setPreviews([])
    setDragging(false)
    setLocalBusy(false)
    setBusy(false)
  }

  const handleClose = () => {
    reset()
    closeUpload()
  }

  const ingestFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) {
      showToast('请选择图片文件', 'error')
      return
    }
    setLocalBusy(true)
    setBusy(true)
    try {
      const images = await compressImages(files)
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
      addCardsFromImages(previews)
      showToast(`已收纳 ${previews.length} 个点位`, 'success')
      handleClose()
    } catch (error) {
      const message = error instanceof StorageQuotaError ? error.message : '保存失败，请稍后重试'
      showToast(message, 'error')
    }
  }

  return (
    <Modal open={open} title="把想去的地方收进来" onClose={handleClose}>
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
