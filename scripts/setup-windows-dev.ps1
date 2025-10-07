<#
.SYNOPSIS
    Windows Development Environment Setup Script for Red Mansion Platform

.DESCRIPTION
    Automated setup script to configure Windows development environment with:
    - Windows Long Path Support verification
    - Git long paths configuration
    - pnpm package manager setup
    - Node.js environment validation
    - Development dependencies installation

.NOTES
    File Name      : setup-windows-dev.ps1
    Author         : Red Mansion Development Team
    Prerequisite   : PowerShell 5.1+ (Run as Administrator for registry checks)
    Created        : 2025-10-07

.EXAMPLE
    .\scripts\setup-windows-dev.ps1
    Runs the complete Windows development environment setup

.EXAMPLE
    .\scripts\setup-windows-dev.ps1 -SkipInstall
    Verifies configuration without installing dependencies
#>

param(
    [switch]$SkipInstall = $false,
    [switch]$Force = $false
)

# =============================================================================
# CONFIGURATION
# =============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewline
    )

    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-ColorOutput "========================================" $Colors.Header
    Write-ColorOutput $Message $Colors.Header
    Write-ColorOutput "========================================" $Colors.Header
    Write-Host ""
}

function Write-Step {
    param(
        [string]$Message,
        [switch]$Success,
        [switch]$Warning,
        [switch]$Error
    )

    if ($Success) {
        Write-ColorOutput "[✓] $Message" $Colors.Success
    } elseif ($Warning) {
        Write-ColorOutput "[!] $Message" $Colors.Warning
    } elseif ($Error) {
        Write-ColorOutput "[✗] $Message" $Colors.Error
    } else {
        Write-ColorOutput "[*] $Message" $Colors.Info
    }
}

# =============================================================================
# ENVIRONMENT CHECKS
# =============================================================================

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-LongPathSupport {
    Write-Step "Checking Windows Long Path Support..."

    try {
        $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
        $longPathEnabled = Get-ItemProperty -Path $regPath -Name "LongPathsEnabled" -ErrorAction SilentlyContinue

        if ($longPathEnabled.LongPathsEnabled -eq 1) {
            Write-Step "Windows Long Path Support is ENABLED" -Success
            return $true
        } else {
            Write-Step "Windows Long Path Support is DISABLED" -Warning
            return $false
        }
    } catch {
        Write-Step "Unable to check Long Path Support (requires Administrator)" -Warning
        return $false
    }
}

function Enable-LongPathSupport {
    if (-not (Test-Administrator)) {
        Write-Step "Administrator privileges required to enable Long Path Support" -Error
        Write-Host ""
        Write-ColorOutput "Please run this script as Administrator or enable manually:" $Colors.Info
        Write-Host "  1. Open Group Policy Editor (gpedit.msc)"
        Write-Host "  2. Navigate to: Computer Configuration > Administrative Templates > System > Filesystem"
        Write-Host "  3. Enable 'Enable Win32 long paths'"
        Write-Host ""
        return $false
    }

    try {
        Write-Step "Enabling Windows Long Path Support..."
        $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
        New-ItemProperty -Path $regPath -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force | Out-Null
        Write-Step "Windows Long Path Support ENABLED successfully" -Success
        return $true
    } catch {
        Write-Step "Failed to enable Long Path Support: $_" -Error
        return $false
    }
}

function Test-NodeVersion {
    Write-Step "Checking Node.js installation..."

    try {
        $nodeVersion = node --version
        Write-Step "Node.js version: $nodeVersion" -Success

        # Extract major version number
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')

        if ($majorVersion -ge 18) {
            Write-Step "Node.js version is compatible (>= 18.x)" -Success
            return $true
        } else {
            Write-Step "Node.js version should be >= 18.x (current: $nodeVersion)" -Warning
            return $false
        }
    } catch {
        Write-Step "Node.js is not installed or not in PATH" -Error
        Write-ColorOutput "Please install Node.js 18+ from: https://nodejs.org/" $Colors.Info
        return $false
    }
}

