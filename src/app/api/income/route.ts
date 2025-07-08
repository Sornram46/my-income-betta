import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { date, description, amount } = await req.json()
    
    // Validate input
    if (!date || !amount) {
      return NextResponse.json(
        { error: 'Date and amount are required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'INSERT INTO income (date, description, amount, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, description || '', parseFloat(amount)]
    )
    
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('POST /api/income error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // e.g., "2025-07"
    
    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter is required' }, 
        { status: 400 }
      )
    }

    const result = await pool.query(
      `SELECT * FROM income WHERE to_char(date, 'YYYY-MM') = $1 ORDER BY date DESC`,
      [month]
    )
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('GET /api/income error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
