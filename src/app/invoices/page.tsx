'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Download, FileText, Calculator } from 'lucide-react'
import { getBusinessConfig } from '@/lib/business-config'
import { formatCurrency } from '@/lib/utils'

// Dynamic imports for PDF generation
const loadPDFLibs = async () => {
  const jspdfModule = await import('jspdf')
  const html2canvasModule = await import('html2canvas')
  return { 
    jsPDF: jspdfModule.jsPDF || jspdfModule.default, 
    html2canvas: html2canvasModule.default || html2canvasModule 
  }
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export default function InvoicesPage() {
  const [config] = useState(getBusinessConfig())
  const invoiceRef = useRef<HTMLDivElement>(null)
  
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    billTo: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    
    items: [
      { id: '1', description: '', quantity: 1, unitPrice: 0 }
    ] as InvoiceItem[],
    
    notes: 'Thank you for your business!',
    taxRate: 15,
  })

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
      ]
    })
  }

  const removeItem = (id: string) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.filter(item => item.id !== id)
      })
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    })
  }

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    )
  }

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const generatePDF = async () => {
    if (!invoiceRef.current) {
      alert('No invoice to generate')
      return
    }
    
    try {
      console.log('Loading PDF libraries...')
      const { jsPDF, html2canvas } = await loadPDFLibs()
      console.log('Libraries loaded:', { jsPDF, html2canvas })
      
      console.log('Capturing invoice...')
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      })
      console.log('Canvas captured:', canvas.width, canvas.height)
      
      const imgData = canvas.toDataURL('image/png')
      console.log('Image data created')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      console.log('PDF created')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`)
      console.log('PDF saved!')
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <main className="lg:ml-64 flex-1 p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Invoice Maker</h1>
              <p className="text-muted-foreground">
                Create and download professional invoices
              </p>
            </div>
            <Button variant="neon" onClick={generatePDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Invoice Details */}
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div style={{ position: 'relative', zIndex: 10 }}>
                      <label className="text-sm font-medium mb-2 block">Invoice #</label>
                      <input
                        type="text"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                        placeholder="INV-001"
                        style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                      />
                    </div>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <input
                        type="date"
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                      />
                    </div>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                      <label className="text-sm font-medium mb-2 block">Due Date</label>
                      <input
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bill To */}
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    Bill To
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <label className="text-sm font-medium mb-2 block">Customer Name</label>
                    <input
                      type="text"
                      value={invoiceData.billTo.name}
                      onChange={(e) => setInvoiceData({ ...invoiceData, billTo: { ...invoiceData.billTo, name: e.target.value } })}
                      placeholder="Customer Name"
                      style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                    />
                  </div>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <input
                      type="email"
                      value={invoiceData.billTo.email}
                      onChange={(e) => setInvoiceData({ ...invoiceData, billTo: { ...invoiceData.billTo, email: e.target.value } })}
                      placeholder="customer@email.com"
                      style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                    />
                  </div>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <input
                      type="text"
                      value={invoiceData.billTo.phone}
                      onChange={(e) => setInvoiceData({ ...invoiceData, billTo: { ...invoiceData.billTo, phone: e.target.value } })}
                      placeholder="+27 12 345 6789"
                      style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                    />
                  </div>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <label className="text-sm font-medium mb-2 block">Address</label>
                    <input
                      type="text"
                      value={invoiceData.billTo.address}
                      onChange={(e) => setInvoiceData({ ...invoiceData, billTo: { ...invoiceData.billTo, address: e.target.value } })}
                      placeholder="Customer Address"
                      style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-violet-400" />
                    Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {invoiceData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5" style={{ position: 'relative', zIndex: 10 }}>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                        />
                      </div>
                      <div className="col-span-2" style={{ position: 'relative', zIndex: 10 }}>
                        <label className="text-sm font-medium mb-1 block">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                        />
                      </div>
                      <div className="col-span-3" style={{ position: 'relative', zIndex: 10 }}>
                        <label className="text-sm font-medium mb-1 block">Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <div className="flex-1 text-right text-xs" style={{ minWidth: '50px' }}>
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          disabled={invoiceData.items.length <= 1}
                          style={{ minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      position: 'relative',
                      zIndex: 10
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </CardContent>
              </Card>

              {/* Tax & Notes */}
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle>Additional Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div style={{ position: 'relative', zIndex: 10 }}>
                      <label className="text-sm font-medium mb-2 block">Tax Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={invoiceData.taxRate}
                        onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                      />
                    </div>
                  </div>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <textarea
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                      style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: 'white' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Section */}
            <div>
              <div 
                ref={invoiceRef}
                className="bg-white text-black rounded-lg shadow-lg overflow-hidden"
                style={{ minHeight: '800px' }}
              >
                {/* Professional Header with Blue Accent */}
                <div style={{ backgroundColor: '#1e3a5f', color: 'white', padding: '30px 40px' }}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {config.logo ? (
                        <img 
                          src={config.logo} 
                          alt="Logo" 
                          style={{ width: '70px', height: '70px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '8px', padding: '5px' }}
                        />
                      ) : (
                        <div style={{ width: '70px', height: '70px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                          {config.shortName || 'AQ'}
                        </div>
                      )}
                      <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{config.name}</h1>
                        <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>{config.tagline}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>INVOICE</h2>
                      <p style={{ fontSize: '16px', opacity: 0.9, margin: '5px 0 0 0' }}>#{invoiceData.invoiceNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Details Bar */}
                <div style={{ backgroundColor: '#f8fafc', padding: '20px 40px', borderBottom: '1px solid #e2e8f0' }}>
                  <div className="flex justify-between">
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>Invoice Date</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{invoiceData.date}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>Due Date</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{invoiceData.dueDate}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' }}>Amount Due</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', margin: 0 }}>{formatCurrency(calculateTotal())}</p>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div style={{ padding: '30px 40px' }}>
                  {/* Bill To Section */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: '600' }}>Bill To</p>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>{invoiceData.billTo.name || 'Customer Name'}</p>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0' }}>{invoiceData.billTo.email}</p>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0' }}>{invoiceData.billTo.phone}</p>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0' }}>{invoiceData.billTo.address}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: '600' }}>From</p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>{config.name}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0' }}>{config.contact?.email}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0' }}>{config.contact?.phone}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0' }}>{config.contact?.address}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #1e3a5f' }}>Description</th>
                        <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #1e3a5f', width: '80px' }}>Qty</th>
                        <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #1e3a5f', width: '120px' }}>Unit Price</th>
                        <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #1e3a5f', width: '120px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item, index) => (
                        <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '15px', fontSize: '14px', color: '#334155' }}>{item.description || 'Item description'}</td>
                          <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#334155' }}>{item.quantity}</td>
                          <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', color: '#334155' }}>{formatCurrency(item.unitPrice)}</td>
                          <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#334155' }}>{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Section */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <div style={{ width: '300px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#64748b' }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: '500', color: '#334155' }}>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px', color: '#64748b' }}>
                        <span>Tax ({invoiceData.taxRate}%)</span>
                        <span style={{ fontWeight: '500', color: '#334155' }}>{formatCurrency(calculateTax())}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', marginTop: '10px', borderTop: '2px solid #1e3a5f', fontSize: '18px', fontWeight: 'bold', color: '#1e3a5f' }}>
                        <span>Total</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {invoiceData.notes && (
                    <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #1e3a5f' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: '600' }}>Notes</p>
                      <p style={{ fontSize: '14px', color: '#334155', margin: 0, lineHeight: '1.6' }}>{invoiceData.notes}</p>
                    </div>
                  )}
                </div>

                {/* Professional Footer */}
                <div style={{ backgroundColor: '#f8fafc', padding: '30px 40px', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
                  <div className="text-center">
                    <p style={{ fontSize: '14px', color: '#1e3a5f', fontWeight: '600', margin: '0 0 8px 0' }}>Thank you for your business!</p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
                      {config.name} | {config.contact?.email} | {config.contact?.phone}
                    </p>
                    {config.contact?.address && (
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>{config.contact?.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
