import { useEffect, useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useUiStore } from '@/store/uiStore'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog() {
  const open = useUiStore((state) => state.confirmOpen)
  const confirm = useUiStore((state) => state.confirm)
  const closeConfirm = useUiStore((state) => state.closeConfirm)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (open) setTyped('')
  }, [open, confirm?.title])

  if (!confirm) return null

  const needMatch = Boolean(confirm.requireText)
  const matched = !needMatch || typed.trim() === confirm.requireText
  const confirmText = confirm.confirmText ?? '确认'

  return (
    <Modal open={open} title={confirm.title} onClose={closeConfirm} elevated>
      <p className={styles.message}>{confirm.message}</p>
      {needMatch ? (
        <label className="field">
          <span>请输入「{confirm.requireText}」以确认</span>
          <input value={typed} onChange={(event) => setTyped(event.target.value)} />
        </label>
      ) : null}
      <div className={styles.actions}>
        <Button variant="ghost" onClick={closeConfirm}>
          取消
        </Button>
        <Button
          variant={confirm.danger ? 'danger' : 'primary'}
          disabled={!matched}
          onClick={() => {
            const action = confirm.onConfirm
            setTyped('')
            closeConfirm()
            action()
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
