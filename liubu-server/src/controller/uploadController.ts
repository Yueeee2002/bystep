import type { Request, Response } from 'express'
import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/db'

const UPLOAD_DIR = path.resolve(__dirname, '../../public/upload')
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png'])

fs.ensureDirSync(UPLOAD_DIR)

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        code: 400,
        msg: '未选择需要上传的图片',
      })
      return
    }

    const rawExt = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase()
    const fileExt = ALLOWED_EXT.has(rawExt) ? rawExt : 'jpg'
    const fileName = `${uuidv4()}.${fileExt}`
    const fullSavePath = path.join(UPLOAD_DIR, fileName)

    await fs.writeFile(fullSavePath, req.file.buffer)

    const imageUrl = `${process.env.SERVER_DOMAIN}/upload/${fileName}`

    if (pool) {
      try {
        await pool.query('INSERT INTO images (image_url, create_time) VALUES (?, NOW())', [imageUrl])
      } catch (error) {
        console.warn('图片已写入磁盘，数据库记录失败：', error)
      }
    }

    res.json({
      code: 200,
      data: {
        url: imageUrl,
      },
      msg: '图片上传成功',
    })
  } catch (error) {
    console.error('图片上传失败：', error)
    res.status(500).json({
      code: 500,
      msg: '服务器上传异常',
    })
  }
}
