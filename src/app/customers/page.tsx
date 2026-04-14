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
  Users,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  Phone,
  Mail,
  School,
  ShoppingBag,
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  school: string
  orders: number
  totalSpent: number
  createdAt: string
}

export default function CustomersPage() {
  const { data: session, status } = useSession()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = () => {
    // Load from localStorage
    const saved = localStorage.getItem('aq-customers')
    if (saved) {
      setCustomers(JSON.parse(saved))
    }
    setIsLoading(false)
  }

  const saveCustomers = (updated: Customer[]) => {
    localStorage.setItem('aq-customers', JSON.stringify(updated))
    setCustomers(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCustomer) {
      // Update existing
      const updated = customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, ...formData }
          : c
      )
      saveCustomers(updated)
    } else {
      // Add new
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        school: formData.school,
        orders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      }
      saveCustomers([...customers, newCustomer])
    }

    resetForm()
    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      school: customer.school,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this customer?')) return
    const updated = customers.filter(c => c.id !== id)
    saveCustomers(updated)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      school: '',
    })
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  )

  const stats = {
    total: customers.length,
    withOrders: customers.filter(c => c.orders > 0).length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
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
              <h1 className="text-3xl font-bold text-gradient">Customers</h1>
              <p className="text-muted-foreground">
                Manage customer database for quick repeat orders
              </p>
            </div>
            <Button 
              variant="neon" 
              onClick={() => {
                resetForm()
                setEditingCustomer(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">With Orders</p>
                  <p className="text-2xl font-bold">{stats.withOrders}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/20">
                  <ShoppingBag className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">R{stats.totalSpent.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Customers Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Contact</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">School</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Orders</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Total Spent</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No customers found. Add your first customer!
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                <span className="text-violet-400 font-medium">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                {customer.email && (
                                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {customer.phone}
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {customer.school ? (
                              <div className="flex items-center gap-2">
                                <School className="w-4 h-4 text-muted-foreground" />
                                {customer.school}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={customer.orders > 0 ? "secondary" : "outline"}>
                              {customer.orders} orders
                            </Badge>
                          </td>
                          <td className="py-4 px-6 font-medium">
                            R{customer.totalSpent.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(customer)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background rounded-xl border border-white/10 p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+27 12 345 6789"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">School</label>
                    <Input
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      placeholder="School Name"
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
                      {editingCustomer ? 'Update' : 'Add'} Customer
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
