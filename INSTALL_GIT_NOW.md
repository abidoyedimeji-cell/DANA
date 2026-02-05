# ⚡ Quick Git Installation Guide

## 🎯 You Need to Install Git First

Git is **not installed** on your system. You must install it before running any `git` commands.

---

## 📥 Step-by-Step Installation

### Step 1: Download Git

**Option A: Direct Download (Easiest)**
1. Open your web browser
2. Go to: **https://git-scm.com/download/win**
3. Click the download button (it will auto-detect 64-bit)
4. Save the `.exe` file

**Option B: Direct Link**
- 64-bit: https://github.com/git-for-windows/git/releases/latest
- Download: `Git-2.xx.x-64-bit.exe`

### Step 2: Install Git

1. **Run the downloaded `.exe` file**
2. Click "Next" through the setup wizard
3. **Important Settings** (when prompted):
   - ✅ Select: **"Git from the command line and also from 3rd-party software"**
   - ✅ Select: **"Use the OpenSSL library"**
   - ✅ Select: **"Checkout Windows-style, commit Unix-style line endings"**
   - ✅ Select: **"Use MinTTY"**
   - ✅ Enable: **"Enable file system caching"**
   - ✅ Enable: **"Enable Git Credential Manager"**
4. Click "Install" and wait for completion

### Step 3: Restart PowerShell

**CRITICAL**: You MUST close and reopen PowerShell after installation!

1. Close your current PowerShell window
2. Open a **NEW** PowerShell window
3. Navigate back to your project:
   ```powershell
   cd "C:\Users\admin\Dana\DANA Native"
   ```

### Step 4: Verify Installation

Run this command:
```powershell
git --version
```

**Expected Output**: `git version 2.xx.x.windows.x`

If you see a version number, Git is installed! ✅

---

## 🚀 After Git is Installed

Once `git --version` works, you can run:

```powershell
# Initialize repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: DANA infrastructure setup"
```

---

## 🔄 Alternative: GitHub Desktop

If you prefer a GUI:

1. Download: **https://desktop.github.com/**
2. Install GitHub Desktop (includes Git automatically)
3. Restart PowerShell
4. Verify: `git --version`

---

## ❓ Troubleshooting

### "git is still not recognized" after installation?

1. **Did you restart PowerShell?** (Required!)
2. **Check if Git is in PATH:**
   ```powershell
   $env:PATH -split ';' | Select-String -Pattern 'git'
   ```
   Should show: `C:\Program Files\Git\cmd`

3. **If not in PATH**, manually add it:
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\Program Files\Git\cmd`
   - Click OK on all dialogs
   - **Restart PowerShell**

---

## ✅ Quick Checklist

- [ ] Downloaded Git installer
- [ ] Ran installer with recommended settings
- [ ] Closed PowerShell
- [ ] Opened NEW PowerShell window
- [ ] Ran `git --version` successfully
- [ ] Ready to use Git commands!

---

**Once Git is installed and verified, you can proceed with your repository setup!**
