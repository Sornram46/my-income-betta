import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Import แบบ dynamic เพื่อหลีกเลี่ยง error
let bcrypt: any
let SignJWT: any

try {
  bcrypt = require('bcryptjs')
  const jose = require('jose')
  SignJWT = jose.SignJWT
} catch (error) {
  console.error('Import error:', error)
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Login API called')

    // ตรวจสอบ dependencies
    if (!bcrypt || !SignJWT) {
      console.error('❌ Missing dependencies: bcrypt or jose')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const { username, password } = await req.json()
    console.log('📝 Received data:', { username, hasPassword: !!password })

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // ทดสอบ database connection
    console.log('🗄️ Testing database connection...')
    const testResult = await pool.query('SELECT NOW()')
    console.log('✅ Database connected:', testResult.rows[0])

    // หา user
    console.log('👤 Looking for user:', username)
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    )

    console.log('🔍 Query result:', {
      rowCount: result.rows.length,
      hasUser: result.rows.length > 0
    })

    if (result.rows.length === 0) {
      console.log('❌ User not found')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = result.rows[0]
    console.log('👤 User found:', { 
      id: user.id, 
      username: user.username,
      hasPasswordHash: !!user.password_hash,
      hashLength: user.password_hash?.length
    })

    // ตรวจสอบรหัสผ่าน
    console.log('🔐 Checking password...')
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log('✅ Password check result:', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // สร้าง JWT token
    console.log('🎫 Creating JWT token...')
    const token = await new SignJWT({ 
      userId: user.id, 
      username: user.username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)

    console.log('✅ Token created successfully')

    // Response
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/'
    })

    console.log('🎉 Login successful for user:', username)
    return response

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Login error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    } else {
      console.error('❌ Login error details:', error)
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 })
  }
}