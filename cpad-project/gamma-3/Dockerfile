FROM php:8.2-apache

# 1. Install system dependencies and common PHP core extensions (including pdo_mysql and zip/git, etc. required by composer).
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip \
    && a2enmod rewrite

# 2. Set Apache's virtual host root directory to Slim's public directory.
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Enable AllowOverride so .htaccess rewrite rules work (critical for Slim routing).
RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# 3. Copy project code.
WORKDIR /var/www/html
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY . .

# 4. Run Composer installation (add --ignore-platform-reqs to force ignore potential local version platform conflicts).
RUN composer install --no-interaction --no-dev --optimize-autoloader --ignore-platform-reqs

# 5. Modify the port to adapt to Render environment.
RUN sed -i 's/80/${PORT}/g' /etc/apache2/ports.conf /etc/apache2/sites-available/*.conf

EXPOSE ${PORT}
