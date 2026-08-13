import { useState } from 'react'
import type { DragEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useTagData } from '@/hooks/useTagData'
import { useUiStore } from '@/store/uiStore'
import { TAG_COLOR_ORDER, TAG_COLORS } from '@/types'
import type { TagColor } from '@/types'
import styles from './TagModal.module.css'

export default function TagModal() {
  const open = useUiStore((state) => state.tagsOpen)
  const closeTags = useUiStore((state) => state.closeTags)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)
  const { tags, addTag, updateTag, deleteTag, moveTag } = useTagData()
  const [name, setName] = useState('')
  const [color, setColor] = useState<TagColor>('mocha')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [dragFrom, setDragFrom] = useState<number | null>(null)

  const handleAdd = () => {
    const created = addTag(name, color)
    if (!created) {
      showToast(name.trim() ? '标签已存在或无效' : '请输入标签名', 'error')
      return
    }
    setName('')
    showToast('标签已添加', 'success')
  }

  const handleUpdate = (id: string) => {
    const ok = updateTag(id, { name: editingName })
    if (!ok) {
      showToast('标签名重复或为空', 'error')
      return
    }
    setEditingId(null)
    showToast('标签已更新', 'success')
  }

  const handleDelete = (id: string, tagName: string) => {
    openConfirm({
      title: `删除标签「${tagName}」？`,
      message: '删除后，所有卡片上的这个标签都会被解除。',
      confirmText: '删除标签',
      danger: true,
      onConfirm: () => {
        deleteTag(id)
        showToast('标签已删除', 'info')
      },
    })
  }

  const onDrop = (to: number) => {
    if (dragFrom === null) return
    moveTag(dragFrom, to)
    setDragFrom(null)
  }

  return (
    <Modal
      open={open}
      title="标签管理"
      onClose={() => {
        if (useUiStore.getState().confirmOpen) return
        closeTags()
      }}
    >
      <div className={styles.add}>
        <input
          className="input"
          value={name}
          placeholder="新标签，例如：咖啡 / 展览 / 夜色"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAdd()
          }}
        />
        <Button onClick={handleAdd}>新增</Button>
      </div>
      <div className={styles.colors}>
        {TAG_COLOR_ORDER.map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.swatch} ${color === item ? styles.swatchOn : ''}`}
            style={{ background: TAG_COLORS[item].bg, color: TAG_COLORS[item].fg }}
            onClick={() => setColor(item)}
          >
            {TAG_COLORS[item].label}
          </button>
        ))}
      </div>

      <ul className={styles.list}>
        {tags.length === 0 ? <li className={styles.empty}>还没有标签。想怎么分类，就轻轻写下。</li> : null}
        {tags.map((tag, index) => (
          <li
            key={tag.id}
            draggable
            onDragStart={() => setDragFrom(index)}
            onDragOver={(event: DragEvent<HTMLLIElement>) => event.preventDefault()}
            onDrop={() => onDrop(index)}
            onDragEnd={() => setDragFrom(null)}
            className={dragFrom === index ? styles.dragging : ''}
          >
            {editingId === tag.id ? (
              <>
                <input
                  className="input"
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                />
                <Button variant="primary" onClick={() => handleUpdate(tag.id)}>
                  保存
                </Button>
                <Button variant="text" onClick={() => setEditingId(null)}>
                  取消
                </Button>
              </>
            ) : (
              <>
                <span className={styles.item}>
                  <i style={{ background: TAG_COLORS[tag.color].bg }} />
                  {tag.name}
                </span>
                <div className={styles.actions}>
                  {TAG_COLOR_ORDER.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={styles.dot}
                      style={{ background: TAG_COLORS[item].bg }}
                      aria-label={TAG_COLORS[item].label}
                      onClick={() => updateTag(tag.id, { color: item })}
                    />
                  ))}
                  <Button
                    variant="text"
                    onClick={() => {
                      setEditingId(tag.id)
                      setEditingName(tag.name)
                    }}
                  >
                    编辑
                  </Button>
                  <Button variant="danger-ghost" onClick={() => handleDelete(tag.id, tag.name)}>
                    删除
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  )
}
