import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { compressImages } from '@/utils/imageHelper'
import { moveItem, remapIndexAfterMove, removeImageAt } from '@/utils/models'
import { useUiStore } from '@/store/uiStore'
import styles from './GalleryEditor.module.css'

interface GalleryEditorProps {
  images: string[]
  coverIndex: number
  activeIndex: number
  title: string
  onChange: (next: { images: string[]; coverIndex: number; activeIndex: number }) => void
}

export default function GalleryEditor({
  images,
  coverIndex,
  activeIndex,
  title,
  onChange,
}: GalleryEditorProps) {
  const openLightbox = useUiStore((state) => state.openLightbox)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)
  const setBusy = useUiStore((state) => state.setBusy)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)

  const current = images[activeIndex] ?? images[0]

  const ingest = async (fileList: FileList | File[]) => {
    setBusy(true)
    try {
      const added = await compressImages(Array.from(fileList))
      const nextImages = [...images, ...added]
      onChange({
        images: nextImages,
        coverIndex: images.length === 0 ? 0 : coverIndex,
        activeIndex: images.length,
      })
    } catch (error) {
      showToast(error instanceof Error ? error.message : '图片处理失败', 'error')
    } finally {
      setBusy(false)
    }
  }

  const step = (delta: number) => {
    if (images.length === 0) return
    const next = (activeIndex + delta + images.length) % images.length
    onChange({ images, coverIndex, activeIndex: next })
  }

  const requestRemove = (index: number) => {
    if (images.length <= 1) {
      showToast('至少保留一张配图', 'info')
      return
    }
    openConfirm({
      title: '确定移除这张照片吗？',
      message: '移除后可在保存前继续调整；保存才会写入这条点位。',
      confirmText: '移除',
      danger: true,
      onConfirm: () => {
        const result = removeImageAt(images, coverIndex, index)
        if (result.blocked) return
        const nextActive = Math.min(activeIndex > index ? activeIndex - 1 : activeIndex, result.images.length - 1)
        onChange({
          images: result.images,
          coverIndex: result.coverIndex,
          activeIndex: Math.max(0, nextActive),
        })
      },
    })
  }

  const onThumbDrop = (to: number) => {
    if (dragFrom === null) return
    const nextImages = moveItem(images, dragFrom, to)
    onChange({
      images: nextImages,
      coverIndex: remapIndexAfterMove(dragFrom, to, coverIndex),
      activeIndex: remapIndexAfterMove(dragFrom, to, activeIndex),
    })
    setDragFrom(null)
  }

  return (
    <div
      className={`${styles.wrap} ${dragging ? styles.fileDrag : ''}`}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('Files')) {
          event.preventDefault()
          setDragging(true)
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        if (event.dataTransfer.files.length > 0) {
          event.preventDefault()
          setDragging(false)
          void ingest(event.dataTransfer.files)
        }
      }}
    >
      <div className={styles.hero}>
        {current ? (
          <>
            <button
              type="button"
              className={styles.heroHit}
              onClick={() => openLightbox(images, activeIndex)}
            >
              <img src={current} alt={title || '点位图片'} />
            </button>
            {images.length > 1 ? (
              <>
                <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => step(-1)} aria-label="上一张">
                  ‹
                </button>
                <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => step(1)} aria-label="下一张">
                  ›
                </button>
              </>
            ) : null}
            <span className={styles.hint}>点击放大</span>
          </>
        ) : (
          <div className={styles.empty}>把照片拖到这里</div>
        )}
      </div>

      <div className={styles.rail}>
        <div className={styles.fade} />
        <div className={styles.thumbs}>
          {images.map((src, index) => (
            <div
              key={`${src.slice(-24)}-${index}`}
              className={`${styles.thumb} ${index === activeIndex ? styles.current : ''} ${index === coverIndex ? styles.cover : ''} ${dragFrom === index ? styles.dragging : ''}`}
              draggable
              onDragStart={() => setDragFrom(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onThumbDrop(index)}
              onDragEnd={() => setDragFrom(null)}
            >
              <button type="button" className={styles.thumbHit} onClick={() => onChange({ images, coverIndex, activeIndex: index })}>
                <img src={src} alt="" />
              </button>
              <button
                type="button"
                className={`${styles.crown} ${index === coverIndex ? styles.crownOn : ''}`}
                aria-label="设为封面"
                title="设为封面"
                onClick={() => onChange({ images, coverIndex: index, activeIndex: index })}
              >
                ♛
              </button>
              <button
                type="button"
                className={styles.remove}
                aria-label="删除图片"
                onClick={() => requestRemove(index)}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className={styles.add} onClick={() => fileRef.current?.click()}>
            +
            <span>添加图片</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void ingest(event.target.files)
            event.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
