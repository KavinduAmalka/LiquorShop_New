#!/usr/bin/env powershell

# HTTPS Development Setup Script
# This script sets up HTTPS for local development

Write-Host "🔒 Setting up HTTPS for LiquorShop Development" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "backend\package.json")) {
    Write-Host "❌ Please run this script from the LiquorShop root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 1: Generating SSL certificates..." -ForegroundColor Yellow
Set-Location backend
npm run generate-certs
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate certificates" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green

Write-Host "📋 Step 2: Setting up environment files..." -ForegroundColor Yellow
Set-Location ..

# Backend environment setup
if (-not (Test-Path "backend\.env")) {
    Write-Host "📄 Creating backend .env file..." -ForegroundColor Cyan
    Copy-Item "backend\.env.example" "backend\.env"
    
    # Enable HTTPS in the .env file
    $envContent = Get-Content "backend\.env"
    $envContent = $envContent -replace "ENABLE_HTTPS=false", "ENABLE_HTTPS=true"
    $envContent | Set-Content "backend\.env"
    
    Write-Host "✅ Backend .env file created with HTTPS enabled" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Backend .env file already exists" -ForegroundColor Blue
}

# Frontend environment setup
if (-not (Test-Path "frontend\.env")) {
    Write-Host "📄 Creating frontend .env file..." -ForegroundColor Cyan
    Copy-Item "frontend\.env.example" "frontend\.env"
    
    # Update backend URL for HTTPS
    $envContent = Get-Content "frontend\.env"
    $envContent = $envContent -replace "VITE_BACKEND_URL=http://localhost:4000", "VITE_BACKEND_URL=https://localhost:4000"
    $envContent = $envContent + "`nENABLE_HTTPS=true"
    $envContent | Set-Content "frontend\.env"
    
    Write-Host "✅ Frontend .env file created with HTTPS enabled" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Frontend .env file already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎉 HTTPS Development Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start with HTTPS:" -ForegroundColor Cyan
Write-Host "   Backend:  cd backend && npm run https" -ForegroundColor White
Write-Host "   Frontend: cd frontend && npm run https" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  https://localhost:4000" -ForegroundColor White
Write-Host "   Frontend: https://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: You may see a browser security warning for self-signed certificates." -ForegroundColor Yellow
Write-Host "   This is normal for development. Click Advanced and Proceed to localhost." -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 To disable HTTPS and return to HTTP:" -ForegroundColor Cyan
Write-Host "   Set ENABLE_HTTPS=false in both .env files" -ForegroundColor White
