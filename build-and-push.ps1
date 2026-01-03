# Arisegenius Docker Build and Push Script (PowerShell)
# This script builds Docker images and pushes them to Docker Hub

$ErrorActionPreference = "Stop"

# Configuration
$DOCKER_USERNAME = if ($env:DOCKER_USERNAME) { $env:DOCKER_USERNAME } else { "arisegenius" }
$DOCKER_PASSWORD = $env:DOCKER_PASSWORD
$IMAGE_PREFIX = "${DOCKER_USERNAME}/arisegenius"
$BACKEND_IMAGE = "${IMAGE_PREFIX}-backend"
$FRONTEND_IMAGE = "${IMAGE_PREFIX}-frontend"
$VERSION = if ($env:VERSION) { $env:VERSION } else { "latest" }

Write-Host "🚀 Arisegenius Docker Build and Push Script" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker daemon is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Function to check Docker login status
function Test-DockerLogin {
    $dockerInfo = docker info 2>&1
    return $dockerInfo -match "Username"
}

# Function to login to Docker Hub
function Connect-DockerHub {
    Write-Host "📝 Logging in to Docker Hub..." -ForegroundColor Yellow
    
    if ([string]::IsNullOrEmpty($DOCKER_PASSWORD)) {
        Write-Host "⚠️  DOCKER_PASSWORD not set. Attempting interactive login..." -ForegroundColor Yellow
        docker login -u $DOCKER_USERNAME
    } else {
        $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully logged in to Docker Hub" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to login to Docker Hub" -ForegroundColor Red
        exit 1
    }
}

# Check if already logged in, if not, login
if (-not (Test-DockerLogin)) {
    Connect-DockerHub
} else {
    Write-Host "✅ Already logged in to Docker Hub" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Green
Write-Host ""

# Build backend image
Write-Host "Building backend image..." -ForegroundColor Yellow
Set-Location backend
docker build -t "${BACKEND_IMAGE}:${VERSION}" -t "${BACKEND_IMAGE}:latest" .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend image built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build backend image" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Build frontend image
Write-Host "Building frontend image..." -ForegroundColor Yellow
Set-Location frontend
docker build -t "${FRONTEND_IMAGE}:${VERSION}" -t "${FRONTEND_IMAGE}:latest" .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend image built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build frontend image" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "📤 Pushing images to Docker Hub..." -ForegroundColor Green
Write-Host ""

# Push backend image
Write-Host "Pushing backend image..." -ForegroundColor Yellow
docker push "${BACKEND_IMAGE}:${VERSION}"
docker push "${BACKEND_IMAGE}:latest"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend image pushed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push backend image" -ForegroundColor Red
    exit 1
}

# Push frontend image
Write-Host "Pushing frontend image..." -ForegroundColor Yellow
docker push "${FRONTEND_IMAGE}:${VERSION}"
docker push "${FRONTEND_IMAGE}:latest"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend image pushed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push frontend image" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All images built and pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Images pushed:"
Write-Host "  - ${BACKEND_IMAGE}:${VERSION}"
Write-Host "  - ${BACKEND_IMAGE}:latest"
Write-Host "  - ${FRONTEND_IMAGE}:${VERSION}"
Write-Host "  - ${FRONTEND_IMAGE}:latest"
Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green

