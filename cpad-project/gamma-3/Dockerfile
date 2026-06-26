FROM php:8.2-apache

# 1. Install MySQL extension and Apache mod_rewrite.
RUN docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite

# 2. Set Apache's virtual host root directory to Slim's public directory.
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 3. Copy project code and install Composer dependencies.
WORKDIR /var/www/html
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY . .
RUN composer install --no-interaction --optimize-autoloader

# 4. Modify the port to adapt to Render environment.
RUN sed -i 's/80/${PORT}/g' /etc/apache2/ports.conf /etc/apache2/sites-available/*.conf

EXPOSE ${PORT}