#!/bin/sh
set -e

# Generate nginx config from template (Alpine reads /etc/nginx/http.d/)
# ensure default values for env vars used by the template
# Generate nginx config from template
: ${PORT:=80}
: ${FPM_HOST:=127.0.0.1}
export PORT
export FPM_HOST

TEMPLATE_PATH=/etc/nginx/templates/default.template.conf
if [ -f "$TEMPLATE_PATH" ]; then
  echo "Generating nginx config from template (PORT=$PORT, FPM_HOST=$FPM_HOST)"
  mkdir -p /etc/nginx/conf.d
  /usr/bin/envsubst '${PORT} ${FPM_HOST}' < "$TEMPLATE_PATH" > /etc/nginx/conf.d/default.conf
fi

# Ensure log dirs
mkdir -p /var/log/nginx

# Start php-fpm as a daemon (so nginx can run in foreground)
echo "Starting php-fpm..."
php-fpm -D

# Start nginx in foreground
echo "Starting nginx..."
nginx -g 'daemon off;'
