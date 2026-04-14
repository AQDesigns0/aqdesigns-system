// Default Business Configuration
// These values can be changed in Settings page
export const BUSINESS_CONFIG = {
  name: 'AQ Designs',
  shortName: 'AQ',
  tagline: 'Quality School Uniforms',
  logo: '', // Will be set via Settings page
  favicon: '/favicon.ico',
  contact: {
    email: 'info@yourcompany.com',
    phone: '',
    address: '',
  },
  colors: {
    primary: '#8b5cf6', // Violet
    secondary: '#06b6d4', // Cyan,
  }
}

// Get config from localStorage (client-side only)
export function getBusinessConfig() {
  if (typeof window === 'undefined') return BUSINESS_CONFIG
  
  const saved = localStorage.getItem('businessConfig')
  if (saved) {
    return { ...BUSINESS_CONFIG, ...JSON.parse(saved) }
  }
  return BUSINESS_CONFIG
}

// Save config to localStorage
export function saveBusinessConfig(config: Partial<typeof BUSINESS_CONFIG>) {
  if (typeof window === 'undefined') return
  
  const current = getBusinessConfig()
  const updated = { ...current, ...config }
  localStorage.setItem('businessConfig', JSON.stringify(updated))
  return updated
}
