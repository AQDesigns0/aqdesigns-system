'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  FileText,
  Truck,
  PieChart,
  RotateCcw,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BUSINESS_CONFIG, getBusinessConfig } from '@/lib/business-config'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Returns', href: '/returns', icon: RotateCcw },
  { name: 'Supplier Orders', href: '/supplier-orders', icon: Truck },
  { name: 'Inventory', href: '/inventory', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Users', href: '/users', icon: Users, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState(BUSINESS_CONFIG)
  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    setConfig(getBusinessConfig())
  }, [])

  const filteredNav = navigation.filter(
    (item) => !item.adminOnly || isAdmin
  )

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-6">
        {config.logo ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center neon-glow bg-white/10">
            <Image 
              src={config.logo} 
              alt={config.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center neon-glow">
            <span className="text-lg font-bold text-white">{config.shortName}</span>
          </div>
        )}
        <div>
          <h1 className="font-bold text-lg neon-text">{config.name}</h1>
          <p className="text-xs text-muted-foreground">{config.tagline}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group',
                isActive
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-violet-400')} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-violet-400"
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-medium">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.role}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-red-400"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg glass flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-64 glass-card z-50 flex flex-col lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 glass-card flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
