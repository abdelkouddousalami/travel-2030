-- ============================================================================
-- Travel2030 - Local MySQL Database Setup Script
-- Execute this script to create the database and user for local development
-- ============================================================================

-- Connect to MySQL as root:
-- mysql -u root -p

-- ============================================================================
-- 1. CREATE DATABASE
-- ============================================================================
CREATE DATABASE IF NOT EXISTS travel2030
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ============================================================================
-- 2. CREATE USER & GRANT PRIVILEGES
-- ============================================================================
-- Drop user if exists (for fresh setup)
DROP USER IF EXISTS 'travel2030_user'@'localhost';

-- Create user with password
CREATE USER 'travel2030_user'@'localhost' IDENTIFIED BY 'travel2030_pass';

-- Grant all privileges on travel2030 database
GRANT ALL PRIVILEGES ON travel2030.* TO 'travel2030_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- ============================================================================
-- 3. VERIFY SETUP
-- ============================================================================
-- Show databases
SHOW DATABASES LIKE 'travel2030';

-- Show user grants
SHOW GRANTS FOR 'travel2030_user'@'localhost';

-- ============================================================================
-- 4. TEST CONNECTION
-- ============================================================================
-- Exit and reconnect with new user:
-- mysql -u travel2030_user -p travel2030
-- Enter password: travel2030_pass

-- ============================================================================
-- NOTES
-- ============================================================================
-- Database: travel2030
-- User:     travel2030_user
-- Password: travel2030_pass
-- Charset:  utf8mb4
-- Collation: utf8mb4_unicode_ci
-- 
-- Spring Boot will automatically create tables on first run with ddl-auto=update
-- ============================================================================
