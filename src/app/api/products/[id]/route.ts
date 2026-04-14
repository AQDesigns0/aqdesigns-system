import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// PATCH - Update product
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, sizes, colors, imageUrl, isActive } = body

    // Delete existing sizes and colors if new ones provided
    if (sizes) {
      await prisma.size.deleteMany({ where: { productId: params.id } })
    }
    if (colors) {
      await prisma.color.deleteMany({ where: { productId: params.id } })
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        category,
        imageUrl,
        isActive,
        sizes: sizes ? {
          create: sizes.map((size: string) => ({
            name: size,
            type: isNaN(parseInt(size)) ? 'alpha' : 'numeric',
          })),
        } : undefined,
        colors: colors ? {
          create: colors.map((color: string) => ({
            name: color,
          })),
        } : undefined,
      },
      include: { sizes: true, colors: true },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE - Delete or archive product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product has orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: params.id }
    })

    if (orderItems) {
      // Product has orders - archive it instead of deleting
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false }
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Product archived (has existing orders)' 
      })
    }

    // No orders - safe to delete
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
