import { Router } from 'express'
import { listCalendar, saveRecord } from '../controller/recordController'

const router = Router()

router.post('/api/records', saveRecord)
router.get('/api/calendar', listCalendar)

export default router
