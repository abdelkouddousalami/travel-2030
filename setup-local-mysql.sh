#!/bin/bash

# ============================================================================
# Travel2030 - Local MySQL Database Setup Script
# This script creates the database and user for local development
# ============================================================================

echo "=================================================="
echo "  Travel2030 - Local MySQL Database Setup        "
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database credentials
DB_NAME="travel2030"
DB_USER="root"
DB_PASS=""

echo -e "${BLUE}[INFO]${NC} Checking MySQL installation..."

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} MySQL client not found!"
    echo "Please install MySQL:"
    echo "  Ubuntu/Debian: sudo apt install mysql-server mysql-client"
    echo "  Fedora/RHEL:   sudo dnf install mysql-server"
    echo "  macOS:         brew install mysql"
    exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} MySQL client found!"
echo ""

# Check if MySQL service is running
if ! systemctl is-active --quiet mysql 2>/dev/null && ! systemctl is-active --quiet mysqld 2>/dev/null; then
    echo -e "${YELLOW}[WARNING]${NC} MySQL service is not running."
    echo "Starting MySQL service..."
    
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mysql || sudo systemctl start mysqld
        echo -e "${GREEN}[SUCCESS]${NC} MySQL service started!"
    else
        echo -e "${RED}[ERROR]${NC} Could not start MySQL service automatically."
        echo "Please start MySQL manually and run this script again."
        exit 1
    fi
fi

echo -e "${GREEN}[SUCCESS]${NC} MySQL service is running!"
echo ""

# Prompt for root password
echo -e "${BLUE}[INFO]${NC} This script will create:"
echo "  - Database: ${DB_NAME}"
echo "  - User:     ${DB_USER}"
echo "  - Password: ${DB_PASS}"
echo ""
read -sp "Enter your MySQL root password: " ROOT_PASS
echo ""

# Execute SQL script
echo -e "${BLUE}[INFO]${NC} Creating database and user..."

mysql -u root -p"${ROOT_PASS}" <<EOF
-- Create database
CREATE DATABASE IF NOT EXISTS ${DB_NAME}
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Drop user if exists
DROP USER IF EXISTS '${DB_USER}'@'localhost';

-- Create user
CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';

-- Grant privileges
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Show confirmation
SELECT 'Database and user created successfully!' AS Status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}[SUCCESS]${NC} Database setup completed!"
    echo ""
    echo "=================================================="
    echo "  Database Configuration                         "
    echo "=================================================="
    echo "  Database: ${DB_NAME}"
    echo "  User:     ${DB_USER}"
    echo "  Password: ${DB_PASS}"
    echo "  Host:     localhost"
    echo "  Port:     3306"
    echo "=================================================="
    echo ""
    echo -e "${BLUE}[INFO]${NC} Testing connection..."
    
    # Test connection
    if mysql -u "${DB_USER}" -p"${DB_PASS}" -e "USE ${DB_NAME}; SELECT 'Connection successful!' AS Status;" 2>/dev/null; then
        echo -e "${GREEN}[SUCCESS]${NC} Connection test passed!"
        echo ""
        echo "You can now start the backend:"
        echo "  cd backend && mvn spring-boot:run"
    else
        echo -e "${RED}[ERROR]${NC} Connection test failed!"
    fi
else
    echo ""
    echo -e "${RED}[ERROR]${NC} Database setup failed!"
    echo "Please check your MySQL root password and try again."
    exit 1
fi

echo ""
echo "=================================================="
