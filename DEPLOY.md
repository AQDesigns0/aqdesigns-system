# 🚀 Quick Deployment Checklist

## For Sister's Laptop (Windows)

### 1. Pre-Flight Checklist (Your Laptop)
- [ ] Code is working properly
- [ ] All console.logs removed
- [ ] Unnecessary files deleted
- [ ] README.md updated

### 2. Package for Transfer
```bash
# Create a zip file (exclude node_modules and .next)
Compress-Archive -Path "aqdesigns-system" -DestinationPath "aqdesigns-deploy.zip" -ExcludePath "node_modules",".next"
```

Or manually:
1. Right-click `aqdesigns-system` folder
2. "Send to" → "Compressed folder"
3. Delete the zip, then manually zip these folders: `src/`, `prisma/`, `public/`, plus files: `.env.local`, `package.json`, `README.md`

### 3. Sister's Laptop Setup
1. Install Node.js: https://nodejs.org (Download "LTS" version)
2. Extract the zip file to `C:\Users\[HerName]\aqdesigns-system`
3. Open CMD or PowerShell
4. Run these commands:

```bash
cd C:\Users\[HerName]\aqdesigns-system
npm install
npx prisma generate
node prisma/seed.js
npm run dev
```

5. Open browser: http://localhost:3000

### 4. Login Credentials
- **Email**: admin@aqdesigns.com
- **Password**: admin123

### 5. Create Desktop Shortcut
1. Right-click Desktop → New → Shortcut
2. Location: `C:\Windows\System32\cmd.exe /k "cd /d C:\Users\[HerName]\aqdesigns-system && npm run dev"`
3. Name: "AQ Designs"
4. Click Finish

---

## 🔄 How to Update (When You Make Changes)

### Simplest Method (USB Copy):
1. Make changes on your laptop
2. Test everything works
3. Copy entire `aqdesigns-system` folder to USB
4. Replace on sister's laptop
5. If you added new packages, run: `npm install`

### Smart Method (Only Changed Files):
1. Copy only these folders if you only changed code:
   - `src/` folder
   - `prisma/` folder (if database changed)
2. Paste and replace on sister's laptop
3. No need to run `npm install`

---

## 🆘 Emergency Fixes

### Reset Everything:
```bash
# Delete database (all data lost!)
Remove-Item prisma\dev.db

# Recreate database
npx prisma db push

# Reset admin password
node prisma/seed.js
```

### Server Won't Start:
```bash
# Kill all node processes
Get-Process -Name node | Stop-Process

# Clear cache and restart
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 💡 Pro Tips

1. **Backup Database**: Copy `prisma/dev.db` regularly - this is ALL your data!

2. **Auto-start**: Add shortcut to Windows Startup folder for auto-launch

3. **Port Issues**: If port 3000 is taken, app automatically uses 3001, 3002, etc.

4. **Browser**: Use Chrome or Edge for best experience

---

## 📞 Need Help?
Check the full README.md or console logs for errors.
