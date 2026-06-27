FROM php:8.2-apache

# 1. Install system dependencies and PHP extensions.
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip \
    && a2enmod rewrite

# 2. Copy custom Apache VirtualHost config (replaces default site).
#    This has rewrite rules baked in — no .htaccess dependency.
COPY apache-vhost.conf /etc/apache2/sites-available/000-default.conf

# 3. Update ports.conf to use Render's dynamic $PORT.
RUN sed -i 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf

# 4. Copy project code.
WORKDIR /var/www/html
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY . .

# 5. Run Composer installation.
RUN composer install --no-interaction --optimize-autoloader --ignore-platform-reqs

EXPOSE ${PORT}

CMD ["apache2-foreground"]
