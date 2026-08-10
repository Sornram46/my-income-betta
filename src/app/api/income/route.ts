import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import pool from '@/lib/db'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30')

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('💰 POST /api/income called')

    // ตรวจสอบ authentication
    const user = await getUserFromToken(req)
    if (!user) {
      console.log('❌ No valid token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', { userId: user.userId, username: user.username })

    const { date, description, amount } = await req.json()
    console.log('📝 Received data:', { date, description, amount })
    
    if (!date || !amount) {
      return NextResponse.json(
        { error: 'Date and amount are required' },
        { status: 400 }
      )
    }

    // INSERT พร้อม user_id (4 parameters)
    const result = await pool.query(
      'INSERT INTO income (date, description, amount, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, description || '', parseFloat(amount), user.userId]
    )
    
    console.log('✅ Income inserted:', result.rows[0])
    return NextResponse.json(result.rows[0])

  } catch (error) {
    console.error('❌ POST /api/income error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('📊 GET /api/income called')

    // ตรวจสอบ authentication
    const user = await getUserFromToken(req)
    if (!user) {
      console.log('❌ No valid token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!month && !year) {
      return NextResponse.json(
        { error: 'Month or year parameter is required' },
        { status: 400 }
      )
    }

    if (year) {
      console.log('🗓️ Fetching yearly income summary for:', { userId: user.userId, year })

      const result = await pool.query(
        `SELECT to_char(date, 'YYYY-MM') AS month, SUM(amount) AS total
         FROM income
         WHERE user_id = $1 AND to_char(date, 'YYYY') = $2
         GROUP BY 1
         ORDER BY 1 ASC`,
        [user.userId, year]
      )

      console.log('✅ Yearly income summary found:', result.rows.length, 'months')
      return NextResponse.json(result.rows)
    }
    
    console.log('🗓️ Fetching income for:', { userId: user.userId, month })

    // SELECT เฉพาะข้อมูลของ user ที่ login
    const result = await pool.query(
      `SELECT * FROM income 
       WHERE user_id = $1 AND to_char(date, 'YYYY-MM') = $2 
       ORDER BY date DESC`,
      [user.userId, month]
    )
    
    console.log('✅ Income data found:', result.rows.length, 'records')
    return NextResponse.json(result.rows)

  } catch (error) {
    console.error('❌ GET /api/income error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
