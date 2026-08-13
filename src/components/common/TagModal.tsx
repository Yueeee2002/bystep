import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useTagData } from '@/hooks/useTagData'
import { useUiStore } from '@/store/uiStore'
import styles from './TagModal.module.css'

export default function TagModal() {
  const open = useUiStore((state) => state.tagsOpen)
  const closeTags = useUiStore((state) => state.closeTags)
  const openConfirm = useUiStore((state) => state.openConfirm)
  const showToast = useUiStore((state) => state.showToast)
  const { tags, addTag, updateTag, deleteTag } = useTagData()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleAdd = () => {
    const created = addTag(name)
    if (!created) {
      showToast(name.trim() ? '标签已存在或无效' : '请输入标签名', 'error')
      return
    }
    setName('')
    showToast('标签已添加', 'success')
  }

  const handleUpdate = (id: string) => {
    const ok = updateTag(id, editingName)
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

      <ul className={styles.list}>
        {tags.length === 0 ? <li className={styles.empty}>还没有标签。想怎么分类，就轻轻写下。</li> : null}
        {tags.map((tag) => (
          <li key={tag.id}>
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
                <span>{tag.name}</span>
                <div>
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
