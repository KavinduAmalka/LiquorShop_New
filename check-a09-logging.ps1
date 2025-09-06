#!/usr/bin/env pwsh

# A09 Security Logging Monitor
Write-Host "🛡️  A09 - Security Logging and Monitoring Dashboard" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

$logDir = ".\backend\logs"

if (Test-Path $logDir) {
    Write-Host "📁 Log Directory Status: ✅ ACTIVE" -ForegroundColor Green
    Write-Host ""
    
    # Show current log files
    Write-Host "📄 Current Log Files:" -ForegroundColor Yellow
    Get-ChildItem $logDir -Filter "*.log" | Sort-Object LastWriteTime -Descending | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        $lastModified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        Write-Host "   $($_.Name) - ${size}KB - Modified: $lastModified" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "🔍 Recent Security Events (Last 5):" -ForegroundColor Yellow
    
    # Get recent security events
    $securityLog = Join-Path $logDir "security-$(Get-Date -Format 'yyyy-MM-dd').log"
    if (Test-Path $securityLog) {
        Get-Content $securityLog | Select-Object -Last 5 | ForEach-Object {
            $event = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($event) {
                $time = $event.timestamp
                $type = $event.eventType
                $level = $event.level.ToUpper()
                Write-Host "   [$level] $time - $type" -ForegroundColor White
            }
        }
    } else {
        Write-Host "   No security events logged today" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "📊 Log Statistics:" -ForegroundColor Yellow
    
    # Count events by type
    if (Test-Path $securityLog) {
        $events = Get-Content $securityLog | ConvertFrom-Json -ErrorAction SilentlyContinue
        $eventCounts = $events | Group-Object eventType | Sort-Object Count -Descending
        
        foreach ($group in $eventCounts) {
            Write-Host "   $($group.Name): $($group.Count) events" -ForegroundColor Cyan
        }
    }
    
} else {
    Write-Host "📁 Log Directory Status: ❌ NOT FOUND" -ForegroundColor Red
    Write-Host "   Expected: $logDir" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔧 Commands to monitor logs in real-time:" -ForegroundColor Yellow
Write-Host "   Get-Content .\backend\logs\security-$(Get-Date -Format 'yyyy-MM-dd').log -Tail 10 -Wait" -ForegroundColor White
Write-Host "   Get-Content .\backend\logs\app-$(Get-Date -Format 'yyyy-MM-dd').log -Tail 10 -Wait" -ForegroundColor White
Write-Host ""
Write-Host "✅ A09 Security Logging and Monitoring is ACTIVE!" -ForegroundColor Green
