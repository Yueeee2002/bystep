import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

interface Options {
  enabled: boolean
  onReorder: (from: number, to: number) => void
  onDropGroup?: (from: number, group: string) => void
}

export function useHandleReorder({ enabled, onReorder, onDropGroup }: Options) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [overGroup, setOverGroup] = useState<string | null>(null)
  const activeRef = useRef<number | null>(null)
  const overRef = useRef<number | null>(null)
  const groupRef = useRef<string | null>(null)
  const reorderRef = useRef(onReorder)
  const dropGroupRef = useRef(onDropGroup)

  reorderRef.current = onReorder
  dropGroupRef.current = onDropGroup
  activeRef.current = activeIndex
  overRef.current = overIndex
  groupRef.current = overGroup

  const reset = useCallback(() => {
    setActiveIndex(null)
    setOverIndex(null)
    setOverGroup(null)
  }, [])

  useEffect(() => {
    if (activeIndex === null) return
    document.documentElement.classList.add('tag-sorting')
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const readTarget = (event: PointerEvent) => {
      const node = document.elementFromPoint(event.clientX, event.clientY)
      const item = node?.closest('[data-sort-index]') as HTMLElement | null
      const group = node?.closest('[data-sort-group]') as HTMLElement | null
      if (item) {
        const next = Number(item.dataset.sortIndex)
        if (!Number.isNaN(next)) {
          overRef.current = next
          setOverIndex(next)
        }
      }
      if (group?.dataset.sortGroup) {
        groupRef.current = group.dataset.sortGroup
        setOverGroup(group.dataset.sortGroup)
      }
    }

    const onMove = (event: PointerEvent) => {
      event.preventDefault()
      readTarget(event)
    }

    const onUp = () => {
      const from = activeRef.current
      const to = overRef.current
      const group = groupRef.current
      let changed = false
      if (from !== null && to !== null && from !== to) {
        reorderRef.current(from, to)
        changed = true
      } else if (from !== null && group) {
        dropGroupRef.current?.(from, group)
      }
      if (changed) {
        const block = (event: MouseEvent) => {
          event.preventDefault()
          event.stopPropagation()
          window.removeEventListener('click', block, true)
        }
        window.addEventListener('click', block, true)
      }
      document.documentElement.classList.remove('tag-sorting')
      document.body.style.overflow = prevOverflow
      reset()
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.documentElement.classList.remove('tag-sorting')
      document.body.style.overflow = prevOverflow
    }
  }, [activeIndex, reset])

  const onHandlePointerDown = useCallback(
    (index: number) => (event: ReactPointerEvent) => {
      if (!enabled || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.setPointerCapture?.(event.pointerId)
      setActiveIndex(index)
      setOverIndex(index)
      try {
        navigator.vibrate?.(10)
      } catch {
        /* ignore */
      }
    },
    [enabled],
  )

  return {
    activeIndex,
    overIndex,
    overGroup,
    sorting: activeIndex !== null,
    onHandlePointerDown,
    reset,
  }
}

/** @deprecated use useHandleReorder */
export const useLongPressReorder = useHandleReorder
