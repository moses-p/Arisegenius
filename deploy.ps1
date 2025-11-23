# Arisegenius Deployment Script for Windows
# This script handles the deployment of the Arisegenius backend API

param(
    [string]$Environment = "production"
)

# Configuration
$DockerComposeFile = "docker-compose.yml"
$BackupDir = "./backups"
$LogFile = "./deployment.log"

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force
}

# Log function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Error function
function Write-Error-Log {
    param([string]$Message)
    Write-Log $Message "ERROR"
    Write-Host "Deployment failed. Check $LogFile for details." -ForegroundColor Red
    exit 1
}

# Success function
function Write-Success-Log {
    param([string]$Message)
    Write-Log $Message "SUCCESS"
    Write-Host $Message -ForegroundColor Green
}

# Warning function
function Write-Warning-Log {
    param([string]$Message)
    Write-Log $Message "WARNING"
    Write-Host $Message -ForegroundColor Yellow
}

# Check if Docker is installed
function Test-Docker {
    Write-Log "Checking Docker installation..."
    
    try {
        $dockerVersion = docker --version
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Log "Docker is not installed or not in PATH"
        }
        Write-Success-Log "Docker is installed: $dockerVersion"
    }
    catch {
        Write-Error-Log "Docker is not installed. Please install Docker Desktop first."
    }
    
    try {
        $composeVersion = docker-compose --version
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Log "Docker Compose is not installed or not in PATH"
        }
        Write-Success-Log "Docker Compose is installed: $composeVersion"
    }
    catch {
        Write-Error-Log "Docker Compose is not installed. Please install Docker Compose first."
    }
}

# Check if .env file exists
function Test-Environment {
    Write-Log "Checking environment configuration..."
    
    if (!(Test-Path ".env")) {
        Write-Warning-Log ".env file not found. Creating from .env.example..."
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Warning-Log "Please update .env file with your configuration before continuing."
            Read-Host "Press Enter to continue after updating .env file"
        }
        else {
            Write-Error-Log ".env file not found and no .env.example available."
        }
    }
    Write-Success-Log "Environment configuration found"
}

# Backup database
function Backup-Database {
    Write-Log "Creating database backup..."
    $BackupFile = "$BackupDir/backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    
    try {
        $postgresStatus = docker-compose -f $DockerComposeFile ps postgres
        if ($postgresStatus -match "Up") {
            docker-compose -f $DockerComposeFile exec -T postgres pg_dump -U arisegenius_user arisegenius_db | Out-File -FilePath $BackupFile -Encoding UTF8
            Write-Success-Log "Database backup created: $BackupFile"
        }
        else {
            Write-Warning-Log "PostgreSQL container is not running. Skipping backup."
        }
    }
    catch {
        Write-Warning-Log "Failed to create database backup: $($_.Exception.Message)"
    }
}

# Deploy services
function Deploy-Services {
    Write-Log "Building and starting services..."
    
    try {
        # Pull latest images
        Write-Log "Pulling latest images..."
        docker-compose -f $DockerComposeFile pull
        
        # Build custom images
        Write-Log "Building custom images..."
        docker-compose -f $DockerComposeFile build --no-cache
        
        # Start services
        Write-Log "Starting services..."
        docker-compose -f $DockerComposeFile up -d
        
        Write-Success-Log "Services started successfully"
    }
    catch {
        Write-Error-Log "Failed to deploy services: $($_.Exception.Message)"
    }
}

# Wait for services to be healthy
function Wait-For-Services {
    Write-Log "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    Write-Log "Waiting for PostgreSQL..."
    $timeout = 60
    while ($timeout -gt 0) {
        try {
            $result = docker-compose -f $DockerComposeFile exec -T postgres pg_isready -U arisegenius_user -d arisegenius_db 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success-Log "PostgreSQL is ready"
                break
            }
        }
        catch {
            # Continue waiting
        }
        Start-Sleep -Seconds 2
        $timeout -= 2
    }
    
    if ($timeout -le 0) {
        Write-Error-Log "PostgreSQL failed to start within 60 seconds"
    }
    
    # Wait for Redis
    Write-Log "Waiting for Redis..."
    $timeout = 30
    while ($timeout -gt 0) {
        try {
            $result = docker-compose -f $DockerComposeFile exec -T redis redis-cli ping 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success-Log "Redis is ready"
                break
            }
        }
        catch {
            # Continue waiting
        }
        Start-Sleep -Seconds 2
        $timeout -= 2
    }
    
    if ($timeout -le 0) {
        Write-Error-Log "Redis failed to start within 30 seconds"
    }
    
    # Wait for API
    Write-Log "Waiting for API..."
    $timeout = 60
    while ($timeout -gt 0) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success-Log "API is ready"
                break
            }
        }
        catch {
            # Continue waiting
        }
        Start-Sleep -Seconds 2
        $timeout -= 2
    }
    
    if ($timeout -le 0) {
        Write-Error-Log "API failed to start within 60 seconds"
    }
}

