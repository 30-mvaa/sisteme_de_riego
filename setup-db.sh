#!/bin/bash

# Chuichun Database Setup Script
# PostgreSQL 17 + PostgREST

echo "🚀 Setting up Chuichun Database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL 17 first."
    echo "   On macOS with Homebrew: brew services start postgresql@17"
    exit 1
fi

# Database connection
DB_USER="postgres"
DB_NAME="chuichun_db"
DB_PASSWORD="password"

echo "📦 Creating database and user..."

# Create database
createdb -h localhost -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists"

# Create user and grant permissions
psql -h localhost -U $DB_USER -d postgres -c "
CREATE USER chuichun_user WITH PASSWORD '$DB_PASSWORD';
ALTER USER chuichun_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO chuuchun_user;
" 2>/dev/null || echo "User already exists"

echo "🏗️  Creating schema..."
psql -h localhost -U $DB_USER -d $DB_NAME -f database/schema.sql

echo "🌱 Seeding initial data..."
node database/seed.js

echo "🔧 Setting up PostgREST..."
# Update configuration with actual password
sed -i '' "s/username:password/chuichun_user:$DB_PASSWORD/g" postgrest.conf
sed -i '' "s/postgres/chuichun_user/g" postgrest.conf

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your actual database credentials"
echo "2. Start PostgREST: postgrest postgrest.conf"
echo "3. Start Next.js: pnpm dev"
echo ""
echo "🔐 Default credentials:"
echo "   Admin: admin / admin123"
echo "   User:  user1 / user123"
