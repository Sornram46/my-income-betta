// lib/db.ts
import { Pool } from 'pg'

console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
})

// ทดสอบการเชื่อมต่อ
pool.on('connect', () => {
  console.log('✅ Connected to Neon Database')
})

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message)
})

// ทดสอบ query แรก
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ First query failed:', err.message)
  } else {
    console.log('✅ First query success:', result.rows[0])
  }
})

export default pool
