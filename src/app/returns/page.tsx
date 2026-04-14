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
  RotateCcw,
  Search,
  Plus,
  X,
  Package,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReturnItem {
  id: string
  originalOrderId: string
  customerName: string
  productName: string
  size: string
  quantity: number
  reason: string
  type: 'RETURN' | 'EXCHANGE'
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED'
  refundAmount: number
  createdAt: string
  notes: string
}

export default function ReturnsPage() {
  const { data: session, status } = useSession()
  const [returns, setReturns] = useState<ReturnItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    originalOrderId: '',
    customerName: '',
    productName: '',
    size: '',
    quantity: 1,
    reason: '',
    type: 'RETURN' as 'RETURN' | 'EXCHANGE',
    refundAmount: 0,
    notes: '',
  })

  useEffect(() => {
    loadReturns()
  }, [])

  const loadReturns = () => {
    const saved = localStorage.getItem('aq-returns')
    if (saved) {
      setReturns(JSON.parse(saved))
    }
    setIsLoading(false)
  }

  const saveReturns = (updated: ReturnItem[]) => {
    localStorage.setItem('aq-returns', JSON.stringify(updated))
    setReturns(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newReturn: ReturnItem = {
      id: Date.now().toString(),
      originalOrderId: formData.originalOrderId,
      customerName: formData.customerName,
      productName: formData.productName,
      size: formData.size,
      quantity: formData.quantity,
      reason: formData.reason,
      type: formData.type,
      status: 'PENDING',
      refundAmount: formData.refundAmount,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    }

    saveReturns([...returns, newReturn])
    resetForm()
    setIsModalOpen(false)
  }

  const resetForm = () => {
    setFormData({
      originalOrderId: '',
      customerName: '',
      productName: '',
      size: '',
      quantity: 1,
      reason: '',
      type: 'RETURN',
      refundAmount: 0,
      notes: '',
    })
  }

  const updateStatus = (id: string, status: ReturnItem['status']) => {
    const updated = returns.map(r => r.id === id ? { ...r, status } : r)
    saveReturns(updated)
  }

  const filteredReturns = returns.filter(r =>
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.originalOrderId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'PENDING').length,
    completed: returns.filter(r => r.status === 'COMPLETED').length,
    totalRefunded: returns
      .filter(r => r.status === 'COMPLETED' && r.type === 'RETURN')
      .reduce((sum, r) => sum + r.refundAmount, 0),
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
              <h1 className="text-3xl font-bold text-gradient">Returns & Exchanges</h1>
              <p className="text-muted-foreground">
                Manage customer returns and exchanges
              </p>
            </div>
            <Button 
              variant="neon" 
              onClick={() => {
                resetForm()
                setIsModalOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Return/Exchange
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <RotateCcw className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Returns</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Refunded</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRefunded)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, product, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Returns Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Reason</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Refund</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturns.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No returns or exchanges found
                        </td>
                      </tr>
                    ) : (
                      filteredReturns.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 text-sm text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium">{item.customerName}</p>
                            <p className="text-xs text-muted-foreground">Order: {item.originalOrderId.slice(-8)}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.size} x{item.quantity}</p>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={item.type === 'RETURN' ? 'secondary' : 'outline'}>
                              {item.type === 'RETURN' ? (
                                <RotateCcw className="w-3 h-3 mr-1" />
                              ) : (
                                <ArrowRightLeft className="w-3 h-3 mr-1" />
                              )}
                              {item.type}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            {item.reason}
                          </td>
                          <td className="py-4 px-6 font-medium">
                            {formatCurrency(item.refundAmount)}
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={item.status}
                              onChange={(e) => updateStatus(item.id, e.target.value as ReturnItem['status'])}
                              className="px-2 py-1 rounded bg-gray-900 border border-white/10 text-sm text-white"
                              style={{ backgroundColor: '#1f2937', color: 'white' }}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approved</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => {
                                if (confirm('Delete this record?')) {
                                  saveReturns(returns.filter(r => r.id !== item.id))
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Add Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background rounded-xl border border-white/10 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">New Return/Exchange</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Original Order ID *</label>
                    <Input
                      value={formData.originalOrderId}
                      onChange={(e) => setFormData({ ...formData, originalOrderId: e.target.value })}
                      placeholder="ORD-12345"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Customer Name *</label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Product Name *</label>
                    <Input
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="School Blazer"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Size *</label>
                      <Input
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        placeholder="M"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Quantity *</label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'RETURN' | 'EXCHANGE' })}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                      style={{ backgroundColor: '#1f2937', color: 'white' }}
                      required
                    >
                      <option value="RETURN">Return (Refund)</option>
                      <option value="EXCHANGE">Exchange (Swap)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Refund Amount</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.refundAmount}
                      onChange={(e) => setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Reason *</label>
                    <Input
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Wrong size / Defective / etc"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional information..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white"
                      style={{ backgroundColor: '#1f2937', color: 'white' }}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="neon" className="flex-1">
                      Create
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
