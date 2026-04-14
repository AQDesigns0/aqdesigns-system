'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Banknote,
  ArrowRightLeft,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Order {
  id: string
  customerName: string
  totalAmount: number
  isPaid: boolean
  paymentMethod?: 'CASH' | 'CARD' | 'EFT'
  discountAmount?: number
  status: string
  createdAt: string
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchOrders()
  }, [dateRange])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= dateRange.from && orderDate <= dateRange.to
  })

  // Calculate statistics
  const stats = {
    totalSales: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    totalOrders: filteredOrders.length,
    paidOrders: filteredOrders.filter(o => o.isPaid).length,
    unpaidOrders: filteredOrders.filter(o => !o.isPaid).length,
    cashSales: filteredOrders.filter(o => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.totalAmount, 0),
    cardSales: filteredOrders.filter(o => o.paymentMethod === 'CARD').reduce((sum, o) => sum + o.totalAmount, 0),
    eftSales: filteredOrders.filter(o => o.paymentMethod === 'EFT').reduce((sum, o) => sum + o.totalAmount, 0),
    totalDiscounts: filteredOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0),
    averageOrderValue: filteredOrders.length > 0 
      ? filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0) / filteredOrders.length 
      : 0,
  }

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      const config = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('aq-business-config') || '{}')
        : {}

      let y = 20
      doc.setFontSize(20)
      doc.text(config.name || 'AQ Designs', 105, y, { align: 'center' })
      y += 10
      
      doc.setFontSize(14)
      doc.text('Sales Report', 105, y, { align: 'center' })
      y += 10
      
      doc.setFontSize(10)
      doc.text(`Period: ${dateRange.from} to ${dateRange.to}`, 105, y, { align: 'center' })
      y += 20

      // Summary
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text('Summary', 20, y)
      y += 10
      
      doc.setFont(undefined, 'normal')
      doc.setFontSize(10)
      doc.text(`Total Sales: ${formatCurrency(stats.totalSales)}`, 20, y)
      y += 7
      doc.text(`Total Orders: ${stats.totalOrders}`, 20, y)
      y += 7
      doc.text(`Average Order Value: ${formatCurrency(stats.averageOrderValue)}`, 20, y)
      y += 7
      doc.text(`Paid Orders: ${stats.paidOrders}`, 20, y)
      y += 7
      doc.text(`Unpaid Orders: ${stats.unpaidOrders}`, 20, y)
      y += 15

      // Payment Methods
      doc.setFont(undefined, 'bold')
      doc.setFontSize(12)
      doc.text('Payment Methods', 20, y)
      y += 10
      
      doc.setFont(undefined, 'normal')
      doc.setFontSize(10)
      doc.text(`Cash: ${formatCurrency(stats.cashSales)}`, 20, y)
      y += 7
      doc.text(`Card: ${formatCurrency(stats.cardSales)}`, 20, y)
      y += 7
      doc.text(`EFT: ${formatCurrency(stats.eftSales)}`, 20, y)
      y += 15

      // Orders List
      if (filteredOrders.length > 0) {
        doc.addPage()
        y = 20
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('Order Details', 20, y)
        y += 10

        // Table header
        doc.setFillColor(240, 240, 240)
        doc.rect(20, y - 5, 170, 8, 'F')
        doc.setFontSize(9)
        doc.text('Date', 22, y)
        doc.text('Customer', 55, y)
        doc.text('Status', 100, y)
        doc.text('Payment', 130, y)
        doc.text('Amount', 165, y)
        y += 10

        doc.setFont(undefined, 'normal')
        filteredOrders.forEach(order => {
          if (y > 280) {
            doc.addPage()
            y = 20
          }
          doc.text(formatDate(order.createdAt), 22, y)
          doc.text(order.customerName.substring(0, 20), 55, y)
          doc.text(order.status, 100, y)
          doc.text(order.paymentMethod || '-', 130, y)
          doc.text(formatCurrency(order.totalAmount), 165, y)
          y += 7
        })
      }

      doc.save(`sales-report-${dateRange.from}-to-${dateRange.to}.pdf`)
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to export PDF')
    }
  }

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
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Daily Sales Report</h1>
              <p className="text-muted-foreground">
                View and export sales analytics
              </p>
            </div>
            <Button variant="neon" onClick={exportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {/* Date Range */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Order</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-500/20">
                    <BarChart3 className="w-6 h-6 text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Discounts</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      -{formatCurrency(stats.totalDiscounts)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/20">
                    <TrendingDown className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cash</p>
                      <p className="text-xl font-bold">{formatCurrency(stats.cashSales)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Card</p>
                      <p className="text-xl font-bold">{formatCurrency(stats.cardSales)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/30">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="w-8 h-8 text-violet-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">EFT</p>
                      <p className="text-xl font-bold">{formatCurrency(stats.eftSales)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Payment</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No orders found for this date range
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-4 px-6 font-medium">
                            {order.customerName}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={order.isPaid ? "secondary" : "outline"}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            {order.paymentMethod ? (
                              <Badge variant="outline">{order.paymentMethod}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right font-medium">
                            {formatCurrency(order.totalAmount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
