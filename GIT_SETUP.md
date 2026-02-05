# Git Setup Guide for Windows

## 🚨 Issue: Git Not Found

Git is not installed or not in your system PATH. Here's how to fix it.

## 📥 Option 1: Install Git for Windows (Recommended)

### Step 1: Download Git

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download the latest version (64-bit installer)
3. Or use winget (if available):
   ```powershell
   winget install --id Git.Git -e --source winget
   ```

### Step 2: Run the Installer

1. Run the downloaded `.exe` file
2. **Important**: During installation, select:
   - ✅ "Git from the command line and also from 3rd-party software"
   - ✅ "Use the OpenSSL library"
   - ✅ "Checkout Windows-style, commit Unix-style line endings"
   - ✅ "Use MinTTY"
   - ✅ "Enable file system caching"
   - ✅ "Enable Git Credential Manager"

### Step 3: Verify Installation

Close and reopen PowerShell, then run:

```powershell
git --version
```

You should see something like: `git version 2.xx.x.windows.x`

## 🔧 Option 2: Use Git via GitHub Desktop (Easier GUI)

If you prefer a GUI:

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install it (includes Git automatically)
3. Git commands will be available in PowerShell after installation

## ✅ After Installation: Verify Setup

```powershell
# Check Git version
git --version

# Check Git configuration
git config --global --list

# Set your name and email (if not already set)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🎯 Quick Commands You'll Need

Once Git is installed, you can use:

```powershell
# Check current branch
git branch

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push

# Pull latest changes
git pull
```

## 🚀 For Vercel Deployment

If you're planning to deploy to Vercel, you'll need Git to:
- Initialize a repository (if not already done)
- Push to GitHub/GitLab/Bitbucket
- Enable automatic deployments

### Initialize Git Repository (if needed)

```powershell
# Navigate to your project
cd "C:\Users\admin\Dana\DANA Native"

# Initialize Git (if not already initialized)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DANA infrastructure setup"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/dana-native.git

# Push to remote
git push -u origin main
```

## 🔍 Troubleshooting

### Git Still Not Found After Installation?

1. **Restart PowerShell** (or your terminal)
2. **Check PATH**: 
   ```powershell
   $env:PATH -split ';' | Select-String -Pattern 'git'
   ```
   Should show: `C:\Program Files\Git\cmd` or similar

3. **Manually Add to PATH** (if needed):
   - Open System Properties → Environment Variables
   - Add `C:\Program Files\Git\cmd` to PATH
   - Restart PowerShell

### Alternative: Use Git Bash

If PowerShell still has issues:
1. Install Git for Windows (includes Git Bash)
2. Use Git Bash instead of PowerShell for Git commands
3. Git Bash is available from Start Menu → Git → Git Bash

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Desktop](https://desktop.github.com/)
- [Vercel Git Integration](https://vercel.com/docs/concepts/git)

---

## ✅ Quick Install Command (if winget is available)

```powershell
winget install --id Git.Git -e --source winget
```

Then restart PowerShell and verify:
```powershell
git --version
```
