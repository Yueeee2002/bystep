import { useEffect } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { useUiStore } from '@/store/uiStore'
import styles from './Lightbox.module.css'

export default function Lightbox() {
  const open = useUiStore((state) => state.lightboxOpen)
  const images = useUiStore((state) => state.lightboxImages)
  const index = useUiStore((state) => state.lightboxIndex)
  const closeLightbox = useUiStore((state) => state.closeLightbox)
  const stepLightbox = useUiStore((state) => state.stepLightbox)
  const src = images[index]

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') stepLightbox(1)
      if (event.key === 'ArrowLeft') stepLightbox(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, stepLightbox])

  return (
    <Dialog open={open} onClose={closeLightbox} className={styles.root}>
      <div className={styles.backdrop} />
      <div className={styles.wrap}>
        <DialogPanel className={styles.panel}>
          {src ? <img src={src} alt="预览大图" /> : null}
          {images.length > 1 ? (
            <>
              <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => stepLightbox(-1)}>
                ‹
              </button>
              <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => stepLightbox(1)}>
                ›
              </button>
              <p className={styles.count}>
                {index + 1} / {images.length}
              </p>
            </>
          ) : null}
          <button type="button" className={styles.close} onClick={closeLightbox}>
            关闭
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
