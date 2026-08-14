import JournalScene from '@/components/decor/JournalScene'
import styles from './EmptyNote.module.css'

interface EmptyNoteProps {
  title: string
  text: string
  kind?: 'home' | 'tags' | 'search' | 'default'
  action?: { label: string; onClick: () => void }
}

export default function EmptyNote({ title, text, kind = 'default', action }: EmptyNoteProps) {
  return (
    <section className={styles.wrap}>
      {kind === 'default' ? (
        <div className={styles.art} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <JournalScene kind={kind} className={styles.scene} />
      )}
      <h2>{title}</h2>
      <p>{text}</p>
      {action ? (
        <button type="button" className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </section>
  )
}
