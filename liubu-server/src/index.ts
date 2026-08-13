import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import uploadRoute from './routes/upload'
import tagRoute from './routes/tags'
import recordRoute from './routes/records'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, '../public')))
app.use(uploadRoute)
app.use(tagRoute)
app.use(recordRoute)

app.listen(PORT, () => {
  console.log(`留步后端服务已启动，运行地址：${process.env.SERVER_DOMAIN}`)
})
