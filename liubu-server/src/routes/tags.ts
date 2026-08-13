import { Router } from 'express'
import { createTag, listTags, updateTag } from '../controller/tagController'

const router = Router()

router.get('/api/tags', listTags)
router.post('/api/tags', createTag)
router.patch('/api/tags/:id', updateTag)

export default router
