-- Create user for Arisegenius project
CREATE USER arisegenius_user WITH PASSWORD 'arisegenius_password';

-- Create database
CREATE DATABASE arisegenius_db OWNER arisegenius_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE arisegenius_db TO arisegenius_user;

-- Connect to the new database and grant schema privileges
\c arisegenius_db
GRANT ALL ON SCHEMA public TO arisegenius_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO arisegenius_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO arisegenius_user;

