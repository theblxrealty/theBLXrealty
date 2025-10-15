import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple JWT verification for middleware (no Prisma dependency)
function verifyTokenSimple(token: string) {
  try {
    // Basic JWT structure validation without crypto verification
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    // Decode payload (base64)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    
    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname === '/addprop' || pathname === '/admin-blogs/add' || pathname === '/admin-properties' || pathname === '/admin-blogs') {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const decoded = verifyTokenSimple(token)
    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin') || pathname === '/api/addprop') {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyTokenSimple(token)
    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/addprop',
    '/admin-blogs/add',
    '/admin-properties',
    '/admin-blogs',
    '/api/addprop'
  ]
} 