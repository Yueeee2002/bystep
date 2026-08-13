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
      `INSERT INTO records (id, title, category_group, star, is_check_in, address, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), category_group = VALUES(category_group),
         star = VALUES(star), is_check_in = VALUES(is_check_in), address = VALUES(address), note = VALUES(note)`,
      [id, title, categoryGroup, Number.isFinite(star) ? star : null, isCheckIn, address, note],
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
