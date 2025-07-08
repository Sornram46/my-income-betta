import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function middleware(request: NextRequest) {
  // Protected routes
  const protectedPaths = ['/']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname === path)

  if (isProtectedPath) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect to home if already logged in and trying to access login
  if (request.nextUrl.pathname === '/login') {
    const token = request.cookies.get('auth-token')?.value
    
    if (token) {
      try {
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL('/', request.url))
      } catch (error) {
        // Token invalid, continue to login
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login']
}