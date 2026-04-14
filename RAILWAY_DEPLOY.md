# 🚀 Railway Cloud Deployment Guide

Deploy AQ Designs to the cloud so you and your sister can access it from anywhere!

## ✅ What You'll Get
- **Website URL**: `https://aqdesigns.up.railway.app` (example)
- **Same data** for both of you
- **Access anywhere** - phone, tablet, laptop
- **Free hosting** (up to 500 hours/month)

---

## 📋 Prerequisites

1. **GitHub account** (free): https://github.com/signup
2. **Railway account** (free): https://railway.app
3. **Your project code** ready

---

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub

1. Go to https://github.com/new
2. Repository name: `aqdesigns-system`
3. Make it **Private** (recommended)
4. Click "Create repository"
5. On your laptop, open CMD/PowerShell in the project folder:

```bash
cd C:\Users\[YourName]\aqdesigns-system

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/aqdesigns-system.git

# Push
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `aqdesigns-system` repository
6. Click "Deploy"

Railway will automatically:
- ✅ Detect it's a Next.js app
- ✅ Install dependencies
- ✅ Set up PostgreSQL database
- ✅ Build and deploy

---

### Step 3: Add Environment Variables

1. In Railway dashboard, click your project
2. Go to "Variables" tab
3. Click "New Variable" and add these:

```
NEXTAUTH_SECRET=aqdesigns-super-secret-key-2024-change-this-in-production
NEXTAUTH_URL=https://your-project-name.up.railway.app
```

**To get your exact URL:**
- Look at the "Deployments" tab
- Your URL will be shown there (like `aqdesigns.up.railway.app`)
- Use that full URL for NEXTAUTH_URL

**Database URL:**
- Railway automatically creates this!
- It's already set as `DATABASE_URL`
- You don't need to do anything

---

### Step 4: Set Up Database

1. In Railway, go to your project
2. Click the PostgreSQL database service
3. Go to "Data" tab
4. Wait for it to be ready (1-2 minutes)

The database migrations will run automatically on first deploy.

---

### Step 5: Create Admin User

1. In Railway dashboard, click your project
2. Go to "Logs" tab
3. Look for the URL at the top (your deployed app)
4. Open your app in browser
5. You'll see login page
6. **Need to create admin user?** Do this:

**Option A: Using Railway Console**
1. In Railway, click "New" → "Empty Service"
2. Set startup command: `npx prisma db seed`
3. Run it once, then delete the service

**Option B: Manual (Easier)**
1. Deploy first
2. Create a `/api/setup` route in your code
3. Visit that URL once to create admin
4. Or I can help you create this route

---

### Step 6: Share With Your Sister!

Once deployed, you'll have a URL like:
```
https://aqdesigns.up.railway.app
```

**Send her:**
- URL: `https://aqdesigns.up.railway.app`
- Email: `admin@aqdesigns.com`
- Password: `admin123`

She just opens Chrome, types the URL, logs in. **Done!** 🎉

---

## 🔄 How to Update (After Changes)

1. Make changes on your laptop
2. Test locally with `npm run dev`
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Added new feature"
   git push
   ```
4. Railway automatically redeploys!
5. Both you and sister see updates instantly

---

## 💰 Free Tier Limits

| Resource | Free Limit |
|----------|-----------|
| Execution hours | 500 hrs/month (~21 days) |
| Database storage | 500 MB |
| Bandwidth | 100 GB/month |

**If you exceed:**
- App sleeps after inactivity (cold start takes 10-30 seconds)
- Or upgrade to Hobby plan ($5/month for always-on)

---

## 🐛 Troubleshooting

### "Build Failed"
1. Check logs in Railway dashboard
2. Common issues:
   - Missing environment variables
   - Database not connected
   - Prisma generate failed

### "Database Connection Error"
1. In Railway, click PostgreSQL service
2. Check if it's "Healthy"
3. If not, create new database and update DATABASE_URL

### "Login Not Working"
1. Check NEXTAUTH_SECRET is set
2. Check NEXTAUTH_URL matches your Railway URL exactly
3. Clear browser cookies

### "Page Not Found"
1. Check if build succeeded
2. Check Logs for errors
3. Try redeploying

---

## 📱 Access From Anywhere

Once deployed, you can access from:
- ✅ Windows laptop (Chrome/Edge)
- ✅ Mac (Safari/Chrome)
- ✅ iPhone/iPad (Safari)
- ✅ Android phone (Chrome)
- ✅ Any device with internet!

Just type the URL and login!

---

## 🔒 Security Tips

1. **Change default password immediately**
   - Login as admin@aqdesigns.com / admin123
   - Go to Settings → Change password

2. **Use strong NEXTAUTH_SECRET**
   - Generate random string: https://generate-secret.vercel.app/32
   - Update in Railway variables

3. **Keep repository private**
   - Don't expose your code publicly

---

## 🆘 Need Help?

If stuck, check:
1. Railway documentation: https://docs.railway.app
2. Railway Discord: https://discord.gg/railway
3. Next.js deployment guide: https://nextjs.org/docs/deployment

---

## 🎯 Quick Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Create GitHub repo | 2 min |
| 2 | Push code | 3 min |
| 3 | Connect to Railway | 2 min |
| 4 | Add env variables | 2 min |
| 5 | Wait for deploy | 5 min |
| **Total** | | **~15 minutes** |

**Result**: Live website both of you can use! 🚀

---

## ✨ Alternative: Vercel (Even Easier!)

If Railway feels complex, try Vercel:

1. Go to https://vercel.com
2. Import your GitHub repo
3. Add environment variables
4. Deploy!

**Note**: Vercel needs separate database (use Railway PostgreSQL or Supabase)

---

**Ready to deploy? Start with Step 1 above!** 🚀
