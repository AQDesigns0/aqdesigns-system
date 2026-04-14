'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getBusinessConfig, saveBusinessConfig, BUSINESS_CONFIG } from '@/lib/business-config'
import { Upload, Save, Building2, Mail, Phone, MapPin, RotateCcw } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState(BUSINESS_CONFIG)
  const [isUploading, setIsUploading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = getBusinessConfig()
    setConfig(saved)
    setIsLoading(false)
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    saveBusinessConfig(config)
    setSaveMessage('Settings saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
    setIsSaving(false)
    // Reload to apply changes
    window.location.reload()
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        setConfig({ ...config, logo: data.url })
      } else {
        alert('Failed to upload logo: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Failed to upload logo: ' + (error as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  const updateConfig = (key: string, value: string) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      if (parent === 'contact') {
        setConfig({
          ...config,
          contact: {
            ...config.contact,
            [child]: value
          }
        })
      }
    } else {
      setConfig({ ...config, [key]: value })
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

  const isAdmin = session.user?.role === 'ADMIN'
  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:ml-64 p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gradient">Settings</h1>
            <p className="text-muted-foreground">
              Customize your business information and branding
            </p>
          </div>

          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400"
            >
              {saveMessage}
            </motion.div>
          )}

          {/* Business Info */}
          <Card className="gradient-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-violet-400" />
                <CardTitle>Business Information</CardTitle>
              </div>
              <CardDescription>
                Set your company name and tagline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div style={{ position: 'relative', zIndex: 10 }}>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <input
                  type="text"
                  value={config.name || ''}
                  onChange={(e) => {
                    console.log('Typing:', e.target.value)
                    setConfig({ ...config, name: e.target.value })
                  }}
                  onClick={() => console.log('Input clicked!')}
                  placeholder="Your Company Name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <label className="text-sm font-medium mb-2 block">Short Name (for logo)</label>
                <input
                  type="text"
                  value={config.shortName || ''}
                  onChange={(e) => setConfig({ ...config, shortName: e.target.value })}
                  placeholder="CN"
                  maxLength={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <label className="text-sm font-medium mb-2 block">Tagline</label>
                <input
                  type="text"
                  value={config.tagline || ''}
                  onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                  placeholder="Your Business Tagline"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card className="gradient-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-violet-400" />
                <CardTitle>Logo</CardTitle>
              </div>
              <CardDescription>
                Upload your company logo (recommended: 200x200px)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden border-2 border-dashed border-white/20">
                  {config.logo ? (
                    <Image
                      src={config.logo}
                      alt="Logo preview"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">{config.shortName || 'CN'}</span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('CLICKED!')
                      alert('Opening file picker...')
                      fileInputRef.current?.click()
                    }}
                    disabled={isUploading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      position: 'relative',
                      zIndex: 100
                    }}
                  >
                    {isUploading ? 'Uploading...' : config.logo ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {config.logo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfig({ ...config, logo: '' })}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="gradient-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-violet-400" />
                <CardTitle>Contact Information</CardTitle>
              </div>
              <CardDescription>
                Set your business contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div style={{ position: 'relative', zIndex: 10 }}>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email"
                  value={config.contact?.email || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    contact: { ...(config.contact || {}), email: e.target.value }
                  })}
                  placeholder="info@yourcompany.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </label>
                <input
                  type="text"
                  value={config.contact?.phone || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    contact: { ...(config.contact || {}), phone: e.target.value }
                  })}
                  placeholder="+27 12 345 6789"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address
                </label>
                <input
                  type="text"
                  value={config.contact?.address || ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    contact: { ...(config.contact || {}), address: e.target.value }
                  })}
                  placeholder="Your business address"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                localStorage.removeItem('businessConfig')
                setConfig(BUSINESS_CONFIG)
                window.location.reload()
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
            <Button
              variant="neon"
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
