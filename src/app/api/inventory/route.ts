import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all pending and ordered orders
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'ORDERED'] },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Calculate demand per product, size and color
    const inventory: Record<string, {
      productId: string
      productName: string
      variants: Record<string, { size: string; color: string; quantity: number }>
    }> = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId
        const size = item.size
        const color = item.color || 'N/A'
        const quantity = item.quantity
        const variantKey = `${size}-${color}`

        if (!inventory[productId]) {
          inventory[productId] = {
            productId,
            productName: item.product.name,
            variants: {},
          }
        }

        if (!inventory[productId].variants[variantKey]) {
          inventory[productId].variants[variantKey] = { size, color, quantity: 0 }
        }

        inventory[productId].variants[variantKey].quantity += quantity
      })
    })

    // Convert to array format
    const inventoryArray = Object.values(inventory).map((item) => ({
      ...item,
      variants: Object.values(item.variants),
      totalQuantity: Object.values(item.variants).reduce((a, b) => a + b.quantity, 0),
    }))

    return NextResponse.json({
      inventory: inventoryArray,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      orderedFromSupplier: orders.filter(o => o.status === 'ORDERED').length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}
