#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Running migrations..."
php artisan migrate --force

# Optional (recommended Laravel)
php artisan config:cache
php artisan route:cache

# Ensure log dirs
mkdir -p /var/log/nginx

echo "Starting php-fpm..."
php-fpm -D

echo "Starting nginx..."
exec nginx -g 'daemon off;'