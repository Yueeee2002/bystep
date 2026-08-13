import Button from '@/components/common/Button'
import type { ITag } from '@/types'
import styles from './BatchBar.module.css'

interface BatchBarProps {
  count: number
  tags: ITag[]
  onAddTag: (tagId: string) => void
  onStatus: (status: 'pending' | 'done') => void
  onCancel: () => void
}

export default function BatchBar({ count, tags, onAddTag, onStatus, onCancel }: BatchBarProps) {
  return (
    <div className={styles.bar}>
      <span>已选 {count} 张</span>
      <select
        className={styles.select}
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) onAddTag(event.target.value)
          event.target.value = ''
        }}
      >
        <option value="" disabled>
          批量加标签
        </option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
      <Button variant="ghost" onClick={() => onStatus('pending')}>
        未打卡
      </Button>
      <Button onClick={() => onStatus('done')}>已打卡</Button>
      <Button variant="text" onClick={onCancel}>
        取消
      </Button>
    </div>
  )
}
