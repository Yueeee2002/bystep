export function toIsoDate(value: Date | number | string = new Date()): string {
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const parsed = new Date(`${value}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) {
      const fromStamp = new Date(value)
      if (Number.isNaN(fromStamp.getTime())) return ''
      return formatDate(fromStamp)
    }
    return formatDate(parsed)
  }
  const date = typeof value === 'number' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return formatDate(date)
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function cardVisitDate(card: { visitDate?: string; status?: string; createdAt: number }): string {
  if (card.visitDate) return card.visitDate
  if (card.status === 'done') return toIsoDate(card.createdAt)
  return ''
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export function monthLabel(year: number, month: number): string {
  return `${year}年${month}月`
}
