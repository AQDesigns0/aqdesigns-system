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
  Truck,
  Search,
  Download,
  FileText,
  Package,
  Filter,
  Printer,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderItem {
  id: string
  productId: string
  product: { 
    name: string
    price: number
    colors: { name: string }[]
  }
  size: string
  color: string
  quantity: number
  price: number
}

interface Order {
  id: string
  customerName: string
  schoolName: string
  totalAmount: number
  status: 'PENDING' | 'ORDERED' | 'READY' | 'DELIVERED'
  notes: string
  createdAt: string
  items: OrderItem[]
}

interface SupplierItem {
  productName: string
  size: string
  color: string
  quantity: number
  customerName: string
  schoolName: string
  orderId: string
  orderDate: string
}

export default function SupplierOrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const [colorFilter, setColorFilter] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=ORDERED,PENDING')
      if (response.ok) {
        const data = await response.json()
        // Only show orders that need to be ordered from supplier
        setOrders(data.filter((o: Order) => o.status === 'ORDERED' || o.status === 'PENDING'))
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Extract all unique products, sizes, colors from orders
  const { allProducts, allSizes, allColors } = useMemo(() => {
    const products = new Set<string>()
    const sizes = new Set<string>()
    const colors = new Set<string>()
    
    orders.forEach(order => {
      order.items.forEach(item => {
        products.add(item.product.name)
        sizes.add(item.size)
        if (item.color) colors.add(item.color)
        // Also add colors from product definition
        item.product.colors?.forEach(c => colors.add(c.name))
      })
    })
    
    return {
      allProducts: Array.from(products).sort(),
      allSizes: Array.from(sizes).sort(),
      allColors: Array.from(colors).sort()
    }
  }, [orders])

  // Group items by product, size, color for supplier view
  const supplierItems: SupplierItem[] = useMemo(() => {
    const items: SupplierItem[] = []
    
    orders.forEach(order => {
      order.items.forEach(item => {
        // Get color from item or from product colors
        const itemColor = item.color || item.product.colors?.[0]?.name || 'Default'
        
        items.push({
          productName: item.product.name,
          size: item.size,
          color: itemColor,
          quantity: item.quantity,
          customerName: order.customerName,
          schoolName: order.schoolName,
          orderId: order.id,
          orderDate: order.createdAt,
        })
      })
    })
    
    return items
  }, [orders])

  // Filter supplier items
  const filteredItems = useMemo(() => {
    return supplierItems.filter(item => {
      const matchesSearch = 
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesProduct = !productFilter || item.productName === productFilter
      const matchesSize = !sizeFilter || item.size === sizeFilter
      const matchesColor = !colorFilter || item.color === colorFilter
      
      return matchesSearch && matchesProduct && matchesSize && matchesColor
    })
  }, [supplierItems, searchQuery, productFilter, sizeFilter, colorFilter])

  // Group by product for summary view
  const productSummary = useMemo(() => {
    const summary: Record<string, { 
      productName: string
      totalQuantity: number
      bySizeColor: Record<string, number>
    }> = {}
    
    filteredItems.forEach(item => {
      if (!summary[item.productName]) {
        summary[item.productName] = {
          productName: item.productName,
          totalQuantity: 0,
          bySizeColor: {}
        }
      }
      
      summary[item.productName].totalQuantity += item.quantity
      const key = `${item.size} / ${item.color}`
      summary[item.productName].bySizeColor[key] = (summary[item.productName].bySizeColor[key] || 0) + item.quantity
    })
    
    return Object.values(summary).sort((a, b) => b.totalQuantity - a.totalQuantity)
  }, [filteredItems])

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(18)
      doc.text('Supplier Order List', 14, 20)
      
      // Date
      doc.setFontSize(11)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
      doc.text(`Total Items: ${filteredItems.length}`, 14, 38)
      
      let y = 50
      
      // Product Summary
      doc.setFontSize(14)
      doc.text('Summary by Product', 14, y)
      y += 10
      
      doc.setFontSize(10)
      productSummary.forEach((product, index) => {
        if (y > 250) {
          doc.addPage()
          y = 20
        }
        
        doc.setFont(undefined, 'bold')
        doc.text(`${product.productName} (Total: ${product.totalQuantity})`, 14, y)
        y += 6
        
        doc.setFont(undefined, 'normal')
        Object.entries(product.bySizeColor).forEach(([sizeColor, qty]) => {
          doc.text(`  - ${sizeColor}: ${qty} pcs`, 20, y)
          y += 5
        })
        
        y += 4
      })
      
      // Detailed List
      doc.addPage()
      y = 20
      
      doc.setFontSize(14)
      doc.text('Detailed Order List', 14, y)
      y += 10
      
      doc.setFontSize(9)
      filteredItems.forEach((item, index) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        
        const line = `${index + 1}. ${item.productName} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity} | Customer: ${item.customerName}${item.schoolName ? ` (${item.schoolName})` : ''}`
        const splitText = doc.splitTextToSize(line, 180)
        doc.text(splitText, 14, y)
        y += splitText.length * 4 + 2
      })
      
      doc.save(`supplier-orders-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF')
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
              <h1 className="text-3xl font-bold text-gradient">Supplier Orders</h1>
              <p className="text-muted-foreground">
                What to order from suppliers - filtered by product, size, color
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={generatePDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{filteredItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-violet-500/20">
                    <Truck className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">{productSummary.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Quantity</p>
                    <p className="text-2xl font-bold">
                      {filteredItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Printer className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customer, school..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-900 border border-white/10 text-white"
                  style={{ backgroundColor: '#1f2937', color: 'white' }}
                >
                  <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Products</option>
                  {allProducts.map(p => (
                    <option key={p} value={p} style={{ backgroundColor: '#1f2937', color: 'white' }}>{p}</option>
                  ))}
                </select>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-900 border border-white/10 text-white"
                  style={{ backgroundColor: '#1f2937', color: 'white' }}
                >
                  <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Sizes</option>
                  {allSizes.map(s => (
                    <option key={s} value={s} style={{ backgroundColor: '#1f2937', color: 'white' }}>{s}</option>
                  ))}
                </select>
                <select
                  value={colorFilter}
                  onChange={(e) => setColorFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-900 border border-white/10 text-white"
                  style={{ backgroundColor: '#1f2937', color: 'white' }}
                >
                  <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Colors</option>
                  {allColors.map(c => (
                    <option key={c} value={c} style={{ backgroundColor: '#1f2937', color: 'white' }}>{c}</option>
                  ))}
                </select>
              </div>
              {(productFilter || sizeFilter || colorFilter || searchQuery) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setProductFilter('')
                    setSizeFilter('')
                    setColorFilter('')
                    setSearchQuery('')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Product Summary */}
          {productSummary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Summary by Product</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Size / Color Breakdown</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-muted-foreground">Total Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productSummary.map((product, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="py-3 px-6 font-medium">{product.productName}</td>
                          <td className="py-3 px-6">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(product.bySizeColor).map(([sizeColor, qty]) => (
                                <Badge key={sizeColor} variant="outline" className="text-xs">
                                  {sizeColor}: {qty}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <span className="text-lg font-bold text-violet-400">
                              {product.totalQuantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed List */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Order List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">#</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Size</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Color</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Qty</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">School</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Order Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No orders found. Adjust filters or check orders page.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 text-muted-foreground">{index + 1}</td>
                          <td className="py-4 px-6 font-medium">{item.productName}</td>
                          <td className="py-4 px-6">{item.size}</td>
                          <td className="py-4 px-6">
                            <Badge variant="secondary" className="text-xs">
                              {item.color}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 font-bold">{item.quantity}</td>
                          <td className="py-4 px-6">{item.customerName}</td>
                          <td className="py-4 px-6 text-muted-foreground">{item.schoolName || '-'}</td>
                          <td className="py-4 px-6 text-muted-foreground text-sm">
                            {formatDate(item.orderDate)}
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
