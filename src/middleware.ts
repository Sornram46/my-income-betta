import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30')

export async function middleware(request: NextRequest) {
  // ปกป้องเฉพาะหน้าอื่น (ตัวอย่าง: /income, /betta-breeders, /smart-farm)
  const protectedPaths = ['/income', '/betta-breeders', '/smart-farm']
  const isProtectedPath = protectedPaths.includes(request.nextUrl.pathname)

  if (isProtectedPath) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ถ้ามี token แล้วไปหน้า login ให้เด้งกลับหน้าแรก
  if (request.nextUrl.pathname === '/login') {
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      try {
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL('/', request.url))
      } catch {}
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}