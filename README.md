# AQ Designs - Uniform Order Management System

A premium, full-stack web application for managing custom uniform orders with a futuristic dark UI, role-based authentication, and comprehensive inventory tracking.

## ✨ Features

- **Secure login** with role-based access (Admin/Staff)
- **Product Management**: Create products with sizes and prices
- **Order Management**: Track customer orders with status updates
- **Inventory Tracking**: Automatic demand calculation
- **Dashboard**: Real-time business analytics
- **Receipt Printing**: Generate PDF receipts
- **Customer Database**: Store and manage customer information

## 🚀 Deployment Guide

### Method 1: Install on Sister's Laptop (Recommended)

#### Step 1: Install Required Software
1. **Install Node.js**: https://nodejs.org (Download LTS version)
2. **Install Git**: https://git-scm.com/download/win

#### Step 2: Copy the Project
**Option A - USB Transfer:**
1. Copy the entire `aqdesigns-system` folder to USB
2. Paste it on sister's laptop in `C:\Users\[HerName]\`

**Option B - Zip File:**
1. On your laptop, zip the `aqdesigns-system` folder
2. Transfer via USB, email, or cloud storage
3. Extract on her laptop

#### Step 3: Setup on Sister's Laptop
1. Open Command Prompt (CMD) or PowerShell
2. Navigate to the folder:
   ```bash
   cd C:\Users\[HerName]\aqdesigns-system
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the database:
   ```bash
   npx prisma generate
   ```
5. Create admin user:
   ```bash
   node prisma/seed.js
   ```

#### Step 4: Run the Application
```bash
npm run dev
```
Open browser: http://localhost:3000

#### Step 5: Create Desktop Shortcut (Windows)
1. Right-click Desktop → New → Shortcut
2. Location: `C:\Windows\System32\cmd.exe /k "cd /d C:\Users\[HerName]\aqdesigns-system && npm run dev"`
3. Name: "AQ Designs System"
4. Change icon (optional)

---

### Method 2: Build as Desktop App (Electron)

If you want a real desktop application:

1. Install Electron:
   ```bash
   npm install electron electron-builder --save-dev
   ```

2. Add to `package.json` scripts:
   ```json
   "electron": "electron .",
   "dist": "npm run build && electron-builder"
   ```

3. Create `main.js` for Electron (I can help you create this)

4. Build:
   ```bash
   npm run dist
   ```

This creates an `.exe` installer!

---

### Method 3: Host Online (Cloud)

For access from anywhere:

#### Free Options:
1. **Vercel** (https://vercel.com) - Free hosting
2. **Railway** (https://railway.app) - Free database + hosting
3. **Render** (https://render.com) - Free tier

#### Steps for Vercel:
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Add environment variables
4. Deploy automatically

---

## 📋 Environment Setup

### Required `.env.local` file:
```
# Database (SQLite - no server needed!)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth Secret (any random string)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Default Login:
- **Email**: `admin@aqdesigns.com`
- **Password**: `admin123`

---

## 🔄 Future Updates

### How to Update the System:

#### Option 1: Manual Update (USB)
1. Make changes on your laptop
2. Copy the entire folder to USB
3. Replace on sister's laptop
4. Run `npm install` (if new packages added)

#### Option 2: Git Sync (Advanced)
1. Set up Git repository
2. Push changes from your laptop
3. Pull on sister's laptop