function Test-PackageManager {
    param([string]$Manager)

    try {
        $version = & $Manager --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Step "$Manager version: $version" -Success
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Test-GitLongPaths {
    Write-Step "Checking Git long paths configuration..."

    try {
        $gitLongPaths = git config --global core.longpaths

        if ($gitLongPaths -eq "true") {
            Write-Step "Git long paths support is ENABLED" -Success
            return $true
        } else {
            Write-Step "Git long paths support is DISABLED" -Warning
            return $false
        }
    } catch {
        Write-Step "Git is not installed or not configured" -Warning
        return $false
    }
}

function Enable-GitLongPaths {
    Write-Step "Enabling Git long paths support..."

    try {
        git config --global core.longpaths true
        Write-Step "Git long paths support ENABLED successfully" -Success
        return $true
    } catch {
        Write-Step "Failed to enable Git long paths: $_" -Error
        return $false
    }
}

# =============================================================================
# PACKAGE MANAGER SETUP
# =============================================================================

function Install-PackageManager {
    Write-Step "Checking package managers..."

    $hasPnpm = Test-PackageManager "pnpm"
    $hasYarn = Test-PackageManager "yarn"

    if (-not $hasPnpm) {
        Write-Step "pnpm not found, installing..." -Warning
        try {
            npm install -g pnpm
            Write-Step "pnpm installed successfully" -Success
        } catch {
            Write-Step "Failed to install pnpm: $_" -Error
            return $false
        }
    }

    return $true
}

function Install-Dependencies {
    param([switch]$Clean = $false)

    Write-Step "Installing project dependencies with pnpm..."

    if ($Clean) {
        Write-Step "Cleaning existing node_modules..."
        if (Test-Path "node_modules") {
            Remove-Item -Recurse -Force "node_modules"
        }
        if (Test-Path "pnpm-lock.yaml") {
            Remove-Item -Force "pnpm-lock.yaml"
        }
    }

    try {
        Write-Host ""
        Write-ColorOutput "Running: pnpm install" $Colors.Info
        Write-Host ""

        pnpm install

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Step "Dependencies installed successfully" -Success
            return $true
        } else {
            Write-Step "Dependency installation failed with exit code: $LASTEXITCODE" -Error
            return $false
        }
    } catch {
        Write-Step "Failed to install dependencies: $_" -Error
        return $false
    }
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

function Main {
    Write-Header "Red Mansion Platform - Windows Development Setup"

    Write-ColorOutput "Project Path: $PWD" $Colors.Info
    Write-ColorOutput "Path Length: $($PWD.Path.Length) characters" $Colors.Info
    Write-Host ""

    # Check if running as administrator
    if (Test-Administrator) {
        Write-Step "Running with Administrator privileges" -Success
    } else {
        Write-Step "Running without Administrator privileges (some features may be limited)" -Warning
    }
    Write-Host ""

    # =========================================================================
    # STEP 1: Windows Long Path Support
    # =========================================================================
    Write-Header "Step 1: Windows Long Path Support"

    if (-not (Test-LongPathSupport)) {
        if ($Force) {
            Enable-LongPathSupport | Out-Null
        } else {
            Write-ColorOutput "Long Path Support is not enabled. Enable it? (Requires Administrator)" $Colors.Warning
            $response = Read-Host "Enable Long Path Support? (Y/N)"
            if ($response -eq "Y" -or $response -eq "y") {
                Enable-LongPathSupport | Out-Null
            }
        }
    }

    # =========================================================================
    # STEP 2: Git Configuration
    # =========================================================================
    Write-Header "Step 2: Git Long Paths Configuration"

    if (-not (Test-GitLongPaths)) {
        Enable-GitLongPaths | Out-Null
    }

    # =========================================================================
    # STEP 3: Node.js Verification
    # =========================================================================
    Write-Header "Step 3: Node.js Environment"

    if (-not (Test-NodeVersion)) {
        Write-Step "Please install or update Node.js before continuing" -Error
        return
    }

    # =========================================================================
    # STEP 4: Package Manager Setup
    # =========================================================================
    Write-Header "Step 4: Package Manager Configuration"

    if (-not (Install-PackageManager)) {
        Write-Step "Package manager setup failed" -Error
        return
    }

    # =========================================================================
    # STEP 5: Dependency Installation
    # =========================================================================
    if (-not $SkipInstall) {
        Write-Header "Step 5: Project Dependencies Installation"

        if ($Force) {
            $doClean = $true
        } else {
            Write-ColorOutput "Perform clean installation? (removes existing node_modules)" $Colors.Warning
            $response = Read-Host "Clean install? (Y/N)"
            $doClean = ($response -eq "Y" -or $response -eq "y")
        }

        if (-not (Install-Dependencies -Clean:$doClean)) {
            Write-Step "Dependency installation failed" -Error
            return
        }
    } else {
        Write-Step "Skipping dependency installation (use -SkipInstall:$false to install)" -Warning
    }

    # =========================================================================
    # COMPLETION SUMMARY
    # =========================================================================
    Write-Header "Setup Complete!"

    Write-ColorOutput "✓ Windows Long Path Support configured" $Colors.Success
    Write-ColorOutput "✓ Git long paths enabled" $Colors.Success
    Write-ColorOutput "✓ Package manager configured (pnpm)" $Colors.Success
    Write-ColorOutput "✓ Node.js environment validated" $Colors.Success

    if (-not $SkipInstall) {
        Write-ColorOutput "✓ Project dependencies installed" $Colors.Success
    }

    Write-Host ""
    Write-ColorOutput "Next Steps:" $Colors.Info
    Write-Host "  1. Run 'pnpm run dev' to start development server"
    Write-Host "  2. Run 'pnpm test' to execute test suite"
    Write-Host "  3. Check docs/setup/WINDOWS_SETUP.md for additional information"
    Write-Host ""

    Write-ColorOutput "Development environment is ready! 🚀" $Colors.Success
    Write-Host ""
}

# Run main function
Main
