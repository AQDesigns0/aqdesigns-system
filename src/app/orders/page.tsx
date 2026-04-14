'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Filter,
  ShoppingCart,
  ChevronDown,
  X,
  Check,
  Trash2,
  Edit,
  Printer,
  Receipt,
  Users,
  TrendingUp,
  AlertTriangle,
  Upload,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  schoolName: string
  totalAmount: number
  isPaid: boolean
  status: 'PENDING' | 'ORDERED' | 'READY' | 'DELIVERED'
  notes: string
  createdAt: string
  discountAmount?: number
  discountPercent?: number
  paymentMethod?: 'CASH' | 'CARD' | 'EFT'
  items: {
    id: string
    productId: string
    product: { name: string; price: number }
    size: string
    quantity: number
    price: number
  }[]
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'pending' },
  { value: 'ORDERED', label: 'Ordered from Supplier', color: 'ordered' },
  { value: 'READY', label: 'Ready for Pickup', color: 'ready' },
  { value: 'DELIVERED', label: 'Delivered', color: 'delivered' },
]

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const togglePaymentStatus = async (orderId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !currentStatus }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update payment status:', error)
    }
  }

  const printReceipt = async (order: Order) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Thermal receipt size
      })

      // Get business config
      const config = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('aq-business-config') || '{}')
        : {}

      let y = 10
      const centerX = 40

      // Business Name
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.text(config.name || 'AQ Designs', centerX, y, { align: 'center' })
      y += 8

      // Receipt title
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.text('SALES RECEIPT', centerX, y, { align: 'center' })
      y += 6

      // Receipt info
      doc.setFontSize(8)
      doc.text(`Receipt #: ${order.id.slice(-8).toUpperCase()}`, 5, y)
      y += 4
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 5, y)
      y += 4
      doc.text(`Status: ${order.isPaid ? 'PAID' : 'UNPAID'}`, 5, y)
      y += 8

      // Separator
      doc.text('='.repeat(38), 5, y)
      y += 6

      // Customer info
      doc.text(`Customer: ${order.customerName}`, 5, y)
      y += 4
      if (order.schoolName) {
        doc.text(`School: ${order.schoolName}`, 5, y)
        y += 4
      }
      y += 4

      // Items header
      doc.text('ITEMS:', 5, y)
      y += 6

      // Items
      doc.setFontSize(7)
      order.items.forEach((item) => {
        const itemName = item.product.name.substring(0, 20)
        doc.text(`${itemName} (${item.size})`, 5, y)
        y += 3
        doc.text(`  ${item.quantity} x ${formatCurrency(item.price)}`, 5, y)
        doc.text(formatCurrency(item.quantity * item.price), 75, y, { align: 'right' })
        y += 4
      })

      // Separator
      doc.setFontSize(8)
      doc.text('-'.repeat(38), 5, y)
      y += 6

      // Total
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.text('TOTAL:', 5, y)
      doc.text(formatCurrency(order.totalAmount), 75, y, { align: 'right' })
      y += 10

      // Footer
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.text('Thank you for your business!', centerX, y, { align: 'center' })
      y += 5
      if (config.phone) {
        doc.text(`Tel: ${config.phone}`, centerX, y, { align: 'center' })
        y += 4
      }
      doc.text(config.email || '', centerX, y, { align: 'center' })

      doc.save(`receipt-${order.id.slice(-8)}.pdf`)
    } catch (error) {
      console.error('Failed to print receipt:', error)
      alert('Failed to print receipt')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchOrders()
      } else {
        const error = await response.json()
        alert('Failed to delete order: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
      alert('Failed to delete order')
    }
  }

  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customerName: order.customerName,
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || '',
      schoolName: order.schoolName || '',
      notes: order.notes || '',
      items: order.items.map(item => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return

    const totalAmount = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    try {
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount,
        }),
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setEditingOrder(null)
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          schoolName: '',
          notes: '',
          items: [{ productId: '', size: '', quantity: 1, price: 0 }],
        })
        fetchOrders()
      } else {
        const error = await response.json()
        alert('Failed to update order: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order')
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Form state for new order
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    schoolName: '',
    notes: '',
    items: [{ productId: '', size: '', quantity: 1, price: 0 }],
    discountPercent: 0,
    discountAmount: 0,
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'EFT',
  })

  const [products, setProducts] = useState<{id: string, name: string, price: number, sizes: {name: string}[]}[]>([])

  useEffect(() => {
    if (isModalOpen) {
      fetchProducts()
    }
  }, [isModalOpen])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Calculate discount
    let discountAmount = 0
    if (formData.discountPercent > 0) {
      discountAmount = (subtotal * formData.discountPercent) / 100
    } else if (formData.discountAmount > 0) {
      discountAmount = formData.discountAmount
    }
    
    const totalAmount = Math.max(0, subtotal - discountAmount)
    
    // Validate
    if (!formData.customerName) {
      alert('Please enter customer name')
      return
    }
    if (formData.items.some(item => !item.productId || !item.size)) {
      alert('Please select product and size for all items')
      return
    }
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount,
          status: 'PENDING',
          isPaid: false,
        }),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          schoolName: '',
          notes: '',
          items: [{ productId: '', size: '', quantity: 1, price: 0 }],
          discountPercent: 0,
          discountAmount: 0,
          paymentMethod: 'CASH',
        })
        fetchOrders()
      } else {
        const error = await response.json()
        alert('Failed to create order: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Failed to create order: ' + (error as Error).message)
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', size: '', quantity: 1, price: 0 }]
    })
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      })
    }
  }

  // Sales summary stats
  const salesStats = useMemo(() => {
    const total = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const paid = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalAmount, 0)
    const unpaid = total - paid
    const today = new Date().toDateString()
    const todaySales = orders
      .filter(o => new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + o.totalAmount, 0)
    
    return { total, paid, unpaid, todaySales, count: orders.length }
  }, [orders])

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index].price = product.price
      }
    }
    
    setFormData({ ...formData, items: newItems })
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
              <h1 className="text-3xl font-bold text-gradient">Orders</h1>
              <p className="text-muted-foreground">
                Manage customer orders and track status
              </p>
            </div>
            <Button 
              variant="neon" 
              onClick={() => {
                setFormData({
                  customerName: '',
                  customerEmail: '',
                  customerPhone: '',
                  schoolName: '',
                  notes: '',
                  items: [{ productId: '', size: '', quantity: 1, price: 0 }],
                })
                setIsModalOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>

          {/* Sales Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Today's Sales</p>
                <p className="text-2xl font-bold text-violet-400">{formatCurrency(salesStats.todaySales)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{salesStats.count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(salesStats.total)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(salesStats.paid)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(salesStats.unpaid)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm focus:ring-2 focus:ring-violet-500 text-white"
              style={{ backgroundColor: '#1f2937', color: 'white' }}
            >
              <option value="ALL" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        Order Details
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        School
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} items
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">
                          {order.schoolName || '-'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatCurrency(order.totalAmount)}
                            </span>
                            <button
                              onClick={() => togglePaymentStatus(order.id, order.isPaid)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                order.isPaid 
                                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              }`}
                              title={order.isPaid ? 'Click to mark as unpaid' : 'Click to mark as paid'}
                            >
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </button>
                            {order.paymentMethod && (
                              <Badge variant="outline" className="text-xs">
                                {order.paymentMethod}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={order.status.toLowerCase() as any}>
                            {statusOptions.find((s) => s.value === order.status)?.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground text-sm">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-gray-900 border border-white/10 text-sm focus:ring-2 focus:ring-violet-500 text-white"
                            style={{ backgroundColor: '#1f2937', color: 'white' }}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              style={{ position: 'relative', zIndex: 11 }}
                            >
                              <Edit className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => printReceipt(order)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              style={{ position: 'relative', zIndex: 11 }}
                              title="Print Receipt"
                            >
                              <Printer className="w-4 h-4 text-emerald-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              style={{ position: 'relative', zIndex: 11 }}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* New Order Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">New Order</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Customer Name</label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">School Name</label>
                      <Input
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        placeholder="School Name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="john@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="+27 12 345 6789"
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Order Items</label>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                        <div className="col-span-5">
                          <select
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                            style={{ backgroundColor: '#1f2937', color: 'white' }}
                            required
                          >
                            <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                                {product.name} - {formatCurrency(product.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <select
                            value={item.size}
                            onChange={(e) => updateItem(index, 'size', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                            style={{ backgroundColor: '#1f2937', color: 'white' }}
                            required
                          >
                            <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Size</option>
                            {products.find(p => p.id === item.productId)?.sizes.map((size) => (
                              <option key={size.name} value={size.name} style={{ backgroundColor: '#1f2937', color: 'white' }}>{size.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                            required
                          />
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <div className="flex-1 text-right py-2 text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            disabled={formData.items.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                      style={{ backgroundColor: '#1f2937', color: 'white' }}
                    />
                  </div>

                  {/* Discount & Payment Method */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Discount (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'CASH' | 'CARD' | 'EFT' })}
                        className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                        style={{ backgroundColor: '#1f2937', color: 'white' }}
                      >
                        <option value="CASH" style={{ backgroundColor: '#1f2937', color: 'white' }}>Cash</option>
                        <option value="CARD" style={{ backgroundColor: '#1f2937', color: 'white' }}>Card</option>
                        <option value="EFT" style={{ backgroundColor: '#1f2937', color: 'white' }}>EFT / Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  {/* Total with Discount */}
                  {(() => {
                    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    const discount = (subtotal * formData.discountPercent) / 100
                    const total = subtotal - discount
                    return (
                      <div className="py-4 border-t border-white/10 space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-sm text-emerald-400">
                            <span>Discount ({formData.discountPercent}%):</span>
                            <span>-{formatCurrency(discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-violet-400">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Submit */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="neon" className="flex-1">
                      Create Order
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Edit Order Modal */}
          {isEditModalOpen && editingOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Edit Order</h2>
                  <button
                    onClick={() => { setIsEditModalOpen(false); setEditingOrder(null); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateOrder} className="space-y-4">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Customer Name</label>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">School Name</label>
                      <Input
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        placeholder="School Name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="john@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="+27 12 345 6789"
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Order Items</label>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                        <div className="col-span-5">
                          <select
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                            style={{ backgroundColor: '#1f2937', color: 'white' }}
                            required
                          >
                            <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                                {product.name} - {formatCurrency(product.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <select
                            value={item.size}
                            onChange={(e) => updateItem(index, 'size', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                            style={{ backgroundColor: '#1f2937', color: 'white' }}
                            required
                          >
                            <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Size</option>
                            {products.find(p => p.id === item.productId)?.sizes.map((size) => (
                              <option key={size.name} value={size.name} style={{ backgroundColor: '#1f2937', color: 'white' }}>{size.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                            required
                          />
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <div className="flex-1 text-right py-2 text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            disabled={formData.items.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addItem}
                      className="w-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                      style={{ backgroundColor: '#1f2937', color: 'white' }}
                    />
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 border-t border-white/10">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-violet-400">
                      {formatCurrency(formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </span>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setIsEditModalOpen(false); setEditingOrder(null); }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="neon" className="flex-1">
                      Update Order
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
