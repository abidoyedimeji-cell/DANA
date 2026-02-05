# Vercel Project ID - How to Find It

## 🔍 Current Status

**The `.vercel` folder does NOT exist yet.**

This means your project hasn't been linked to Vercel yet. The `.vercel` folder is created when you:
1. Run `vercel link` for the first time, OR
2. Deploy to Vercel for the first time

---

## 📋 How to Get Your Vercel Project ID

### Option 1: Link Project First (Creates `.vercel` folder)

1. **Install Vercel CLI** (if not installed):
   ```powershell
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```powershell
   vercel login
   ```

3. **Link your project**:
   ```powershell
   cd "C:\Users\admin\Dana\DANA Native"
   vercel link
   ```

4. **After linking**, the `.vercel` folder will be created with:
   - `.vercel/project.json` - Contains `projectId`
   - `.vercel/orgId` - Your organization ID
   - `.vercel/.gitignore` - Ensures folder is ignored by Git

5. **Find the Project ID**:
   ```powershell
   Get-Content .vercel\project.json | ConvertFrom-Json | Select-Object projectId
   ```

### Option 2: Get from Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project (or create a new one)
3. Go to **Settings** → **General**
4. Find **Project ID** (long string of letters and numbers)

### Option 3: Create New Project via Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **Project**
3. Import from GitHub (if you've pushed your repo)
4. The Project ID will be shown in the project settings

---

## 📁 What `.vercel/project.json` Looks Like

Once created, it will contain:

```json
{
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxxxxxxxxxxx"
}
```

The `projectId` is what you're looking for!

---

## 🚀 Quick Start: Link Your Project

Run these commands to create the `.vercel` folder:

```powershell
# 1. Login (if not already)
vercel login

# 2. Link project
vercel link

# 3. Answer prompts:
#    - Set up and deploy? → No (just link)
#    - Which scope? → Your account or team
#    - Link to existing project? → Yes (if you have one) or No (to create new)

# 4. Check the project ID
Get-Content .vercel\project.json
```

---

## ✅ After Linking

Once `.vercel` folder exists:

1. **The folder is automatically ignored** by Git (via `.gitignore`)
2. **Project ID is stored locally** in `.vercel/project.json`
3. **You can deploy** using `vercel` or `vercel --prod`

---

## 📝 Note

The `.vercel` folder is:
- ✅ **Ignored by Git** (already in `.gitignore`)
- ✅ **Local to your machine** (not committed)
- ✅ **Created automatically** when you link or deploy

---

## 🎯 Next Steps

1. **Link your project**: `vercel link`
2. **Find Project ID**: Check `.vercel/project.json`
3. **Deploy**: `vercel` (preview) or `vercel --prod` (production)

---

**Once you run `vercel link`, the `.vercel` folder will be created and you can find your Project ID!**
