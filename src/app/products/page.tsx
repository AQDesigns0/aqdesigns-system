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
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  X,
  Upload,
  Download,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null
  isActive: boolean
  sizes: { id: string; name: string; type: string }[]
  colors: { id: string; name: string }[]
}

export default function ProductsPage() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importData, setImportData] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Uniform',
    sizes: [] as string[],
    colors: [] as string[],
    newSize: '',
    newColor: '',
    imageUrl: '',
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      sizes: formData.sizes,
      colors: formData.colors,
      imageUrl: formData.imageUrl,
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsModalOpen(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || 'Uniform',
      sizes: product.sizes.map(s => s.name),
      colors: product.colors?.map(c => c.name) || [],
      newSize: '',
      newColor: '',
      imageUrl: product.imageUrl || '',
    })
    setIsModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
        imageUrl: formData.imageUrl,
      }

      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsModalOpen(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Product deleted successfully')
        fetchProducts()
      } else {
        alert('Failed to delete: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Failed to delete product: ' + (error as Error).message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Uniform',
      sizes: [],
      colors: [],
      newSize: '',
      newColor: '',
      imageUrl: '',
    })
    setEditingProduct(null)
    setIsUploading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const addSize = () => {
    if (formData.newSize && !formData.sizes.includes(formData.newSize)) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, formData.newSize],
        newSize: '',
      })
    }
  }

  const removeSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((s) => s !== size),
    })
  }

  const addColor = () => {
    if (formData.newColor && !formData.colors.includes(formData.newColor)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, formData.newColor],
        newColor: '',
      })
    }
  }

  const removeColor = (color: string) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((c) => c !== color),
    })
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <h1 className="text-3xl font-bold text-gradient">Products</h1>
              <p className="text-muted-foreground">
                Manage your uniform products and variants
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsImportModalOpen(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
              <Button variant="neon" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="gradient-border group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <Image 
                          src={product.imageUrl}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-violet-400" />
                      )}
                    </div>
                    <div className="flex gap-2" style={{ position: 'relative', zIndex: 10 }}>
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ position: 'relative', zIndex: 11 }}
                        type="button"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ position: 'relative', zIndex: 11 }}
                        type="button"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {product.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gradient">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.sizes.map((size) => (
                      <span
                        key={size.id}
                        className="px-2 py-1 rounded-md text-xs bg-violet-500/20 text-violet-300"
                      >
                        {size.name}
                      </span>
                    ))}
                  </div>
                  
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <span
                          key={color.id}
                          className="px-2 py-1 rounded-md text-xs bg-cyan-500/20 text-cyan-300"
                        >
                          {color.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-card rounded-xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={editingProduct ? handleUpdate : handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Product Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. School Shirt"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Uniform"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Product Image</label>
                <div className="space-y-3">
                  {formData.imageUrl && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={formData.imageUrl}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <div className={`flex items-center justify-center px-4 py-2 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-violet-500/50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isUploading ? (
                          <span className="text-sm text-muted-foreground">Uploading...</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{formData.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sizes</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.newSize}
                    onChange={(e) => setFormData({ ...formData, newSize: e.target.value })}
                    placeholder="e.g. S, M, L or 28, 30, 32"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" variant="secondary" onClick={addSize}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.sizes.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 rounded-full text-sm bg-violet-500/20 text-violet-300 flex items-center gap-2"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Colors (Optional)</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.newColor}
                    onChange={(e) => setFormData({ ...formData, newColor: e.target.value })}
                    placeholder="e.g. Blue, Maroon, Navy"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" variant="secondary" onClick={addColor}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.colors.map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-300 flex items-center gap-2"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="neon" className="flex-1">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl border border-white/10 p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Import Products from CSV</h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Expected CSV format:</p>
                <code className="text-xs bg-black/50 p-2 rounded block">
                  name,description,price,category,sizes,colors<br/>
                  School Blazer,Navy blazer with logo,450.00,Uniform,"S,M,L","Navy,Black"<br/>
                  Summer Shirt,White short sleeve,180.00,Uniform,"XS,S,M,L,XL",White
                </code>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Paste CSV Data</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your CSV data here..."
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-sm text-white font-mono"
                  style={{ backgroundColor: '#1f2937', color: 'white' }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setIsImportModalOpen(false); setImportData(''); }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="neon" 
                  className="flex-1"
                  onClick={async () => {
                    if (!importData.trim()) {
                      alert('Please paste CSV data')
                      return
                    }
                    
                    const lines = importData.trim().split('\n')
                    const headers = lines[0].split(',').map(h => h.trim())
                    const newProducts = []
                    
                    for (let i = 1; i < lines.length; i++) {
                      const values = lines[i].split(',').map(v => v.trim())
                      if (values.length < 3) continue
                      
                      const product = {
                        name: values[0],
                        description: values[1] || '',
                        price: parseFloat(values[2]) || 0,
                        category: values[3] || 'Uniform',
                        sizes: values[4] ? values[4].split('|').map(s => s.trim()).filter(Boolean) : [],
                        colors: values[5] ? values[5].split('|').map(c => c.trim()).filter(Boolean) : [],
                      }
                      
                      try {
                        const res = await fetch('/api/products', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(product),
                        })
                        if (res.ok) {
                          const data = await res.json()
                          newProducts.push(data)
                        }
                      } catch (err) {
                        console.error('Failed to import product:', err)
                      }
                    }
                    
                    alert(`Successfully imported ${newProducts.length} products`)
                    fetchProducts()
                    setIsImportModalOpen(false)
                    setImportData('')
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import {importData.trim() ? importData.trim().split('\n').filter(l => l.trim()).length - 1 : 0} Products
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
