import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    
    let where = {}
    
    if (statusParam) {
      const statuses = statusParam.split(',') as OrderStatus[]
      where = { status: { in: statuses } }
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { include: { colors: true } } } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Fetch orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', details: 'No session or user ID' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      schoolName,
      items,
      totalAmount,
      isPaid,
      notes,
    } = body

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        schoolName,
        totalAmount: parseFloat(totalAmount),
        isPaid: isPaid || false,
        notes,
        status: OrderStatus.PENDING,
        createdBy: session.user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            size: item.size,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: (error as Error).message },
      { status: 500 }
    )
  }
}
