import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

// PATCH - Update order
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, isPaid, customerName, customerEmail, customerPhone, schoolName, notes, items, totalAmount } = body

    // If only status is being updated
    if (status && !customerName) {
      const order = await prisma.order.update({
        where: { id: params.id },
        data: { status: status as OrderStatus },
      })
      return NextResponse.json(order)
    }

    // If only isPaid is being updated
    if (isPaid !== undefined && !customerName) {
      const order = await prisma.order.update({
        where: { id: params.id },
        data: { isPaid },
      })
      return NextResponse.json(order)
    }

    // Full order update
    if (items) {
      // Delete existing items
      await prisma.orderItem.deleteMany({
        where: { orderId: params.id }
      })

      // Update order with new data
      const order = await prisma.order.update({
        where: { id: params.id },
        data: {
          customerName,
          customerEmail,
          customerPhone,
          schoolName,
          notes,
          totalAmount,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          user: { select: { name: true, email: true } },
        },
      })

      return NextResponse.json(order)
    }

    // Partial update (no items)
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        customerName,
        customerEmail,
        customerPhone,
        schoolName,
        notes,
        totalAmount,
      },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Failed to update order', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Delete order
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId: params.id }
    })

    // Delete order
    await prisma.order.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete order', details: (error as Error).message },
      { status: 500 }
    )
  }
}
