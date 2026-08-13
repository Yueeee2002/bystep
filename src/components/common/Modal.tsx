import type { ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import BackArrow from '@/components/common/BackArrow'
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
            <BackArrow small onClick={onClose} />
            {title ? <DialogTitle className={styles.title}>{title}</DialogTitle> : <span className={styles.title} />}
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
