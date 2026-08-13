import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const hasDatabase = Boolean(process.env.DB_HOST && process.env.DB_DATABASE && process.env.DB_USER)

const pool = hasDatabase
  ? mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      connectionLimit: 10,
      waitForConnections: true,
    })
  : null

export default pool
