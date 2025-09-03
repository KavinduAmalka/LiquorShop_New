# LiquorShop Security Check Script
# Comprehensive vulnerability scanning for the entire project

Write-Host "LiquorShop Security Vulnerability Check" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

$projectRoot = "e:\LiquorShop_New"
$hasVulnerabilities = $false

# Function to check vulnerabilities in a directory
function Check-Vulnerabilities {
    param($directory, $name)
    
    Write-Host "Checking $name..." -ForegroundColor Yellow
    Set-Location $directory
    
    # Check if package.json exists
    if (Test-Path "package.json") {
        $auditResult = npm audit --json 2>$null | ConvertFrom-Json
        
        if ($auditResult.metadata.vulnerabilities.total -gt 0) {
            Write-Host "WARNING: Found vulnerabilities in $name" -ForegroundColor Red
            Write-Host "   Total: $($auditResult.metadata.vulnerabilities.total)" -ForegroundColor Red
            Write-Host "   High: $($auditResult.metadata.vulnerabilities.high)" -ForegroundColor Red
            Write-Host "   Moderate: $($auditResult.metadata.vulnerabilities.moderate)" -ForegroundColor Red
            Write-Host "   Low: $($auditResult.metadata.vulnerabilities.low)" -ForegroundColor Red
            $script:hasVulnerabilities = $true
            
            # Show detailed audit
            Write-Host "   Running detailed audit..." -ForegroundColor Yellow
            npm audit
        } else {
            Write-Host "SUCCESS: No vulnerabilities found in $name" -ForegroundColor Green
        }
    } else {
        Write-Host "WARNING: No package.json found in $name" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Check root level
Check-Vulnerabilities $projectRoot "Root Level"

# Check backend
Check-Vulnerabilities "$projectRoot\backend" "Backend"

# Check frontend  
Check-Vulnerabilities "$projectRoot\frontend" "Frontend"

# Summary
Write-Host "Security Check Summary" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

if ($hasVulnerabilities) {
    Write-Host "FAIL: Vulnerabilities found! Please run the security fix script." -ForegroundColor Red
    Write-Host "   Run: .\scripts\security-fix.ps1" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "SUCCESS: All components are secure!" -ForegroundColor Green
    Write-Host "   Last checked: $(Get-Date)" -ForegroundColor Green
    exit 0
}
