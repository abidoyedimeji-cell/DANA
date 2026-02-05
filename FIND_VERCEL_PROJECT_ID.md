# 🔍 Finding Your Vercel Project ID

## Current Status

**The `.vercel` folder does NOT exist** - Your project hasn't been linked to Vercel yet.

**Vercel CLI is NOT installed** - Need to install it first.

---

## 🎯 Three Ways to Get Your Project ID

### Method 1: From Vercel Dashboard (Easiest - No CLI needed)

1. **Go to**: [https://vercel.com](https://vercel.com)
2. **Login** to your Vercel account
3. **Find your project**:
   - If you already have a project: Click on it → **Settings** → **General** → Find **Project ID**
   - If you don't have a project yet: Create one first (see Method 2)

**Project ID format**: `prj_xxxxxxxxxxxxxxxxxxxxx` (starts with `prj_`)

---

### Method 2: Link Project via CLI (Creates `.vercel` folder)

**Step 1: Install Vercel CLI**
```powershell
npm i -g vercel
```

**Step 2: Login**
```powershell
vercel login
```

**Step 3: Link Project**
```powershell
cd "C:\Users\admin\Dana\DANA Native"
vercel link
```

**Step 4: Get Project ID**
After linking, run:
```powershell
Get-Content .vercel\project.json | ConvertFrom-Json | Select-Object projectId
```

**Or manually check**:
```powershell
Get-Content .vercel\project.json
```

---

### Method 3: Deploy First (Auto-creates `.vercel` folder)

**Step 1: Install Vercel CLI**
```powershell
npm i -g vercel
```

**Step 2: Deploy**
```powershell
vercel
```

This will:
- Create `.vercel` folder automatically
- Link your project
- Store Project ID in `.vercel/project.json`

**Step 3: Get Project ID**
```powershell
Get-Content .vercel\project.json
```

---

## 📁 What You'll Find in `.vercel/project.json`

Once created, it contains:

```json
{
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxxxxxxxxxx"
}
```

The `projectId` is what you need!

---

## ⚡ Quick Command Reference

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (creates .vercel folder)
vercel link

# Get Project ID
Get-Content .vercel\project.json

# Or deploy (also creates .vercel folder)
vercel
```

---

## 🔍 Alternative: Check Vercel Dashboard URL

If you've deployed before, the Project ID might be in:
- Your browser history (Vercel dashboard URLs)
- Email notifications from Vercel
- Vercel Dashboard → Your Project → Settings → General

---

## ✅ Next Steps

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Link**: `vercel link` (or deploy with `vercel`)
4. **Get ID**: Check `.vercel/project.json`

---

**Once you link or deploy, the `.vercel` folder will be created and you can find your Project ID there!**
