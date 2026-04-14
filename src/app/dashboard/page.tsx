'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Order {
  id: string
  customerName: string
  schoolName: string
  totalAmount: number
  status: string
  isPaid: boolean
  createdAt: string
}

interface Product {
  id: string
  name: string
  price: number
  isActive: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate real stats
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const activeProducts = products.filter(p => p.isActive).length
  const paidOrders = orders.filter(o => o.isPaid).length
  const unpaidRevenue = orders.filter(o => !o.isPaid).reduce((sum, o) => sum + o.totalAmount, 0)

  // Recent orders (last 5)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: `${pendingOrders} pending`,
      icon: ShoppingCart,
      trend: totalOrders > 0 ? 'up' : 'neutral',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: `${formatCurrency(unpaidRevenue)} unpaid`,
      icon: DollarSign,
      trend: totalRevenue > 0 ? 'up' : 'neutral',
    },
    {
      title: 'Products',
      value: activeProducts.toString(),
      change: `${products.length - activeProducts} inactive`,
      icon: Package,
      trend: 'neutral',
    },
    {
      title: 'Paid Orders',
      value: paidOrders.toString(),
      change: `${totalOrders - paidOrders} unpaid`,
      icon: CheckCircle,
      trend: 'up',
    },
  ]

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:ml-64 p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gradient">
              Welcome back, {session.user.name}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="gradient-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-violet-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="/orders" className="group">
              <Card className="gradient-border hover:bg-white/5 transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">New Order</p>
                    <p className="text-sm text-muted-foreground">Create a customer order</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-violet-400" />
                </CardContent>
              </Card>
            </a>

            <a href="/products" className="group">
              <Card className="gradient-border hover:bg-white/5 transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">Products</p>
                    <p className="text-sm text-muted-foreground">Manage inventory</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-violet-400" />
                </CardContent>
              </Card>
            </a>

            <a href="/reports" className="group">
              <Card className="gradient-border hover:bg-white/5 transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Reports</p>
                    <p className="text-sm text-muted-foreground">View analytics</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-violet-400" />
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet. Create your first order!</p>
                  <a 
                    href="/orders" 
                    className="text-violet-400 hover:underline mt-2 inline-block"
                  >
                    Go to Orders →
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">School</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-medium">{order.customerName}</td>
                          <td className="py-3 px-4 text-muted-foreground">{order.schoolName || '-'}</td>
                          <td className="py-3 px-4">
                            <Badge variant={order.isPaid ? 'secondary' : 'outline'}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(order.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
