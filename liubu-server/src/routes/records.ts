import { Router } from 'express'
import { saveRecord } from '../controller/recordController'

const router = Router()

router.post('/api/records', saveRecord)

export default router
