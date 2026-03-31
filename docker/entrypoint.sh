#!/bin/sh
set -e

# Start PHP-FPM in the background, listening on localhost:9001
php-fpm -D

# Start Nginx in the foreground (keeps the container alive)
exec nginx -g "daemon off;"
