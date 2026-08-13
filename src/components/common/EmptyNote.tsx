import styles from './EmptyNote.module.css'

interface EmptyNoteProps {
  title: string
  text: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyNote({ title, text, action }: EmptyNoteProps) {
  return (
    <section className={styles.wrap}>
      <div className={styles.art} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
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
