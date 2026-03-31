#!/bin/sh
set -e

# Generate nginx config from template
if [ -f /etc/nginx/conf.d/default.template.conf ]; then
  echo "Generating nginx config from template"
  /usr/bin/envsubst '\$PORT \$FPM_HOST' < /etc/nginx/conf.d/default.template.conf > /etc/nginx/conf.d/default.conf
fi

# Ensure log dirs
mkdir -p /var/log/nginx

# Start php-fpm as a daemon (so nginx can run in foreground)
echo "Starting php-fpm..."
php-fpm -D

# Start nginx in foreground
echo "Starting nginx..."
nginx -g 'daemon off;'
