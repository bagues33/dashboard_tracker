# --- Stage 1: PHP Dependencies ---
FROM php:8.4-fpm-alpine as vendor

WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    postgresql-dev \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_pgsql \
    zip \
    gd \
    intl \
    bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

# --- Stage 2: Frontend build ---
FROM node:20-alpine as frontend

WORKDIR /var/www/html

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
 # Make PHP vendor files available to the frontend stage so SSR build
 # can resolve imports like "../../vendor/tightenco/ziggy".
 COPY --from=vendor /var/www/html/vendor ./vendor
 RUN npm run build

# --- Stage 3: Final Production Image ---
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

# Install system dependencies for runtime (including Nginx)
RUN apk add --no-cache \
    libzip \
    libpng \
    libjpeg-turbo \
    postgresql-client \
    icu-libs \
    nginx

# Install Composer in final image so we can run `composer install` at container runtime
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# Install PHP extensions for runtime
RUN apk add --no-cache --virtual .build-deps \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    postgresql-dev \
    icu-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    zip \
    gd \
    intl \
    bcmath \
    && apk del .build-deps

# Copy application files
COPY . .

# Copy vendor from vendor stage
COPY --from=vendor /var/www/html/vendor ./vendor

# Copy build assets from frontend stage
COPY --from=frontend /var/www/html/public/build ./public/build

# Configure PHP-FPM to listen on localhost:9001 (Nginx will proxy to it)
RUN sed -i 's|listen = 9000|listen = 127.0.0.1:9001|' /usr/local/etc/php-fpm.d/zz-docker.conf

# Copy Nginx configuration
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Copy and prepare the entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Setup permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Expose port (Nginx listens here; Railway routes traffic to this port)
EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
