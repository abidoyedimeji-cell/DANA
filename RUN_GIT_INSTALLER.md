# 🚀 Run Git Installer - Step by Step

## ✅ You Have the Installer!

File: `Git-2.52.0-64-bit.exe` is in your project directory.

---

## 📋 Installation Steps

### Step 1: Run the Installer

**Option A: Double-click the file**
- Navigate to: `C:\Users\admin\Dana\DANA Native`
- Double-click: `Git-2.52.0-64-bit.exe`

**Option B: Run from PowerShell**
```powershell
.\Git-2.52.0-64-bit.exe
```

**Note**: You may need to right-click → "Run as Administrator" if prompted.

---

### Step 2: Installation Wizard Settings

Follow the installer wizard and use these settings:

#### Screen 1: License Agreement
- ✅ Click "Next" (accept the license)

#### Screen 2: Select Components
**IMPORTANT**: Check these options:
- ✅ **Git from the command line and also from 3rd-party software** (CRITICAL!)
- ✅ Git Bash Here
- ✅ Git GUI Here
- ✅ Associate .git* configuration files with the default editor
- ✅ Associate .sh files to be run with Bash

#### Screen 3: Choosing the default editor
- Choose your preferred editor (Notepad++ is fine, or VS Code if you have it)
- Or leave default (Vim)

#### Screen 4: Adjusting your PATH environment
**CRITICAL**: Select:
- ✅ **"Git from the command line and also from 3rd-party software"**
- This is the most important setting!

#### Screen 5: Choosing HTTPS transport backend
- ✅ **"Use the OpenSSL library"** (recommended)

#### Screen 6: Configuring the line ending conversions
- ✅ **"Checkout Windows-style, commit Unix-style line endings"** (recommended)

#### Screen 7: Configuring the terminal emulator
- ✅ **"Use MinTTY"** (recommended)

#### Screen 8: Configuring extra options
- ✅ **"Enable file system caching"**
- ✅ **"Enable Git Credential Manager"**
- ✅ **"Enable symbolic links"** (if you need them)

#### Screen 9: Experimental options
- Leave unchecked (unless you know you need them)

#### Final Screen: Installation
- Click "Install"
- Wait for installation to complete (~2-3 minutes)
- Click "Finish"

---

### Step 3: Restart PowerShell (CRITICAL!)

**You MUST close and reopen PowerShell for Git to work!**

1. Close your current PowerShell window completely
2. Open a **NEW** PowerShell window
3. Navigate back to your project:
   ```powershell
   cd "C:\Users\admin\Dana\DANA Native"
   ```

---

### Step 4: Verify Installation

Run this command:
```powershell
git --version
```

**Expected Output**: 
```
git version 2.52.0.windows.x
```

If you see a version number, Git is installed! ✅

---

### Step 5: Configure Git (One-Time Setup)

Set your name and email (required for commits):

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual name and email.

---

### Step 6: Initialize Your Repository

Now you can run:

```powershell
# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: DANA infrastructure setup"

# Check status
git status
```

---

## 🎯 Quick Command Reference

After installation, these commands will work:

```powershell
# Check Git version
git --version

# Initialize repository
git init

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# View commit history
git log --oneline
```

---

## ❓ Troubleshooting

### "git is still not recognized" after installation?

1. **Did you restart PowerShell?** (This is REQUIRED!)
2. **Check PATH:**
   ```powershell
   $env:PATH -split ';' | Select-String -Pattern 'git'
   ```
   Should show: `C:\Program Files\Git\cmd`

3. **If Git is not in PATH:**
   - The installer should have added it automatically
   - Try restarting your computer
   - Or manually add `C:\Program Files\Git\cmd` to PATH

### Installation fails?

- Make sure you have administrator privileges
- Try right-clicking the installer → "Run as Administrator"
- Check Windows Defender isn't blocking it

---

## ✅ Success Checklist

- [ ] Installer ran successfully
- [ ] Selected "Git from the command line" option
- [ ] Installation completed
- [ ] Closed PowerShell
- [ ] Opened NEW PowerShell window
- [ ] `git --version` shows version number
- [ ] Configured name and email
- [ ] Ready to use Git!

---

**Once `git --version` works, you're all set! 🎉**