#### Option 3: Simple Copy (Files Only)
If only source files changed (no new packages):
1. Copy only the `src/` folder
2. Paste and replace on sister's laptop
3. No need to run `npm install`

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma studio` | Open database GUI |

---

## � Project Structure

```
aqdesigns-system/
├── src/
│   ├── app/           # Pages (dashboard, orders, products, etc.)
│   ├── components/    # Reusable UI components
│   ├── lib/          # Utilities and helpers
│   └── api/          # API routes
├── prisma/
│   ├── schema.prisma # Database schema
│   └── dev.db        # SQLite database file
├── public/           # Static assets
└── package.json      # Dependencies
```

---

## 🐛 Troubleshooting

### Common Issues:

**Port already in use:**
- The app will auto-switch to port 3001, 3002, etc.
- Check the terminal for the correct URL

**Database errors:**
- Delete `prisma/dev.db` to reset
- Run `npx prisma db push` again

**Login not working:**
- Clear browser cookies/cache
- Run `node prisma/seed.js` to reset password

---

## � Support

For help with deployment or updates, check the console logs or contact your developer.

---

**Built with:** Next.js 14, TypeScript, Prisma, SQLite, Tailwind CSS
- Pending deliveries overview
- Revenue charts (Bar chart)
- Order status distribution (Pie chart)
- Recent orders list

### 🎨 Premium UI/UX
- **Dark mode** default with futuristic aesthetic
- **Glassmorphism** design elements
- **Neon accents** (violet/cyan gradients)
- **Smooth animations** with Framer Motion
- **Responsive design** (desktop & mobile)
- **Sidebar navigation** with mobile drawer

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **UI Components** | Radix UI, Lucide Icons |
| **Authentication** | NextAuth.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Charts** | Recharts |
| **State** | Zustand (ready), React Query |

## 📁 Project Structure

```
aqdesigns-system/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/[...nextauth]/  # NextAuth config
│   │   │   ├── products/  # Product API
│   │   │   ├── orders/    # Order API
│   │   │   ├── inventory/ # Inventory API
│   │   │   ├── users/     # Users API
│   │   │   └── register/  # Registration API
│   │   ├── dashboard/     # Dashboard page
│   │   ├── products/      # Products page
│   │   ├── orders/        # Orders page
│   │   ├── inventory/     # Inventory page
│   │   ├── users/         # Users page (admin only)
│   │   ├── login/         # Login page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home (redirects to login)
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   ├── ui/            # UI components (Button, Card, Input, Badge)
│   │   ├── sidebar.tsx    # Navigation sidebar
│   │   └── providers.tsx  # Context providers
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utility functions
│   └── types/
│       └── next-auth.d.ts # TypeScript types for auth
├── public/
│   └── uploads/           # Image uploads (local)
├── .env.local             # Environment variables
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn

### Step 1: Install Dependencies

```bash
cd aqdesigns-system
npm install
```

### Step 2: Configure Environment Variables

Edit `.env.local`:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/aqdesigns?schema=public"

# NextAuth - Change this secret for production
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# App Settings
NODE_ENV="development"
UPLOAD_DIR="./public/uploads"
```

### Step 3: Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

The seed creates:
- **Admin user**: `admin@aqdesigns.com` / `admin123`
- **Staff user**: `staff@aqdesigns.com` / `staff123`
- **Sample products**: School Shirt, Cardigan, Blazer, Trousers
- **Sample orders**: For testing

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@aqdesigns.com | admin123 |
| **Staff** | staff@aqdesigns.com | staff123 |

## 📖 Usage Guide

### Creating a Product
1. Navigate to **Products** page
2. Click "Add Product"
3. Enter name, description, price, category
4. Add sizes (e.g., S, M, L, XL or 28, 30, 32)
5. Save

### Creating an Order
1. Navigate to **Orders** page
2. Click "New Order"
3. Enter customer details (name, email, phone, school)
4. Add products with sizes and quantities
5. Mark as paid if customer paid upfront
6. Save - Order starts as "Pending"

### Tracking Inventory
1. Navigate to **Inventory** page
2. View "What to Buy" report
3. Shows aggregated quantities needed per product/size
4. Use this to place supplier orders
5. Update order status to "Ordered" after placing supplier order

### Managing Users (Admin Only)
1. Navigate to **Users** page
2. Click "Add User"
3. Enter name, email, password
4. Select role (Admin or Staff)
5. Save

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    // Change these HSL values
  }
}
```

### Adding New Order Statuses
1. Edit `prisma/schema.prisma` - add to `OrderStatus` enum
2. Update `src/components/ui/badge.tsx` - add new status styles
3. Update order pages with new status options

### Cloud Image Upload
Currently configured for local storage. To add cloud storage:
1. Install Cloudinary/AWS SDK: `npm install cloudinary`
2. Update `src/app/api/upload/route.ts`
3. Update product image handling

## 🔒 Security Best Practices

- **Change NEXTAUTH_SECRET** in production
- **Use strong database passwords**
- **Enable HTTPS** in production
- **Regular database backups**
- **Environment variables** never committed to git

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

### Self-Hosted
```bash
npm run build
npm start
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## 🤝 Support

For issues or questions:
1. Check the browser console for errors
2. Verify database connection
3. Ensure all environment variables are set
4. Check Prisma logs

## 📄 License

Private - For AQ Designs use only.

---

**Built with ❤️ for AQ Designs**
