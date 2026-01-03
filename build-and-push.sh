#!/bin/bash

# Arisegenius Docker Build and Push Script
# This script builds Docker images and pushes them to Docker Hub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-arisegenius}"
DOCKER_PASSWORD="${DOCKER_PASSWORD:-}"
IMAGE_PREFIX="${DOCKER_USERNAME}/arisegenius"
BACKEND_IMAGE="${IMAGE_PREFIX}-backend"
FRONTEND_IMAGE="${IMAGE_PREFIX}-frontend"
VERSION="${VERSION:-latest}"

echo -e "${GREEN}🚀 Arisegenius Docker Build and Push Script${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running. Please start Docker Desktop and try again.${NC}"
    exit 1
fi

# Function to check Docker login status
check_docker_login() {
    if docker info | grep -q "Username"; then
        return 0
    else
        return 1
    fi
}

# Function to login to Docker Hub
docker_login() {
    echo -e "${YELLOW}📝 Logging in to Docker Hub...${NC}"
    
    if [ -z "$DOCKER_PASSWORD" ]; then
        echo -e "${YELLOW}⚠️  DOCKER_PASSWORD not set. Attempting interactive login...${NC}"
        docker login -u "$DOCKER_USERNAME"
    else
        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully logged in to Docker Hub${NC}"
    else
        echo -e "${RED}❌ Failed to login to Docker Hub${NC}"
        exit 1
    fi
}

# Check if already logged in, if not, login
if ! check_docker_login; then
    docker_login
else
    echo -e "${GREEN}✅ Already logged in to Docker Hub${NC}"
fi

echo ""
echo -e "${GREEN}🔨 Building Docker images...${NC}"
echo ""

# Build backend image
echo -e "${YELLOW}Building backend image...${NC}"
cd backend
docker build -t "${BACKEND_IMAGE}:${VERSION}" -t "${BACKEND_IMAGE}:latest" .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build backend image${NC}"
    exit 1
fi
cd ..

# Build frontend image
echo -e "${YELLOW}Building frontend image...${NC}"
cd frontend
docker build -t "${FRONTEND_IMAGE}:${VERSION}" -t "${FRONTEND_IMAGE}:latest" .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build frontend image${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}📤 Pushing images to Docker Hub...${NC}"
echo ""

# Push backend image
echo -e "${YELLOW}Pushing backend image...${NC}"
docker push "${BACKEND_IMAGE}:${VERSION}"
docker push "${BACKEND_IMAGE}:latest"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push backend image${NC}"
    exit 1
fi

# Push frontend image
echo -e "${YELLOW}Pushing frontend image...${NC}"
docker push "${FRONTEND_IMAGE}:${VERSION}"
docker push "${FRONTEND_IMAGE}:latest"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push frontend image${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All images built and pushed successfully!${NC}"
echo ""
echo "Images pushed:"
echo "  - ${BACKEND_IMAGE}:${VERSION}"
echo "  - ${BACKEND_IMAGE}:latest"
echo "  - ${FRONTEND_IMAGE}:${VERSION}"
echo "  - ${FRONTEND_IMAGE}:latest"
echo ""
echo -e "${GREEN}🎉 Done!${NC}"

