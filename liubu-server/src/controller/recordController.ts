import type { Request, Response } from 'express'
import pool from '../config/db'

const GROUPS = new Set(['catering', 'other'])

export const saveRecord = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.body?.id ?? '').trim()
  const title = String(req.body?.title ?? '').trim()
  const categoryGroup = String(req.body?.category_group ?? '')
  const tagIds = Array.isArray(req.body?.tag_ids) ? req.body.tag_ids.map((item: unknown) => Number(item)) : []
  const star = req.body?.star === undefined ? null : Number(req.body.star)
  const isCheckIn = Number(req.body?.is_check_in) === 1 ? 1 : 0
  const visitDate = String(req.body?.visit_date ?? '') || null
  const address = String(req.body?.address ?? '')
  const note = String(req.body?.note ?? '')

  if (!id || !title) {
    res.status(400).json({ code: 400, msg: '缺少点位 ID 或名称' })
    return
  }
  if (!GROUPS.has(categoryGroup)) {
    res.status(400).json({ code: 400, msg: '所属大类仅支持 catering 或 other' })
    return
  }
  if (!pool) {
    res.status(503).json({ code: 503, msg: '数据库未就绪' })
    return
  }

  try {
    if (tagIds.length > 0) {
      const [rows] = await pool.query(
        'SELECT id, category_group FROM tags WHERE id IN (?)',
        [tagIds],
      )
      const found = rows as Array<{ id: number; category_group: string }>
      if (found.length !== tagIds.length || found.some((tag) => tag.category_group !== categoryGroup)) {
        res.status(400).json({ code: 400, msg: '标签与所属大类不一致' })
        return
      }
    }

    await pool.query(
      `INSERT INTO records (id, title, category_group, star, is_check_in, visit_date, address, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), category_group = VALUES(category_group),
         star = VALUES(star), is_check_in = VALUES(is_check_in), visit_date = VALUES(visit_date),
         address = VALUES(address), note = VALUES(note)`,
      [id, title, categoryGroup, Number.isFinite(star) ? star : null, isCheckIn, visitDate, address, note],
    )
    await pool.query('DELETE FROM record_tag_rel WHERE record_id = ?', [id])
    for (const tagId of tagIds) {
      await pool.query('INSERT INTO record_tag_rel (record_id, tag_id) VALUES (?, ?)', [id, tagId])
    }
    res.json({ code: 200, msg: '点位已保存' })
  } catch (error) {
    console.error('保存点位失败：', error)
    res.status(500).json({ code: 500, msg: '保存点位失败' })
  }
}

export const listCalendar = async (req: Request, res: Response): Promise<void> => {
  const year = Number(req.query.year)
  const month = Number(req.query.month)
  const group = typeof req.query.category_group === 'string' ? req.query.category_group : ''
  if (!year || month < 1 || month > 12) {
    res.status(400).json({ code: 400, msg: '请传入 year 与 month' })
    return
  }
  if (group && !GROUPS.has(group)) {
    res.status(400).json({ code: 400, msg: 'category_group 仅支持 catering 或 other' })
    return
  }
  if (!pool) {
    res.json({ code: 200, data: [], msg: 'ok' })
    return
  }
  try {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear = month === 12 ? year + 1 : year
    const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`
    const sql = group
      ? `SELECT id, title, category_group, visit_date, is_check_in FROM records
         WHERE visit_date >= ? AND visit_date < ? AND category_group = ? ORDER BY visit_date ASC`
      : `SELECT id, title, category_group, visit_date, is_check_in FROM records
         WHERE visit_date >= ? AND visit_date < ? ORDER BY visit_date ASC`
    const [rows] = await pool.query(sql, group ? [start, end, group] : [start, end])
    res.json({ code: 200, data: rows, msg: 'ok' })
  } catch (error) {
    console.error('获取日历失败：', error)
    res.status(500).json({ code: 500, msg: '获取日历失败' })
  }
}
