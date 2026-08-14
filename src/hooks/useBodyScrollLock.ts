import { useEffect } from 'react'

let lockCount = 0
let savedY = 0
let prevHtmlOverflow = ''
let prevBodyOverflow = ''
let prevBodyPosition = ''
let prevBodyTop = ''
let prevBodyLeft = ''
let prevBodyRight = ''
let prevBodyWidth = ''

function lock() {
  const html = document.documentElement
  const { body } = document
  savedY = window.scrollY
  prevHtmlOverflow = html.style.overflow
  prevBodyOverflow = body.style.overflow
  prevBodyPosition = body.style.position
  prevBodyTop = body.style.top
  prevBodyLeft = body.style.left
  prevBodyRight = body.style.right
  prevBodyWidth = body.style.width
  html.classList.add('modal-open')
  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'
  body.style.position = 'fixed'
  body.style.top = `-${savedY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
}

function unlock() {
  const html = document.documentElement
  const { body } = document
  html.classList.remove('modal-open')
  html.style.overflow = prevHtmlOverflow
  body.style.overflow = prevBodyOverflow
  body.style.position = prevBodyPosition
  body.style.top = prevBodyTop
  body.style.left = prevBodyLeft
  body.style.right = prevBodyRight
  body.style.width = prevBodyWidth
  window.scrollTo(0, savedY)
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    if (lockCount === 0) lock()
    lockCount += 1
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) unlock()
    }
  }, [locked])
}
