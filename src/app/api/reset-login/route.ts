import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    const email = 'admin@aqdesigns.com'
    const password = 'admin123'
    const hashedPassword = await hash(password, 10)

    // Try to find existing user
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      // Update password
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset!',
        email,
        password
      })
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email,
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
      return NextResponse.json({ 
        success: true, 
        message: 'User created!',
        email,
        password
      })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