# Run database migrations
function Invoke-Migrations {
    Write-Log "Running database migrations..."
    
    try {
        # Generate Prisma client
        Write-Log "Generating Prisma client..."
        docker-compose -f $DockerComposeFile exec api npx prisma generate
        
        # Run migrations
        Write-Log "Running database migrations..."
        docker-compose -f $DockerComposeFile exec api npx prisma migrate deploy
        
        Write-Success-Log "Database migrations completed"
    }
    catch {
        Write-Error-Log "Failed to run migrations: $($_.Exception.Message)"
    }
}

# Seed database (optional)
function Invoke-Seed {
    if ($Environment -eq "development") {
        Write-Log "Seeding database with sample data..."
        try {
            docker-compose -f $DockerComposeFile exec api npm run seed
            Write-Success-Log "Database seeded successfully"
        }
        catch {
            Write-Warning-Log "Failed to seed database: $($_.Exception.Message)"
        }
    }
    else {
        Write-Log "Skipping database seeding in production environment"
    }
}

# Check service health
function Test-Health {
    Write-Log "Checking service health..."
    
    # Check API health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success-Log "API health check passed"
        }
        else {
            Write-Error-Log "API health check failed with status: $($response.StatusCode)"
        }
    }
    catch {
        Write-Error-Log "API health check failed: $($_.Exception.Message)"
    }
    
    # Check database connection
    try {
        $result = docker-compose -f $DockerComposeFile exec -T postgres pg_isready -U arisegenius_user -d arisegenius_db 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success-Log "Database health check passed"
        }
        else {
            Write-Error-Log "Database health check failed"
        }
    }
    catch {
        Write-Error-Log "Database health check failed: $($_.Exception.Message)"
    }
    
    # Check Redis connection
    try {
        $result = docker-compose -f $DockerComposeFile exec -T redis redis-cli ping 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success-Log "Redis health check passed"
        }
        else {
            Write-Error-Log "Redis health check failed"
        }
    }
    catch {
        Write-Error-Log "Redis health check failed: $($_.Exception.Message)"
    }
}

# Show deployment status
function Show-Status {
    Write-Log "Deployment Status:"
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    docker-compose -f $DockerComposeFile ps
    Write-Host ""
    Write-Host "🌐 API Endpoints:" -ForegroundColor Cyan
    Write-Host "  - Health Check: http://localhost:3000/health"
    Write-Host "  - API Documentation: http://localhost:3000/api-docs"
    Write-Host "  - Frontend: http://localhost:8080"
    Write-Host ""
    Write-Host "📝 Logs:" -ForegroundColor Cyan
    Write-Host "  - API Logs: docker-compose logs -f api"
    Write-Host "  - Database Logs: docker-compose logs -f postgres"
    Write-Host "  - All Logs: docker-compose logs -f"
    Write-Host ""
    Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
    Write-Host "  - Stop services: docker-compose down"
    Write-Host "  - Restart services: docker-compose restart"
    Write-Host "  - View logs: docker-compose logs -f [service]"
    Write-Host "  - Access database: docker-compose exec postgres psql -U arisegenius_user -d arisegenius_db"
}

# Cleanup function
function Invoke-Cleanup {
    Write-Log "Cleaning up old Docker images..."
    try {
        docker image prune -f
        Write-Success-Log "Cleanup completed"
    }
    catch {
        Write-Warning-Log "Cleanup failed: $($_.Exception.Message)"
    }
}

# Main deployment function
function Start-Deployment {
    Write-Log "Starting Arisegenius deployment for $Environment environment..."
    
    Test-Docker
    Test-Environment
    Backup-Database
    Deploy-Services
    Wait-For-Services
    Invoke-Migrations
    Invoke-Seed
    Test-Health
    Invoke-Cleanup
    Show-Status
    
    Write-Success-Log "🎉 Arisegenius deployment completed successfully!"
    Write-Log "Deployment log saved to: $LogFile"
}

# Run main function
try {
    Start-Deployment
}
catch {
    Write-Error-Log "Deployment failed: $($_.Exception.Message)"
}
