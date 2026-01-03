# Arisegenius Auto-Start Script
# This script ensures all Docker containers start automatically

Write-Host "🚀 Starting Arisegenius Services..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Start all services
Write-Host "📦 Starting containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services available at:" -ForegroundColor Cyan
    Write-Host "  - Frontend: http://localhost:3001" -ForegroundColor White
    Write-Host "  - Backend API: http://localhost:3000" -ForegroundColor White
    Write-Host "  - API Docs: http://localhost:3000/api-docs" -ForegroundColor White
    Write-Host ""
    
    # Show container status
    Write-Host "Container Status:" -ForegroundColor Cyan
    docker-compose ps
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    exit 1
}

