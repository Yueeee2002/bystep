import type { ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  elevated?: boolean
}

export default function Modal({ open, title, onClose, children, wide, elevated }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className={`${styles.root} ${elevated ? styles.elevated : ''}`}>
      <div className={styles.backdrop} />
      <div className={styles.wrap}>
        <DialogPanel className={`${styles.panel} ${wide ? styles.wide : ''}`}>
          <div className={styles.titleRow}>
            <button type="button" className={styles.back} aria-label="返回" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {title ? <DialogTitle className={styles.title}>{title}</DialogTitle> : <span className={styles.title} />}
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
