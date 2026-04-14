'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Package,
  AlertCircle,
  Download,
  Printer,
  Bell,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface InventoryItem {
  productId: string
  productName: string
  sizes: Record<string, number>
  totalQuantity: number
}

interface LowStockAlert {
  id: string
  productId: string
  productName: string
  size: string
  stockLevel: number
  minThreshold: number
  status: 'pending' | 'ordered'
  createdAt: string
}

interface InventoryData {
  inventory: InventoryItem[]
  totalOrders: number
  pendingOrders: number
  orderedFromSupplier: number
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const [inventory, setInventory] = useState<InventoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([])
  const [showAlerts, setShowAlerts] = useState(false)

  useEffect(() => {
    fetchInventory()
    loadLowStockAlerts()
  }, [])

  const loadLowStockAlerts = () => {
    const saved = localStorage.getItem('aq-low-stock-alerts')
    if (saved) {
      setLowStockAlerts(JSON.parse(saved))
    }
  }

  const saveLowStockAlerts = (alerts: LowStockAlert[]) => {
    localStorage.setItem('aq-low-stock-alerts', JSON.stringify(alerts))
    setLowStockAlerts(alerts)
  }

  const addLowStockAlert = (productId: string, productName: string, size: string, stockLevel: number) => {
    const threshold = Math.max(3, Math.ceil(stockLevel * 0.2)) // 20% or minimum 3
    const newAlert: LowStockAlert = {
      id: Date.now().toString(),
      productId,
      productName,
      size,
      stockLevel,
      minThreshold: threshold,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    saveLowStockAlerts([...lowStockAlerts, newAlert])
    setShowAlerts(true)
  }

  const markAlertOrdered = (alertId: string) => {
    const updated = lowStockAlerts.map(a =>
      a.id === alertId ? { ...a, status: 'ordered' as const } : a
    )
    saveLowStockAlerts(updated)
  }

  const dismissAlert = (alertId: string) => {
    const updated = lowStockAlerts.filter(a => a.id !== alertId)
    saveLowStockAlerts(updated)
  }

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const printInventory = () => {
    window.print()
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Inventory & Demand</h1>
              <p className="text-muted-foreground">
                What you need to buy based on pending orders
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={printInventory}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass glass-hover text-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            <Card className="gradient-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold">{inventory?.totalOrders || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold">{inventory?.pendingOrders || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ordered from Supplier</p>
                    <p className="text-2xl font-bold">{inventory?.orderedFromSupplier || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert Card */}
            <Card 
              className={`gradient-border cursor-pointer transition-all ${lowStockAlerts.filter(a => a.status === 'pending').length > 0 ? 'border-red-500/50' : ''}`}
              onClick={() => setShowAlerts(!showAlerts)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowStockAlerts.filter(a => a.status === 'pending').length > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                    <Bell className={`w-6 h-6 ${lowStockAlerts.filter(a => a.status === 'pending').length > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                    <p className="text-2xl font-bold">
                      {lowStockAlerts.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alerts Panel */}
          {showAlerts && (
            <Card className="border-red-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    Low Stock Alerts
                  </CardTitle>
                  <button onClick={() => setShowAlerts(false)} className="p-2 hover:bg-white/10 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {lowStockAlerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No low stock alerts. Click + in the table below to add alerts.</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockAlerts.map((alert) => (
                      <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${alert.status === 'ordered' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <div className="flex items-center gap-3">
                          {alert.status === 'ordered' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            <p className="font-medium">{alert.productName} - Size {alert.size}</p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {alert.stockLevel} (Min: {alert.minThreshold})
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {alert.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAlertOrdered(alert.id)}
                              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Ordered
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Demand Summary - What to Buy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        Product
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                        Variants (Size - Color)
                      </th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory?.inventory.map((item) => (
                      <tr
                        key={item.productId}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-4 px-6 font-medium">{item.productName}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-2">
                            {item.variants.map((variant: {size: string, color: string, quantity: number}) => (
                              <span
                                key={`${variant.size}-${variant.color}`}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm"
                              >
                                {variant.size} - {variant.color}: {variant.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-center py-4 px-6">
                          <span className="font-bold text-lg text-gradient">
                            {formatNumber(item.totalQuantity)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {inventory?.inventory.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center py-12 text-muted-foreground">
                          No active orders found. Create orders to see demand.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary Notes */}
          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">How to use this report</h3>
                  <p className="text-sm text-muted-foreground">
                    This report shows the total quantity needed for each product and size
                    based on all pending and ordered orders. Use this to know exactly what
                    to buy from your suppliers. Update order status to &quot;Ordered&quot; once
                    you&apos;ve placed supplier orders, and &quot;Ready&quot; when stock arrives.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
