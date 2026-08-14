import { useEffect, type ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import BackArrow from '@/components/common/BackArrow'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useConfigStore } from '@/store/configStore'
import { resolveViewport } from '@/utils/viewport'
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
  const viewportPreference = useConfigStore((state) => state.viewportPreference)
  const isMobile = resolveViewport(viewportPreference) === 'mobile'
  useBodyScrollLock(open && isMobile)

  useEffect(() => {
    if (!open || !isMobile) return
    const onFocus = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (!target.matches('input, textarea, select')) return
      window.setTimeout(() => {
        target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }, 80)
    }
    document.addEventListener('focusin', onFocus)
    return () => document.removeEventListener('focusin', onFocus)
  }, [open, isMobile])

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

