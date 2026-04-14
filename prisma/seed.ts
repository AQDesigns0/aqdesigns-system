import { PrismaClient, UserRole, OrderStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data (ignore errors if tables don't exist)
  try {
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.size.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()
  } catch (e) {
    // Tables may not exist yet, that's ok
    console.log('Note: Some tables may not exist yet')
  }

  console.log('Creating admin user...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aqdesigns.com',
      name: 'Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  console.log('Creating staff user...')
  const staffPassword = await bcrypt.hash('mariam123', 10)
  const staff = await prisma.user.create({
    data: {
      email: 'mariam@aqdesigns.com',
      name: 'Mariam',
      password: staffPassword,
      role: UserRole.STAFF,
    },
  })

  console.log('Creating sample products...')
  const shirt = await prisma.product.create({
    data: {
      name: 'School Shirt',
      description: 'Premium cotton school shirt with logo',
      price: 250,
      category: 'Uniform',
      sizes: {
        create: [
          { name: 'S', type: 'alpha' },
          { name: 'M', type: 'alpha' },
          { name: 'L', type: 'alpha' },
          { name: 'XL', type: 'alpha' },
          { name: '2XL', type: 'alpha' },
        ],
      },
    },
  })

  const cardigan = await prisma.product.create({
    data: {
      name: 'School Cardigan',
      description: 'Warm cardigan with school emblem',
      price: 450,
      category: 'Uniform',
      sizes: {
        create: [
          { name: 'S', type: 'alpha' },
          { name: 'M', type: 'alpha' },
          { name: 'L', type: 'alpha' },
          { name: 'XL', type: 'alpha' },
        ],
      },
    },
  })

  const blazer = await prisma.product.create({
    data: {
      name: 'School Blazer',
      description: 'Formal blazer with embroidered badge',
      price: 650,
      category: 'Uniform',
      sizes: {
        create: [
          { name: '28', type: 'numeric' },
          { name: '30', type: 'numeric' },
          { name: '32', type: 'numeric' },
          { name: '34', type: 'numeric' },
          { name: '36', type: 'numeric' },
          { name: '38', type: 'numeric' },
        ],
      },
    },
  })

  const trousers = await prisma.product.create({
    data: {
      name: 'School Trousers',
      description: 'Classic fit school trousers',
      price: 350,
      category: 'Uniform',
      sizes: {
        create: [
          { name: '28', type: 'numeric' },
          { name: '30', type: 'numeric' },
          { name: '32', type: 'numeric' },
          { name: '34', type: 'numeric' },
          { name: '36', type: 'numeric' },
          { name: '38', type: 'numeric' },
        ],
      },
    },
  })

  console.log('Creating sample orders...')
  const order1 = await prisma.order.create({
    data: {
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '0712345678',
      schoolName: 'Greenfield Academy',
      totalAmount: 1950,
      isPaid: true,
      status: OrderStatus.PENDING,
      createdBy: admin.id,
      items: {
        create: [
          { productId: shirt.id, size: 'M', quantity: 2, price: 250 },
          { productId: cardigan.id, size: 'L', quantity: 1, price: 450 },
          { productId: blazer.id, size: '34', quantity: 1, price: 650 },
          { productId: trousers.id, size: '34', quantity: 2, price: 350 },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      customerPhone: '0723456789',
      schoolName: 'Greenfield Academy',
      totalAmount: 1300,
      isPaid: false,
      status: OrderStatus.PENDING,
      createdBy: staff.id,
      items: {
        create: [
          { productId: shirt.id, size: 'S', quantity: 2, price: 250 },
          { productId: cardigan.id, size: 'S', quantity: 1, price: 450 },
          { productId: trousers.id, size: '28', quantity: 1, price: 350 },
        ],
      },
    },
  })

  const order3 = await prisma.order.create({
    data: {
      customerName: 'Michael Brown',
      customerEmail: 'michael@example.com',
      customerPhone: '0734567890',
      schoolName: 'St. Mary\'s School',
      totalAmount: 2850,
      isPaid: true,
      status: OrderStatus.ORDERED,
      createdBy: admin.id,
      items: {
        create: [
          { productId: shirt.id, size: 'XL', quantity: 3, price: 250 },
          { productId: cardigan.id, size: 'XL', quantity: 2, price: 450 },
          { productId: blazer.id, size: '38', quantity: 1, price: 650 },
          { productId: trousers.id, size: '38', quantity: 2, price: 350 },
        ],
      },
    },
  })

  console.log('Seed completed successfully!')
  console.log('\nDefault Login Credentials:')
  console.log('Admin: admin@aqdesigns.com / admin123')
  console.log('Mariam: mariam@aqdesigns.com / mariam123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
