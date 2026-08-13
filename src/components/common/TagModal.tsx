import { useState } from 'react'
import type { DragEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useTagData } from '@/hooks/useTagData'
import { useUiStore } from '@/store/uiStore'
import { TAG_COLOR_ORDER } from '@/types'
import type { CategoryGroup } from '@/types'
import { useConfigStore } from '@/store/configStore'
import { resolveTagColor } from '@/utils/palette'
import styles from './TagModal.module.css'

interface TagForm {
  id: string | null
  name: string
  group: CategoryGroup | null
  color: string
}

const emptyForm = (name = '', color: string = 'mocha'): TagForm => ({
  id: null,
  name,
  group: null,
  color,
})

export default function TagModal({ asPage = false }: { asPage?: boolean }) {
  const open = useUiStore((state) => state.tagsOpen)
  const closeTags = useUiStore((state) => state.closeTags)
  const showToast = useUiStore((state) => state.showToast)
  const { tags, addTag, updateTag, deleteTag, moveTag } = useTagData()
  const [name, setName] = useState('')
  const [presetColor, setPresetColor] = useState<string>('mocha')
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [form, setForm] = useState<TagForm | null>(null)
  const [groupError, setGroupError] = useState(false)
  const [shakeSave, setShakeSave] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [openGroups, setOpenGroups] = useState<Record<CategoryGroup, boolean>>({
    catering: true,
    other: true,
  })
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dropGroup, setDropGroup] = useState<CategoryGroup | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const closeForm = () => {
    setForm(null)
    setGroupError(false)
    setShakeSave(false)
  }

  const openCreate = () => {
    setGroupError(false)
    setForm(emptyForm(name, presetColor))
  }

  const openEdit = (tag: { id: string; name: string; group: CategoryGroup; color: string }) => {
    setGroupError(false)
    setForm({ id: tag.id, name: tag.name, group: tag.group, color: tag.color })
  }

  const handleSaveForm = () => {
    if (!form) return
    if (!form.group) {
      setGroupError(true)
      setShakeSave(true)
      window.setTimeout(() => setShakeSave(false), 400)
      return
    }
    if (form.id) {
      const previous = tags.find((tag) => tag.id === form.id)
      const ok = updateTag(form.id, { name: form.name, group: form.group, color: form.color })
      if (!ok) {
        showToast('标签名重复或为空', 'error')
        return
      }
      if (previous && previous.group !== form.group) {
        setFlashId(form.id)
        window.setTimeout(() => setFlashId(null), 600)
      }
      showToast('标签已更新', 'success')
    } else {
      const created = addTag(form.name, form.color, form.group)
      if (!created) {
        showToast(form.name.trim() ? '标签已存在或无效' : '请输入标签名', 'error')
        return
      }
      setName('')
      showToast('标签已添加', 'success')
    }
    closeForm()
  }

  const onDrop = (to: number) => {
    if (dragFrom === null) return
    moveTag(dragFrom, to)
    setDragFrom(null)
  }

  const dropToGroup = (group: CategoryGroup) => {
    if (dragFrom === null) return
    const tag = tags[dragFrom]
    if (tag && tag.group !== group) {
      updateTag(tag.id, { group })
      setFlashId(tag.id)
      window.setTimeout(() => setFlashId(null), 600)
      showToast('已归入新的大类', 'success')
    }
    setDragFrom(null)
    setDropGroup(null)
  }

  const confirmDelete = (id: string) => {
    deleteTag(id)
    setPendingDelete(null)
    showToast('标签已删除', 'info')
  }

  const labels = useConfigStore((state) => state.categoryLabels)
  const extras = useConfigStore((state) => state.customTagColors)
  const palette = [...TAG_COLOR_ORDER, ...extras.map((item) => item.id)]
  const swatch = (color: string) => resolveTagColor(color, extras)
  const groups: CategoryGroup[] = ['catering', 'other']

  const body = (
    <div className={styles.body}>
        <div className={styles.add}>
          <input
            className="input"
            value={name}
            placeholder="新标签，例如：咖啡 / 展览 / 夜色"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                useUiStore.getState().showKeyHint('Enter 新增标签')
                openCreate()
              }
            }}
          />
          <Button className={styles.addBtn} onClick={openCreate} aria-label="新增标签">
            新增
          </Button>
        </div>
        {name.trim() ? (
          <span className={styles.previewChip} style={{ background: swatch(presetColor).bg, color: swatch(presetColor).fg }}>
            {name.trim()}
          </span>
        ) : null}

        <section className={styles.section}>
          <p className={styles.sectionLabel}>所属顶级大类</p>
          <div className={styles.row}>
            {groups.map((key) => (
              <span key={key} className={styles.locked}>
                {labels[key]}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionLabel}>标签配色预设</p>
          <div className={styles.row}>
            {palette.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.swatch} ${presetColor === item ? styles.swatchOn : ''}`}
                style={{ background: swatch(item).bg, color: swatch(item).fg }}
                onClick={() => setPresetColor(item)}
                onMouseEnter={() => setPreviewColor(item)}
                onMouseLeave={() => setPreviewColor(null)}
              >
                {swatch(item).label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.listHead}>
            <p className={styles.sectionLabel}>已创建标签列表</p>
            <button
              type="button"
              className={styles.foldAll}
              onClick={() => setOpenGroups({ catering: false, other: false })}
            >
              全部收拢
            </button>
          </div>
          {tags.length === 0 ? <p className={styles.emptyCopy}>还没有标签。想怎么分类，就轻轻写下。</p> : null}
          {groups.map((group) => {
            const items = tags.filter((tag) => tag.group === group)
            const expanded = openGroups[group]
            return (
              <div
                key={group}
                className={`${styles.fold} ${expanded ? '' : styles.foldShut} ${dropGroup === group ? styles.dropOn : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDropGroup(group)
                }}
                onDragLeave={() => setDropGroup((prev) => (prev === group ? null : prev))}
                onDrop={(event) => {
                  event.preventDefault()
                  dropToGroup(group)
                }}
              >
                <button
                  type="button"
                  className={`${styles.foldHead} ${expanded ? '' : styles.foldHeadShut}`}
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }))}
                  aria-expanded={expanded}
                >
                  <span className={`${styles.arrow} ${expanded ? styles.arrowOpen : ''}`} aria-hidden="true">
                    ▶
                  </span>
                  {labels[group]}
                  <em>{items.length}</em>
                </button>
                <div className={styles.foldBody}>
                  <ul className={styles.list}>
                    {items.length === 0 ? <li className={styles.empty}>这一类还空着</li> : null}
                    {items.map((tag) => {
                      const index = tags.findIndex((item) => item.id === tag.id)
                      return (
                        <li
                          key={tag.id}
                          draggable
                          onDragStart={() => setDragFrom(index)}
                          onDragOver={(event: DragEvent<HTMLLIElement>) => event.preventDefault()}
                          onDrop={(event) => {
                            event.stopPropagation()
                            onDrop(index)
                          }}
                          onDragEnd={() => setDragFrom(null)}
                          className={`${dragFrom === index ? styles.dragging : ''} ${
                            flashId === tag.id ? styles.flash : ''
                          } ${previewColor === tag.color ? styles.preview : ''}`}
                        >
                          <span className={styles.item}>
                            <i style={{ background: swatch(tag.color).bg }} />
                            {tag.name}
                            <em>{labels[tag.group]}</em>
                            <b>{swatch(tag.color).label}</b>
                          </span>
                          <div className={styles.actions}>
                            <Button variant="text" className={styles.editBtn} onClick={() => openEdit(tag)}>
                              编辑
                            </Button>
                            <Button
                              variant="danger-ghost"
                              className={styles.deleteBtn}
                              onClick={() => setPendingDelete(pendingDelete === tag.id ? null : tag.id)}
                            >
                              删除
                            </Button>
                            {pendingDelete === tag.id ? (
                              <span className={styles.bubble}>
                                撕掉这枚标签？
                                <button type="button" onClick={() => confirmDelete(tag.id)}>
                                  确认
                                </button>
                                <button type="button" onClick={() => setPendingDelete(null)}>
                                  取消
                                </button>
                              </span>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )
          })}
        </section>

        {form ? (
          <div className={styles.sheetMask}>
            <div className={styles.sheet} role="dialog" aria-labelledby="tag-form-title">
              <h3 id="tag-form-title">{form.id ? '编辑标签' : '新增标签'}</h3>
              <label className="field">
                <span>标签名称</span>
                <input
                  className="input"
                  value={form.name}
                  placeholder="例如：咖啡 / 展览 / 夜色"
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <div className="field">
                <span>所属顶级大类（必选）</span>
                <div className={styles.row}>
                  {groups.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.choice} ${form.group === key ? styles.choiceOn : ''}`}
                      onClick={() => {
                        setForm({ ...form, group: key })
                        setGroupError(false)
                      }}
                    >
                      {labels[key]}
                    </button>
                  ))}
                </div>
                {groupError ? <p className={styles.error}>请选择标签归属大类</p> : null}
              </div>
              <div className="field">
                <span>标签配色预设</span>
                <div className={styles.row}>
                  {palette.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`${styles.swatch} ${form.color === item ? styles.swatchOn : ''}`}
                      style={{ background: swatch(item).bg, color: swatch(item).fg }}
                      onClick={() => setForm({ ...form, color: item })}
                    >
                      {swatch(item).label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.sheetActions}>
                <Button variant="ghost" onClick={closeForm}>
                  取消
                </Button>
                <Button className={shakeSave ? styles.shake : ''} onClick={handleSaveForm}>
                  保存
                </Button>
              </div>
            </div>
          </div>
        ) : null}
    </div>
  )

  if (asPage) return body

  return (
    <Modal
      open={open}
      title="标签管理"
      onClose={() => {
        if (useUiStore.getState().confirmOpen) return
        if (form) {
          closeForm()
          return
        }
        closeTags()
      }}
    >
      {body}
    </Modal>
  )
}
