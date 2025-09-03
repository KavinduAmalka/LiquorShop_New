# LiquorShop Security Fix Script
# Automatically fix vulnerabilities and update dependencies

Write-Host "🔧 LiquorShop Security Fix & Update" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

$projectRoot = "e:\LiquorShop_New"

# Function to fix vulnerabilities in a directory
function Fix-Vulnerabilities {
    param($directory, $name)
    
    Write-Host "🔧 Fixing vulnerabilities in $name..." -ForegroundColor Yellow
    Set-Location $directory
    
    if (Test-Path "package.json") {
        Write-Host "   Running npm audit fix..." -ForegroundColor Cyan
        npm audit fix
        
        Write-Host "   Updating dependencies..." -ForegroundColor Cyan
        npm update
        
        Write-Host "   Verifying fix..." -ForegroundColor Cyan
        $auditResult = npm audit --json 2>$null | ConvertFrom-Json
        
        if ($auditResult.metadata.vulnerabilities.total -eq 0) {
            Write-Host "   ✅ $name is now secure!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Some vulnerabilities remain in $name" -ForegroundColor Yellow
            npm audit
        }
    } else {
        Write-Host "   ⚠️  No package.json found in $name" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Fix root level
Fix-Vulnerabilities $projectRoot "Root Level"

# Fix backend
Fix-Vulnerabilities "$projectRoot\backend" "Backend"

# Fix frontend
Fix-Vulnerabilities "$projectRoot\frontend" "Frontend"

# Final security check
Write-Host "🔍 Running final security verification..." -ForegroundColor Green
& "$projectRoot\scripts\security-check.ps1"

Write-Host "✅ Security fix process completed!" -ForegroundColor Green
Write-Host "   Updated: $(Get-Date)" -ForegroundColor Green
