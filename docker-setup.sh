#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Docker Setup for tracker-bpkp..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️ Please update your .env file with correct database credentials."
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose up -d --build

# Wait for DB to be ready
echo "Waiting for database to be ready..."
sleep 5

# Generate App Key if not set
if ! grep -q "APP_KEY=base64" .env; then
    echo "Generating app key..."
    docker-compose exec app php artisan key:generate
fi

# Run migrations
echo "Running migrations..."
docker-compose exec app php artisan migrate --force

# Link storage
echo "Linking storage..."
docker-compose exec app php artisan storage:link

echo "✅ Docker setup complete!"
echo "🌐 Access your app at http://localhost:8080"
