# LiquorShop Dependency Report Generator
# Generate comprehensive dependency and security reports

Write-Host "📊 LiquorShop Dependency Report" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

$projectRoot = "e:\LiquorShop_New"
$reportDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportFile = "$projectRoot\reports\dependency-report-$reportDate.md"

# Create reports directory if it doesn't exist
$reportsDir = "$projectRoot\reports"
if (!(Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null
}

# Function to generate dependency report for a component
function Generate-DependencyReport {
    param($directory, $name)
    
    Write-Host "📋 Generating report for $name..." -ForegroundColor Yellow
    Set-Location $directory
    
    if (Test-Path "package.json") {
        # Get package info
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        # Get audit results
        $auditResult = npm audit --json 2>$null | ConvertFrom-Json
        
        # Get outdated packages
        $outdatedResult = npm outdated --json 2>$null | ConvertFrom-Json
        
        # Return report data
        return @{
            Name = $name
            Version = $packageJson.version
            Dependencies = $packageJson.dependencies.PSObject.Properties.Count
            DevDependencies = if ($packageJson.devDependencies) { $packageJson.devDependencies.PSObject.Properties.Count } else { 0 }
            Vulnerabilities = $auditResult.metadata.vulnerabilities.total
            OutdatedPackages = if ($outdatedResult) { $outdatedResult.PSObject.Properties.Count } else { 0 }
            LastChecked = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
    }
    return $null
}

# Generate reports
$reports = @()
$reports += Generate-DependencyReport $projectRoot "Root"
$reports += Generate-DependencyReport "$projectRoot\backend" "Backend"
$reports += Generate-DependencyReport "$projectRoot\frontend" "Frontend"

# Create markdown report
$markdownReport = @"
# LiquorShop Dependency Security Report
**Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## 📊 Summary

| Component | Version | Dependencies | Dev Dependencies | Vulnerabilities | Outdated Packages |
|-----------|---------|--------------|------------------|----------------|-------------------|
"@

foreach ($report in $reports | Where-Object { $_ -ne $null }) {
    $vulnerabilityStatus = if ($report.Vulnerabilities -eq 0) { "✅ 0" } else { "❌ $($report.Vulnerabilities)" }
    $outdatedStatus = if ($report.OutdatedPackages -eq 0) { "✅ 0" } else { "⚠️ $($report.OutdatedPackages)" }
    
    $markdownReport += "|$($report.Name)|$($report.Version)|$($report.Dependencies)|$($report.DevDependencies)|$vulnerabilityStatus|$outdatedStatus|`n"
}

$markdownReport += @"

## 🔒 Security Status

### Overall Security Health
- **Total Components**: $($reports.Count)
- **Total Vulnerabilities**: $(($reports | Measure-Object -Property Vulnerabilities -Sum).Sum)
- **Total Outdated Packages**: $(($reports | Measure-Object -Property OutdatedPackages -Sum).Sum)

### Recommendations
1. **High Priority**: Fix all vulnerabilities immediately
2. **Medium Priority**: Update outdated packages  
3. **Low Priority**: Review and update dev dependencies

## 📋 Detailed Component Analysis

"@

foreach ($report in $reports | Where-Object { $_ -ne $null }) {
    $markdownReport += @"
### $($report.Name)
- **Version**: $($report.Version)
- **Dependencies**: $($report.Dependencies)
- **Dev Dependencies**: $($report.DevDependencies)  
- **Security Status**: $(if ($report.Vulnerabilities -eq 0) { "✅ Secure" } else { "❌ $($report.Vulnerabilities) vulnerabilities found" })
- **Update Status**: $(if ($report.OutdatedPackages -eq 0) { "✅ Up to date" } else { "⚠️ $($report.OutdatedPackages) packages outdated" })
- **Last Checked**: $($report.LastChecked)

"@
}

$markdownReport += @"
## 🛡️ OWASP A06 Compliance Status

✅ **Vulnerability Scanning**: Automated npm audit checks  
✅ **Dependency Monitoring**: Regular dependency reports  
✅ **Security Updates**: Automated fix scripts available  
✅ **Component Inventory**: Comprehensive tracking implemented  

## 🔧 Maintenance Commands

```bash
# Check for vulnerabilities
npm run security:check

# Fix vulnerabilities  
npm run audit:fix

# Update all dependencies
npm run security:update

# Generate fresh report
.\scripts\dependency-report.ps1
```

---
**Report Generated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Next Review**: $(Get-Date -Add (New-TimeSpan -Days 7) -Format "yyyy-MM-dd")
"@

# Save report
$markdownReport | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "📄 Report generated: $reportFile" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan

foreach ($report in $reports | Where-Object { $_ -ne $null }) {
    $status = if ($report.Vulnerabilities -eq 0) { "✅" } else { "❌" }
    Write-Host "   $status $($report.Name): $($report.Vulnerabilities) vulnerabilities, $($report.OutdatedPackages) outdated" -ForegroundColor $(if ($report.Vulnerabilities -eq 0) { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "📁 Full report saved to: $reportFile" -ForegroundColor Green
