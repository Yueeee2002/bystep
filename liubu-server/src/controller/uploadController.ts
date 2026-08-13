import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { Request, Response } from 'express'
import pool from '../config/db'

const UPLOAD_DIR = path.resolve(__dirname, '../../public/upload')
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png'])
const MAX_FILE_SIZE = 10 * 1024 * 1024

fs.ensureDirSync(UPLOAD_DIR)

async function convertHighQuality(buffer: Buffer): Promise<{ jpg: Buffer; webp: Buffer } | null> {
  try {
    const loaded = (await import('sharp')) as { default?: SharpConverter }
    const sharp = loaded.default
    if (!sharp) return null
    const jpg = await sharp(buffer).rotate().jpeg({ quality: 90, mozjpeg: true }).toBuffer()
    const webp = await sharp(buffer).rotate().webp({ quality: 95 }).toBuffer()
    return { jpg, webp }
  } catch {
    return null
  }
}

type SharpConverter = (input: Buffer) => {
  rotate: () => {
    jpeg: (opts: { quality: number; mozjpeg?: boolean }) => { toBuffer: () => Promise<Buffer> }
    webp: (opts: { quality: number }) => { toBuffer: () => Promise<Buffer> }
  }
}

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        code: 400,
        msg: '未选择需要上传的图片',
      })
      return
    }

    if (req.file.size > MAX_FILE_SIZE) {
      res.status(400).json({
        code: 400,
        msg: '单张图片请控制在 10MB 以内',
      })
      return
    }

    const rawExt = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase()
    const fileExt = ALLOWED_EXT.has(rawExt) ? rawExt : 'jpg'
    const id = uuidv4()
    const originalName = `${id}_orig.${fileExt}`
    const originalPath = path.join(UPLOAD_DIR, originalName)

    await fs.writeFile(originalPath, req.file.buffer)

    const converted = await convertHighQuality(req.file.buffer)
    let jpgUrl: string | undefined
    let webpUrl: string | undefined
    if (converted) {
      const jpgName = `${id}.jpg`
      const webpName = `${id}.webp`
      await fs.writeFile(path.join(UPLOAD_DIR, jpgName), converted.jpg)
      await fs.writeFile(path.join(UPLOAD_DIR, webpName), converted.webp)
      jpgUrl = `${process.env.SERVER_DOMAIN}/upload/${jpgName}`
      webpUrl = `${process.env.SERVER_DOMAIN}/upload/${webpName}`
    }

    const imageUrl = `${process.env.SERVER_DOMAIN}/upload/${originalName}`

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
        jpg: jpgUrl,
        webp: webpUrl,
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
