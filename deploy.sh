#!/bin/bash

# Arisegenius Deployment Script
# This script handles the deployment of the Arisegenius backend API

set -e

echo "🚀 Starting Arisegenius deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

# Error function
error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Success function
success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

# Warning function
warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if Docker is installed
check_docker() {
    log "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    log "Checking environment configuration..."
    if [ ! -f .env ]; then
        warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            warning "Please update .env file with your configuration before continuing."
            read -p "Press Enter to continue after updating .env file..."
        else
            error ".env file not found and no .env.example available."
        fi
    fi
    success "Environment configuration found"
}

# Backup database
backup_database() {
    log "Creating database backup..."
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker-compose -f $DOCKER_COMPOSE_FILE ps postgres | grep -q "Up"; then
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_dump -U arisegenius_user arisegenius_db > $BACKUP_FILE
        success "Database backup created: $BACKUP_FILE"
    else
        warning "PostgreSQL container is not running. Skipping backup."
    fi
}

# Build and start services
deploy_services() {
    log "Building and starting services..."
    
    # Pull latest images
    docker-compose -f $DOCKER_COMPOSE_FILE pull
    
    # Build custom images
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    # Start services
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    log "Waiting for PostgreSQL..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_isready -U arisegenius_user -d arisegenius_db &> /dev/null; then
            success "PostgreSQL is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        error "PostgreSQL failed to start within 60 seconds"
    fi
    
    # Wait for Redis
    log "Waiting for Redis..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping &> /dev/null; then
            success "Redis is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        error "Redis failed to start within 30 seconds"
    fi
    
    # Wait for API
    log "Waiting for API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            success "API is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        error "API failed to start within 60 seconds"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Generate Prisma client
    docker-compose -f $DOCKER_COMPOSE_FILE exec api npx prisma generate
    
    # Run migrations
    docker-compose -f $DOCKER_COMPOSE_FILE exec api npx prisma migrate deploy
    
    success "Database migrations completed"
}

# Seed database (optional)
seed_database() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log "Seeding database with sample data..."
        docker-compose -f $DOCKER_COMPOSE_FILE exec api npm run seed
        success "Database seeded successfully"
    else
        log "Skipping database seeding in production environment"
    fi
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check API health
    if curl -f http://localhost:3000/health &> /dev/null; then
        success "API health check passed"
    else
        error "API health check failed"
    fi
    
    # Check database connection
    if docker-compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_isready -U arisegenius_user -d arisegenius_db &> /dev/null; then
        success "Database health check passed"
    else
        error "Database health check failed"
    fi
    
    # Check Redis connection
    if docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli ping &> /dev/null; then
        success "Redis health check passed"
    else
        error "Redis health check failed"
    fi
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo ""
    echo "📊 Service Status:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    echo ""
    echo "🌐 API Endpoints:"
    echo "  - Health Check: http://localhost:3000/health"
    echo "  - API Documentation: http://localhost:3000/api-docs"
    echo "  - Frontend: http://localhost:8080"
    echo ""
    echo "📝 Logs:"
    echo "  - API Logs: docker-compose logs -f api"
    echo "  - Database Logs: docker-compose logs -f postgres"
    echo "  - All Logs: docker-compose logs -f"
    echo ""
    echo "🔧 Management Commands:"
    echo "  - Stop services: docker-compose down"
    echo "  - Restart services: docker-compose restart"
    echo "  - View logs: docker-compose logs -f [service]"
    echo "  - Access database: docker-compose exec postgres psql -U arisegenius_user -d arisegenius_db"
}

# Cleanup function
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting Arisegenius deployment for $ENVIRONMENT environment..."
    
    check_docker
    check_env
    backup_database
    deploy_services
    wait_for_services
    run_migrations
    seed_database
    check_health
    cleanup
    show_status
    
    success "🎉 Arisegenius deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
}

# Handle script interruption
trap 'error "Deployment interrupted by user"' INT TERM

# Run main function
main "$@"
