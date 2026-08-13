import { Router } from 'express'
import multer from 'multer'
import { uploadImage } from '../controller/uploadController'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png)/.test(file.mimetype) || /\.(jpe?g|png)$/i.test(file.originalname)
    cb(null, ok)
  },
})

router.post('/api/upload', upload.single('file'), uploadImage)

export default router
