import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() as current_time')
    return NextResponse.json({ 
      success: true, 
      time: result.rows[0] 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
    })
  }
}