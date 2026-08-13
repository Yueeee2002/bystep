import { Dialog, DialogPanel } from '@headlessui/react'
import { useUiStore } from '@/store/uiStore'
import styles from './Lightbox.module.css'

export default function Lightbox() {
  const open = useUiStore((state) => state.lightboxOpen)
  const src = useUiStore((state) => state.lightboxSrc)
  const closeLightbox = useUiStore((state) => state.closeLightbox)

  return (
    <Dialog open={open} onClose={closeLightbox} className={styles.root}>
      <div className={styles.backdrop} />
      <div className={styles.wrap}>
        <DialogPanel className={styles.panel}>
          {src ? <img src={src} alt="预览大图" /> : null}
          <button type="button" className={styles.close} onClick={closeLightbox}>
            关闭
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
