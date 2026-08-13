import type { Request, Response } from 'express'
import pool from '../config/db'

const GROUPS = new Set(['catering', 'other'])

export const listTags = async (req: Request, res: Response): Promise<void> => {
  const group = typeof req.query.category_group === 'string' ? req.query.category_group : ''
  if (group && !GROUPS.has(group)) {
    res.status(400).json({ code: 400, msg: 'category_group 仅支持 catering 或 other' })
    return
  }
  if (!pool) {
    res.json({ code: 200, data: [], msg: 'ok' })
    return
  }
  try {
    const sql = group
      ? 'SELECT id, tag_name, category_group, color_code, create_time FROM tags WHERE category_group = ? ORDER BY id ASC'
      : 'SELECT id, tag_name, category_group, color_code, create_time FROM tags ORDER BY id ASC'
    const [rows] = await pool.query(sql, group ? [group] : [])
    res.json({ code: 200, data: rows, msg: 'ok' })
  } catch (error) {
    console.error('获取标签失败：', error)
    res.status(500).json({ code: 500, msg: '获取标签失败' })
  }
}

export const createTag = async (req: Request, res: Response): Promise<void> => {
  const tagName = String(req.body?.tag_name ?? '').trim()
  const categoryGroup = String(req.body?.category_group ?? '')
  const colorCode = String(req.body?.color_code ?? '').trim()
  if (!tagName || !GROUPS.has(categoryGroup)) {
    res.status(400).json({ code: 400, msg: '请填写标签名称并选择归属大类' })
    return
  }
  if (!pool) {
    res.status(503).json({ code: 503, msg: '数据库未就绪' })
    return
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tags (tag_name, category_group, color_code) VALUES (?, ?, ?)',
      [tagName, categoryGroup, colorCode || null],
    )
    res.json({ code: 200, data: { id: (result as { insertId: number }).insertId }, msg: '标签已创建' })
  } catch (error) {
    console.error('创建标签失败：', error)
    res.status(500).json({ code: 500, msg: '创建标签失败' })
  }
}

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id)
  const tagName = req.body?.tag_name !== undefined ? String(req.body.tag_name).trim() : undefined
  const categoryGroup = req.body?.category_group !== undefined ? String(req.body.category_group) : undefined
  const colorCode = req.body?.color_code !== undefined ? String(req.body.color_code).trim() : undefined
  if (!id) {
    res.status(400).json({ code: 400, msg: '标签 ID 无效' })
    return
  }
  if (categoryGroup && !GROUPS.has(categoryGroup)) {
    res.status(400).json({ code: 400, msg: 'category_group 仅支持 catering 或 other' })
    return
  }
  if (!pool) {
    res.status(503).json({ code: 503, msg: '数据库未就绪' })
    return
  }
  try {
    const fields: string[] = []
    const values: Array<string | number> = []
    if (tagName !== undefined) {
      if (!tagName) {
        res.status(400).json({ code: 400, msg: '标签名称不能为空' })
        return
      }
      fields.push('tag_name = ?')
      values.push(tagName)
    }
    if (categoryGroup) {
      fields.push('category_group = ?')
      values.push(categoryGroup)
    }
    if (colorCode !== undefined) {
      fields.push('color_code = ?')
      values.push(colorCode)
    }
    if (fields.length === 0) {
      res.status(400).json({ code: 400, msg: '没有可更新的字段' })
      return
    }
    values.push(id)
    await pool.query(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`, values)
    res.json({ code: 200, msg: '标签已更新' })
  } catch (error) {
    console.error('更新标签失败：', error)
    res.status(500).json({ code: 500, msg: '更新标签失败' })
  }
}
