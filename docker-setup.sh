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

# Install PHP dependencies inside the running container (create vendor when host bind-mount hides image files)
echo "Installing PHP dependencies (composer)..."
# Use --no-scripts to avoid running artisan during composer install (DB or other services may not be ready yet)
docker-compose exec app composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts || {
    echo "Composer install failed in container. You may need to run it manually.";
}

# Build frontend assets (Vite) on the host via a temporary Node container when manifest is missing
if [ ! -f public/build/manifest.json ]; then
    echo "Vite manifest not found. Building frontend assets using a temporary Node container..."
    # Use docker run so we don't require Node on the host. This will write into the host-mounted project directory.
    docker run --rm -v "$(pwd)":/var/www/html -w /var/www/html node:20-alpine sh -lc "npm ci --prefer-offline --no-audit --silent && npm run build" || {
        echo "Frontend build failed inside temporary Node container. You can run locally with 'npm ci && npm run build' if you have Node installed.";
    }
else
    echo "Vite manifest found; skipping frontend build."
fi

# Generate App Key if not set (safe to run without DB)
if ! grep -q "^APP_KEY=" .env || grep -q "^APP_KEY=$" .env; then
    echo "Generating app key..."
    docker-compose exec app php artisan key:generate || echo "Failed to generate app key inside container. You can run: docker-compose exec app php artisan key:generate"
fi

# Determine DB connection from .env
DB_CONN=$(grep -E '^DB_CONNECTION=' .env | cut -d'=' -f2 || echo "")

if [ "$DB_CONN" = "sqlite" ] || [ -z "$DB_CONN" ]; then
    echo "Detected DB_CONNECTION='$DB_CONN'. Skipping artisan commands that require DB."
    echo "⚠️  Please update your .env with correct database credentials and run migrations manually inside the container when ready."
    echo "You can run: docker-compose exec app php artisan migrate --force"
else
    # Run migrations
    echo "Running migrations..."
    docker-compose exec app php artisan migrate --force

    # Link storage
    echo "Linking storage..."
    docker-compose exec app php artisan storage:link
fi

# Optionally run seeders if user enabled it via .env (set RUN_SEEDERS=true)
RUN_SEEDERS=$(grep -E '^RUN_SEEDERS=' .env | cut -d'=' -f2 || echo "false")
if [ "$RUN_SEEDERS" = "true" ] || [ "$RUN_SEEDERS" = "1" ]; then
    echo "RUN_SEEDERS is enabled. Running database seeders..."
    docker-compose exec app php artisan db:seed --force || echo "Seeding failed. You can run: docker-compose exec app php artisan db:seed --force"
else
    echo "RUN_SEEDERS not enabled. Skipping database seeding."
fi

echo "✅ Docker setup complete!"
echo "🌐 Access your app at http://localhost:8080"
