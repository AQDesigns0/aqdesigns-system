'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { BUSINESS_CONFIG, getBusinessConfig } from '@/lib/business-config'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState(BUSINESS_CONFIG)

  useEffect(() => {
    setConfig(getBusinessConfig())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4 neon-glow overflow-hidden">
                {config.logo ? (
                  <Image 
                    src={config.logo} 
                    alt={config.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">{config.shortName}</span>
                )}
              </div>
            </motion.div>
            <CardTitle className="text-2xl">{config.name}</CardTitle>
            <CardDescription>
              {config.tagline}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@aqdesigns.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="glass"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                variant="neon"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>Default credentials:</p>
              <p className="mt-1">Admin: admin@aqdesigns.com / admin123</p>
              <p>Mariam: mariam@aqdesigns.com / mariam123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
