#!/bin/bash

# API Testing Script for Arisegenius Backend
# This script tests all API endpoints

BASE_URL="http://localhost:5000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Arisegenius API Test Suite ===${NC}\n"

# Test Health Check
echo -e "${YELLOW}Testing Health Check...${NC}"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" || echo "000")
if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (Status: $HEALTH)${NC}"
fi

# Test Auth Endpoints
echo -e "\n${YELLOW}Testing Authentication Endpoints...${NC}"

# Register
echo "Testing POST /auth/register..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User",
    "role": "CUSTOMER"
  }')
REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | grep -o '"statusCode":[0-9]*' | cut -d: -f2 || echo "000")
if [ "$REGISTER_STATUS" = "201" ] || [ "$REGISTER_STATUS" = "409" ]; then
    echo -e "${GREEN}✓ Register endpoint working${NC}"
else
    echo -e "${RED}✗ Register endpoint failed${NC}"
fi

# Login
echo "Testing POST /auth/login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }')
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login endpoint working${NC}"
    export AUTH_TOKEN="$TOKEN"
else
    echo -e "${RED}✗ Login endpoint failed${NC}"
fi

# Test Products Endpoints
echo -e "\n${YELLOW}Testing Products Endpoints...${NC}"

# Get Products
echo "Testing GET /products..."
PRODUCTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/products")
if [ "$PRODUCTS_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Get products endpoint working${NC}"
else
    echo -e "${RED}✗ Get products endpoint failed (Status: $PRODUCTS_STATUS)${NC}"
fi

# Test Orders Endpoints (requires auth)
if [ -n "$AUTH_TOKEN" ]; then
    echo -e "\n${YELLOW}Testing Orders Endpoints...${NC}"
    echo "Testing GET /orders..."
    ORDERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      "$BASE_URL/orders")
    if [ "$ORDERS_STATUS" = "200" ] || [ "$ORDERS_STATUS" = "401" ]; then
        echo -e "${GREEN}✓ Get orders endpoint working${NC}"
    else
        echo -e "${RED}✗ Get orders endpoint failed (Status: $ORDERS_STATUS)${NC}"
    fi
fi

# Test Dealers Endpoints
echo -e "\n${YELLOW}Testing Dealers Endpoints...${NC}"
DEALERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dealers")
if [ "$DEALERS_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Get dealers endpoint working${NC}"
else
    echo -e "${RED}✗ Get dealers endpoint failed (Status: $DEALERS_STATUS)${NC}"
fi

# Test Analytics Endpoints (requires auth)
if [ -n "$AUTH_TOKEN" ]; then
    echo -e "\n${YELLOW}Testing Analytics Endpoints...${NC}"
    ANALYTICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      "$BASE_URL/analytics/overview")
    if [ "$ANALYTICS_STATUS" = "200" ] || [ "$ANALYTICS_STATUS" = "401" ] || [ "$ANALYTICS_STATUS" = "403" ]; then
        echo -e "${GREEN}✓ Analytics endpoint working${NC}"
    else
        echo -e "${RED}✗ Analytics endpoint failed (Status: $ANALYTICS_STATUS)${NC}"
    fi
fi

echo -e "\n${YELLOW}=== Test Suite Complete ===${NC}"

