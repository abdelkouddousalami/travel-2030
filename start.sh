#!/bin/bash

# Travel2030 - Startup Script
# This script starts both backend (Spring Boot) and frontend (Angular)

echo "=================================================="
echo "       TRAVEL2030 - Starting Application         "
echo "=================================================="
echo ""

# Set Java 17
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}[INFO]${NC} Java Version:"
java -version

echo ""
echo -e "${BLUE}[INFO]${NC} Checking MySQL connection..."
if mysql -u travel2030_user -ptravel2030_pass -e "USE travel2030;" 2>/dev/null; then
    echo -e "${GREEN}[SUCCESS]${NC} MySQL is running and database 'travel2030' is accessible"
else
    echo -e "${RED}[WARNING]${NC} Cannot connect to local MySQL!"
    echo "Please run: ./setup-local-mysql.sh"
    echo "Or manually create database and user (see setup-local-mysql.sql)"
    exit 1
fi

echo ""
echo -e "${BLUE}[INFO]${NC} Starting Backend (Spring Boot) on port 8085..."
cd "$BACKEND_DIR"
mvn spring-boot:run > /tmp/travel2030-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}[SUCCESS]${NC} Backend started with PID: $BACKEND_PID"
echo "         Logs: /tmp/travel2030-backend.log"

# Wait for backend to start
echo -e "${BLUE}[INFO]${NC} Waiting for backend to start..."
sleep 10

# Check if backend is running
for i in {1..30}; do
    if curl -s http://localhost:8085/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}[SUCCESS]${NC} Backend is ready!"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

echo ""
echo -e "${BLUE}[INFO]${NC} Starting Frontend (Angular) on port 4200..."
cd "$FRONTEND_DIR"
npm start > /tmp/travel2030-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}[SUCCESS]${NC} Frontend started with PID: $FRONTEND_PID"
echo "         Logs: /tmp/travel2030-frontend.log"

echo ""
echo "=================================================="
echo -e "${GREEN}       TRAVEL2030 Application Started!          ${NC}"
echo "=================================================="
echo ""
echo "Backend:  http://localhost:8085/api"
echo "Frontend: http://localhost:4200"
echo ""
echo "Backend Health:  http://localhost:8085/api/health"
echo "API Docs:        (coming soon)"
echo ""
echo "Process IDs:"
echo "  Backend:  $BACKEND_PID"
echo "  Frontend: $FRONTEND_PID"
echo ""
echo "To stop the application:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  MySQL will continue running (local service)"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/travel2030-backend.log"
echo "  Frontend: tail -f /tmp/travel2030-frontend.log"
echo "=================================================="
