# Windows Development Environment Setup Guide

**Project:** The Chamber of Red Mansion (紅樓慧讀)
**Version:** 1.0
**Date:** 2025-10-07
**Purpose:** Complete guide for setting up the development environment on Windows

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Setup Instructions](#detailed-setup-instructions)
5. [Troubleshooting](#troubleshooting)
6. [Performance Optimizations](#performance-optimizations)
7. [Verification](#verification)

---

## 🎯 Overview

This guide addresses Windows-specific challenges encountered in the Red Mansion project, particularly:

- **Windows path length limitations** (260-character limit)
- **npm installation performance issues** (9+ minute installs)
- **ChunkLoadError failures** from corrupted Next.js installations
- **Security vulnerabilities** and deprecated packages

### Critical Issues Resolved

| Issue | Before | After |
|-------|--------|-------|
| npm install time | 9+ minutes | <1 minute |
| Dev server startup | Unstable/failing | <3 seconds |
| ChunkLoadError incidents | Frequent | Eliminated |
| Security vulnerabilities | 9 (1 critical) | 0 |

---

## ✅ Prerequisites

### Required Software

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/download/win)
- **Windows 10/11** - Version 1607 or later (for long path support)
- **Administrator access** - Required for registry modifications

### Optional (Recommended)

- **Visual Studio Code** - [Download](https://code.visualstudio.com/)
- **Windows Terminal** - [Download](https://aka.ms/terminal)
- **PowerShell 7+** - [Download](https://aka.ms/powershell)

---

## 🚀 Quick Start

### Automated Setup (Recommended)

The project includes an automated setup script that handles all configuration:

```powershell
# Navigate to project directory
cd TheChamber_Of_RedMansion_FireBaseStudio

# Run setup script (requires Administrator for registry checks)
.\scripts\setup-windows-dev.ps1

# Or run without installing dependencies
.\scripts\setup-windows-dev.ps1 -SkipInstall

# Force clean installation
.\scripts\setup-windows-dev.ps1 -Force
```

**What the script does:**
- ✅ Verifies Windows long path support
- ✅ Configures Git long paths
- ✅ Installs pnpm package manager
- ✅ Validates Node.js environment
- ✅ Installs project dependencies (optional)

### Manual Quick Start

If you prefer manual setup:

```powershell
# 1. Enable Git long paths
git config --global core.longpaths true

# 2. Install pnpm globally (if not already installed)
npm install -g pnpm

# 3. Install project dependencies
pnpm install

# 4. Start development server
pnpm run dev
```

---

## 🔧 Detailed Setup Instructions

### Step 1: Enable Windows Long Path Support

Windows has a default 260-character path limit that causes issues with deep node_modules nesting.

#### Method 1: PowerShell (Requires Administrator)

```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
                 -Name "LongPathsEnabled" `
                 -Value 1 `
                 -PropertyType DWORD `
                 -Force
```

#### Method 2: Group Policy Editor

1. Press `Win + R` and type `gpedit.msc`
2. Navigate to: **Computer Configuration > Administrative Templates > System > Filesystem**
3. Find **"Enable Win32 long paths"**
4. Set to **"Enabled"**
5. Click **Apply** and **OK**

#### Method 3: Registry Editor (Manual)

1. Press `Win + R` and type `regedit`
2. Navigate to: `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`
3. Create/modify DWORD value: `LongPathsEnabled` = `1`
4. Restart your computer

#### Verification

```powershell
# Check registry value
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled"

# Should output: LongPathsEnabled : 1
```

---

### Step 2: Configure Git for Long Paths

```powershell
# Enable Git long paths globally
git config --global core.longpaths true

# Verify configuration
git config --global --get core.longpaths
# Should output: true
```

---

### Step 3: Install and Configure pnpm

#### Why pnpm?

pnpm provides significantly better performance on Windows compared to npm:

| Feature | npm | pnpm |
|---------|-----|------|
| Install speed | 9+ minutes | <1 minute |
| Disk space | ~2GB | ~500MB (shared store) |
| Symlink handling | Poor on Windows | Excellent |
| Path length handling | Problematic | Optimized |

#### Installation

```powershell
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version

# Expected output: 10.x.x or higher
```

#### Configuration

The project includes a `.npmrc` file with optimized pnpm settings:

```ini
# Key Windows optimizations
shamefully-hoist=false
symlink=true
network-concurrency=16
fetch-retries=5
legacy-peer-deps=true
```

**No additional configuration needed** - settings are automatically applied.

---

### Step 4: Clean Installation

#### Remove Corrupted Installation

```powershell
# Navigate to project root
cd TheChamber_Of_RedMansion_FireBaseStudio

# Remove node_modules (may take 2-3 minutes)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Remove old lock files
Remove-Item package-lock.json -ErrorAction SilentlyContinue
```

#### Fresh pnpm Installation

```powershell
# Install all dependencies (should take <1 minute)
pnpm install

# Expected output:
# Progress: resolved X, reused Y, downloaded Z, added W
# Done in XXs
```

---

### Step 5: Verify Installation

```powershell
# Check for missing packages
pnpm outdated

# Run type checking
pnpm run typecheck

# Run tests
pnpm test

# Start development server
pnpm run dev
```

**Development server should start in <3 seconds.**

---

## 🐛 Troubleshooting

### Issue: "ENOENT: no such file or directory" during npm install

**Cause:** Windows path length limit or corrupted installation

**Solution:**
```powershell
# 1. Ensure long paths are enabled (see Step 1)
# 2. Use pnpm instead of npm
# 3. Move project to shorter path if needed
```

### Issue: "ChunkLoadError" in browser

**Cause:** Incomplete Next.js installation due to path length issues

**Solution:**
```powershell
# Clean and reinstall
pnpm clean
pnpm install
```

### Issue: pnpm install fails with "EACCES" error

**Cause:** Permission issues or antivirus interference

**Solution:**
```powershell
# 1. Run PowerShell as Administrator
# 2. Temporarily disable antivirus during installation
# 3. Check Windows Defender exclusions
```

### Issue: Slow installation despite using pnpm

**Possible causes and solutions:**

```powershell
# 1. Clear pnpm cache
pnpm store prune

# 2. Check network connectivity
pnpm config set fetch-retries 10

# 3. Use offline mode if packages are cached
pnpm install --offline
```

### Issue: "The system cannot find the path specified"

**Cause:** Project path exceeds 260 characters

**Current path length:**
```
D:\AboutUniversity\114 NSTC_and_SeniorProject\2025-IM-senior-project\TheChamber_Of_RedMansion_FireBaseStudio\
= 111 characters
```

**Solution if needed:**
```powershell
# Move to shorter path (save ~50 characters)
# Example: C:\Dev\RedMansion\
```

---

## ⚡ Performance Optimizations

### pnpm Store Location

For better performance, configure pnpm store location:

```powershell
# Set custom store location (shorter path)
pnpm config set store-dir C:\.pnpm-store

# Verify
pnpm store path
```

### Network Optimizations

Already configured in `.npmrc`, but can be customized:

```powershell
# Increase concurrent downloads
pnpm config set network-concurrency 32

# Increase retry attempts
pnpm config set fetch-retries 10

# Increase timeout for slow networks
pnpm config set fetch-timeout 900000
```

### Development Server Optimizations

```powershell
# Use Turbopack for faster development builds (Next.js 13+)
pnpm run dev --turbo

# Disable source maps for faster builds
cross-env GENERATE_SOURCEMAP=false pnpm run dev
```

---

## ✅ Verification Checklist

After completing setup, verify the following:

- [ ] **Windows Long Path Support**: `LongPathsEnabled = 1` in registry
- [ ] **Git Long Paths**: `git config --global core.longpaths` returns `true`
- [ ] **Node.js Version**: `node --version` shows v18.0.0 or higher
- [ ] **pnpm Installed**: `pnpm --version` shows 8.0.0 or higher
- [ ] **Dependencies Installed**: `pnpm list` shows no missing packages
- [ ] **No Security Issues**: `pnpm audit` shows 0 vulnerabilities
- [ ] **TypeScript Valid**: `pnpm run typecheck` completes without errors
- [ ] **Tests Passing**: `pnpm test` shows all tests passing
- [ ] **Dev Server Starts**: `pnpm run dev` starts in <3 seconds
- [ ] **No ChunkLoadError**: Browse to http://localhost:3000 without errors

---

## 📚 Additional Resources

### Official Documentation

- [pnpm Documentation](https://pnpm.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Windows Long Path Support](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation)

### Project-Specific Guides

- [CLAUDE.md](../../CLAUDE.md) - Development guidelines
- [CodeBase_Improvement.md](../CodeBase_Improvement/CodeBase_Improvement.md) - Performance optimization guide
- [TASK.md](../CodeBase_Improvement/TASK.md) - Implementation tasks

### Helper Scripts

| Script | Purpose |
|--------|---------|
| `scripts/setup-windows-dev.ps1` | Automated Windows environment setup |
| `pnpm run setup:windows` | Run setup script via npm script |
| `pnpm clean` | Clean node_modules and cache |
| `pnpm reinstall` | Clean + fresh install |

---

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check existing documentation** in `/docs` directory
2. **Review error logs** in console output
3. **Search GitHub issues** for similar problems
4. **Contact development team** with detailed error information

### Useful Diagnostic Commands

```powershell
# System information
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# Node.js environment
node --version
npm --version
pnpm --version

# Project status
pnpm list --depth=0
pnpm outdated
pnpm audit

# Check registry settings
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"

# Check Git configuration
git config --global --list | Select-String "longpath"
```

---

## 📝 Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-07 | 1.0 | Initial Windows setup documentation |

---

**Last Updated:** 2025-10-07
**Maintained By:** Red Mansion Development Team
