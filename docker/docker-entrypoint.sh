#!/bin/sh
set -e

# Ensure log dirs
mkdir -p /var/log/nginx

# Start php-fpm as a daemon (so nginx can run in foreground)
echo "Starting php-fpm..."
php-fpm -D

# Start nginx in foreground
echo "Starting nginx..."
nginx -g 'daemon off;'
