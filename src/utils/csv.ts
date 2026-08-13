import type { IExploreCard, ITag } from '@/types'
import { createId } from '@/utils/filterCards'
import { normalizeCard } from '@/utils/models'

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

export function cardsToCsv(cards: IExploreCard[], tags: ITag[]): string {
  const header = ['title', 'address', 'category_group', 'status', 'visit_date', 'rating', 'tags', 'notes', 'review']
  const lines = cards.map((card) => {
    const names = card.tags
      .map((id) => tags.find((tag) => tag.id === id)?.name)
      .filter(Boolean)
      .join('|')
    return [
      card.title,
      card.address,
      card.categoryGroup,
      card.status,
      card.visitDate,
      String(card.rating),
      names,
      card.notes,
      card.review,
    ]
      .map(escapeCell)
      .join(',')
  })
  return [header.join(','), ...lines].join('\n')
}

export function parseCardsCsv(text: string, tags: ITag[]): IExploreCard[] {
  const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (rows.length < 2) throw new Error('表格里没有可导入的记录')
  const header = splitCsvRow(rows[0]).map((item) => item.trim().toLowerCase())
  const idx = (name: string, fallback: number) => {
    const found = header.indexOf(name)
    return found >= 0 ? found : fallback
  }
  return rows.slice(1).map((line, index) => {
    const cells = splitCsvRow(line)
    const tagNames = (cells[idx('tags', 6)] ?? '').split('|').map((item) => item.trim()).filter(Boolean)
    const tagIds = tagNames
      .map((name) => tags.find((tag) => tag.name === name)?.id)
      .filter((id): id is string => Boolean(id))
    const group = cells[idx('category_group', 2)] === 'other' ? 'other' : 'catering'
    return normalizeCard({
      id: createId(),
      title: cells[idx('title', 0)] ?? `导入点位 ${index + 1}`,
      address: cells[idx('address', 1)] ?? '',
      categoryGroup: group,
      status: cells[idx('status', 3)] === 'done' ? 'done' : 'pending',
      visitDate: cells[idx('visit_date', 4)] ?? '',
      rating: Number(cells[idx('rating', 5)] ?? 0),
      tags: tagIds,
      notes: cells[idx('notes', 7)] ?? '',
      review: cells[idx('review', 8)] ?? '',
      images: [],
      createdAt: Date.now() + index,
    })
  })
}

function splitCsvRow(line: string): string[] {
  const out: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else if (char === '"') {
        quoted = false
      } else {
        current += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      out.push(current)
      current = ''
    } else {
      current += char
    }
  }
  out.push(current)
  return out
}

export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
