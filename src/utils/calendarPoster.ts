import { monthLabel } from '@/utils/dates'
import type { CalendarCell } from '@/utils/calendar'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export function downloadMonthPoster(
  year: number,
  month: number,
  cells: CalendarCell[],
  stats: { total: number; catering: number; other: number },
): boolean {
  const canvas = document.createElement('canvas')
  const width = 1080
  const height = 1420
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  ctx.fillStyle = '#f7f4ee'
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#e8d5b7'
  ctx.lineWidth = 8
  ctx.setLineDash([10, 8])
  ctx.strokeRect(36, 36, width - 72, height - 72)
  ctx.setLineDash([])

  ctx.fillStyle = '#161616'
  ctx.font = '600 54px "Noto Serif SC", serif'
  ctx.textAlign = 'center'
  ctx.fillText('留步', width / 2, 130)

  ctx.fillStyle = '#4d4d4d'
  ctx.font = '400 28px "Noto Sans SC", sans-serif'
  ctx.fillText(monthLabel(year, month), width / 2, 178)

  const gridX = 80
  const gridY = 230
  const gridW = width - 160
  const cellW = gridW / 7
  const cellH = 128

  ctx.font = '400 20px "Noto Sans SC", sans-serif'
  ctx.fillStyle = '#9a9086'
  WEEKDAYS.forEach((day, index) => {
    ctx.fillText(day, gridX + cellW * index + cellW / 2, gridY)
  })

  cells.slice(0, 42).forEach((cell, index) => {
    const col = index % 7
    const row = Math.floor(index / 7)
    const x = gridX + col * cellW + 8
    const y = gridY + 24 + row * cellH
    ctx.fillStyle = cell.inMonth ? '#fffcf7' : 'rgba(255,252,247,0.45)'
    roundRect(ctx, x, y, cellW - 16, cellH - 14, 18)
    ctx.fill()
    if (cell.isToday) {
      ctx.strokeStyle = '#e8d5b7'
      ctx.lineWidth = 3
      ctx.stroke()
    }
    ctx.fillStyle = cell.inMonth ? '#161616' : '#b8aea3'
    ctx.font = '500 22px "Noto Sans SC", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(String(cell.day), x + 14, y + 32)
    let markX = x + 14
    if (cell.catering > 0) {
      drawDot(ctx, markX, y + cellH - 42, '#e8d5b7')
      markX += 22
    }
    if (cell.other > 0) {
      drawDot(ctx, markX, y + cellH - 42, '#d4ead9')
    }
    if (cell.total >= 3) {
      ctx.fillStyle = '#5c4630'
      ctx.font = '400 14px "Noto Sans SC", sans-serif'
      ctx.fillText(`${cell.total}`, x + cellW - 42, y + cellH - 36)
    }
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = '#9a9086'
  ctx.font = '400 22px "Noto Sans SC", sans-serif'
  ctx.fillText(
    `当月总计打卡：${stats.total} 次・食肆小店 ${stats.catering} 次・野趣小仓 ${stats.other} 次`,
    width / 2,
    height - 88,
  )

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `留步-${year}年${month}月-手账.png`
  link.click()
  return true
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x + 8, y + 8, 8, 0, Math.PI * 2)
  ctx.fill()
}
