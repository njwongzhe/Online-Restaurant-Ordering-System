<div align="center">

<img src="gamma-3/public/assets/logo.svg" alt="Lanita Restaurant Logo" width="120" height="120" />

# Online Restaurant Ordering System
Comprehensive Food & Drink Ordering Platform for Restaurants

[![Platform - Web & Mobile](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-blue?logo=html5)](#)
[![Frontend - Vue.js 3](https://img.shields.io/badge/Frontend-Vue.js%203-4FC08D?logo=vuedotjs&logoColor=white)](#)
[![Mobile - Capacitor](https://img.shields.io/badge/Mobile-Capacitor-119EFF?logo=capacitor&logoColor=white)](#)
[![Backend - Slim 4.10](https://img.shields.io/badge/Backend-Slim%204.10-black?logo=slim&logoColor=white)](#)
[![Language - PHP 8.1+](https://img.shields.io/badge/Language-PHP%208.1+-777bb4?logo=php&logoColor=white)](#)
[![Database - MySQL/MariaDB](https://img.shields.io/badge/Database-MySQL%2FMariaDB-4479a1?logo=mysql&logoColor=white)](#)
[![Auth - JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](#)
[![License - MIT](https://img.shields.io/badge/license-MIT-green)](#)

---
</div>

**Online Restaurant Ordering System** is a comprehensive web-based food and drink ordering system built for restaurants. Features include flexible dining options (dine-in, take-away, delivery), digital menu management, and real-time order tracking to streamline daily operations.

The backend is built using the high-performance **Slim Framework 4 Skeleton Application** and integrates with a secure, relational database schema deployed on a local MySQL/MariaDB instance. The application is structured to facilitate seamless mobile ordering and administrative tracking.

---

<br />

## 📌 Table of Contents
1. [Core Features](#-core-features)
2. [Project Architecture](#-project-architecture)
3. [Technology Stack](#-technology-stack)
4. [Directory Structure](#-directory-structure)
5. [Database Schema Overview](#-database-schema-overview)
6. [Order Processing & History Workflow](#-order-processing--history-workflow)
7. [Setup & Local Deployment](#-setup--local-deployment)
8. [Production Deployment](#-production-deployment)

<br />

---

<br />

## 🌟 Core Features

*   **Dining Versatility**: Support for multiple ordering methods including **Dine-in** (with specific table tracking), **Take-away** (with pickup schedules), and **Delivery** (with target delivery address).
*   **Digital Menu Browsing**: Categorized food and drink lists with real-time availability states and custom item addons/toppings support.
*   **Active Shopping Carts**: User session carts managing order selections, custom special instructions, and item addons configurations.
*   **Order Progression & Real-Time Tracking**: Full transactional order workflow monitoring (from submission and preparation to completion or cancellation) with automated history logging.
*   **Administrative Management**: Tools for administrators to handle menu updates, configure global restaurant settings, adjust categories, and oversee active customer orders.

<br />

---

<br />

## 🏗 Project Architecture

The application implements a classic decoupled service model consisting of:
*   **Backend Application API Layer**: Built on Slim Framework 4 utilizing PHP-DI container injection and PSR-7 request/response messaging standards to process frontend requests, check parameters, and handle DB queries.
*   **Database Management System (DBMS)**: Backed by a local MySQL/MariaDB database instance providing strong relational integrity, foreign key checks, and structured transaction data storage.
*   **Mobile Web UI / Lanita Client**: Located under the public web-accessible directory (`/mobile/`) or native builds, featuring dynamic web components, styles, and order interfaces interacting with API endpoints.

<br />

---

<br />

## 🛠 Technology Stack

### Frontend
*   **Framework**: Vue.js 3 (CDN)
*   **Core**: HTML5, CSS3, JavaScript
*   **Architecture**: Responsive Web Design

### Backend API
*   **Framework**: Slim Framework v4.10 (Microframework)
*   **Token Authentication**: Firebase PHP-JWT v7.1

### Database
*   **Engine**: MySQL 5.7+ / MariaDB 10.3+

### Mobile Client
*   **Core**: Vanilla JavaScript (HTML/JS/CSS)
*   **Build Tool**: Vite v7.3
*   **Cross-Platform Engine**: Capacitor v8.4 (for Android native build)
*   **Environment**: Node.js & npm

<br />

---

<br />

## 📂 Directory Structure

Below is an overview of the primary files and directories within this repository workspace:

```txt
/
├── README.md  # Repository root documentation.
├── .gitignore # Git exclusion patterns for the repository.
├── Lanita/                   # Mobile Client App (Capacitor hybrid app for Android).
│   ├── .gitignore            # Git exclusion patterns for mobile app.
│   ├── capacitor.config.json # Capacitor static configuration.
│   |—— package-lock.json     # Node dependencies lock file.
│   ├── package.json          # Node dependencies & project scripts.
│   ├── README.md             # Mobile app setup & build guide.
│   ├── vite.config.ts        # Vite asset compilation config.
│   |── android/              # Native Android Studio compilation folder.
│   |── assets/               # Stored assets for mobile app.
│   |── node_modules/         # Node dependencies for mobile app.
│   ├── src/                  # Mobile app source code (HTML/JS/CSS).
│   └── www/                  # Built web assets folder.
└── cpad-project/                           # Parent directory containing the backend workspace.
    └── gamma-3/                            # Core backend Slim API workspace.
        ├── .env                            # Database connection environment configuration.
        ├── .coveralls.yml                  # Coveralls configuration for test coverage.
        ├── .gitignore                      # Git exclusion patterns.
        ├── .htaccess                       # Apache configuration rules for redirection.
        ├── composer.json                   # PHP dependencies list and startup scripts.
        ├── composer.lock                   # Locked versions of PHP package dependencies.
        ├── docker-compose.yml              # Docker compose configuration for local development.
        ├── Dockerfile                      # Docker configuration for production deployment.
        ├── phpcs.xml                       # PHP CodeSniffer style configuration rules.
        ├── phpstan.neon.dist               # PHPStan analysis levels and custom rules.
        ├── phpunit.xml                     # PHPUnit testing target directories and environment.
        ├── README.md                       # Slim API setup & local deployment details.
        ├── .github/                        # GitHub Actions configuration and workflows.
        ├── app/                            # Application bootstrapping configurations.
        ├── logs/                           # Local file logs directory (Monolog storage).
        ├── public/                         # Public server DocumentRoot files.
        │   ├── .htaccess                   # Apache URL rewriting rules for index.php routing.
        │   ├── index.php                   # Main execution file and app entry point with dynamic path resolver.
        │   ├── assets/                     # Static image assets, illustrations, and logos.
        │   ├── css/                        # Stylesheets for web frontend pages.
        │   ├── js/                         # Javascript modules and interactive component logic.
        │   ├── libs/                       # External library files and local DB connector.
        │   │   └── db_connect_PDO_SLIM.php # Relational database connection file.
        │   ├── mobile/                     # Client mobile ordering portal frontend.
        │   │   └── index.html              # Mobile browser landing interface.
        │   ├── uploads/                    # User/Admin uploaded media files (e.g. food images).
        │   └── dbdocs/                     # Database schema models and script backups.
        │       ├── README.md               # Database documentation guide.
        │       ├── schema.sql              # Main database schema setup file.
        │       └── seed.sql                # Database initial demo data seeding script.
        ├── src/                            # Backend source code files.
        │   ├── Api/                        # API Router Handlers & repositories.
        │   │   ├── Auth/                   # Registration and JWT login authentication API.
        │   │   ├── Cart/                   # Cart management logic.
        │   │   ├── Menu/                   # Item listings and menu parameters.
        │   │   ├── Orders/                 # Checkout flows and order state handlers.
        │   │   ├── Shared/                 # Reusable helper mechanisms.
        │   │   └── routes.php              # API modular endpoint registrations.
        │   ├── Application/                # Core app controllers and action schemas.
        │   ├── Domain/                     # Business models and entity domains.
        │   └── Infrastructure/             # Data repositories and hardware mappings.
        └── tests/                          # PHPUnit testing suites.
```

<br />

---

<br />

## 📊 Database Schema Overview

The relational MySQL/MariaDB database consists of **15 tables** designed to support transaction isolation and relational tracking:

| Table Name | Description |
| :--- | :--- |
| `users` | Base account credentials, tracking display names, role classifications (`customer`, `admin`), and status. |
| `customer_profiles` | Custom profile records for customers, storing billing addresses and preferred payment formats. |
| `admin_profiles` | Details regarding administrative accounts, mapping roles and business titles. |
| `restaurant_settings` | Key-value application parameters configuration (e.g. tax levels, opening hours, active promotions). |
| `categories` | Menu catalog categories (e.g. Appetizers, Desserts, Beverages) with active/inactive state attributes. |
| `menu_items` | Individual food and beverage listings, containing pricing, reference images, and availability. |
| `addons` | Menu customization options and topping ingredients (e.g. extra cheese, milk choices) with prices. |
| `menu_item_addons` | Associative table matching customizable addon options to appropriate menu items. |
| `carts` | Active user cart items references, capturing target delivery mode (`dine_in`, `takeaway`, `delivery`). |
| `cart_items` | Selections loaded into a shopping cart, capturing quantities and special instructions. |
| `cart_item_addons` | Selected addon custom configuration items assigned to items currently in the cart. |
| `orders` | Placed client checkouts, storing tracking codes, status checks, financial summaries, and pickup details. |
| `order_items` | Historical item snapshots linked to a confirmed order, logging frozen unit pricing. |
| `order_item_addons` | Snapshotted records of addon selections linked to order items, preserving historical transactions. |
| `order_status_history` | Audit log recording step-by-step updates of order states (e.g., preparing, ready, completed). |

<br />

---

<br />

## 🔄 Order Processing & History Workflow

The system manages customer ordering and administrative tracking using a transaction-safe state machine. Below is the sequential request-response pipeline for order configuration, submission, and status transitions:

1. **Menu Selection**: The customer browses the menu and configures custom addon choices (e.g., extra toppings or sizes).
2. **Cart Checkout**: The customer selects their dining format (Dine-in, Take-away, or Delivery) and submits the checkout request.
3. **API Ingestion**: The Lanita mobile client sends a checkout request containing active cart items to the Slim backend API along with their JWT authorization token.
4. **Validation**: The backend API validates item stock, price configurations, and cart integrity against the MySQL database.
5. **Database Transaction**: The backend executes a transaction to insert records into the `orders`, `order_items`, and `order_item_addons` tables, logs the starting tracking state into `order_status_history` (`pending`), and clears the user's active cart items.
6. **Order Confirmation**: The backend returns a tracking code and confirmation payload to the customer app.
7. **Administrative View**: The order becomes visible in real-time in the restaurant administrator dashboard.
8. **Status Transition**: The restaurant admin updates the order status (e.g. from `pending` to `preparing`, then `ready`, and finally `completed` or `cancelled`), which updates the order records and appends audit logs to the `order_status_history` table.

<br />

---

<br />

## 🚀 Setup & Local Deployment

This guide outlines the workflows for setting up your local development environment using either the **PHP Built-in Server** or **XAMPP Apache Server**.

### 1. Prerequisites & Environment Setup
Ensure you have the following installed and configured:
*   **PHP** (version `8.1+` required)
*   **Composer** (PHP Package dependency manager) - [Download & Install Composer](https://getcomposer.org/download/)
*   **MySQL Server** or **MariaDB** database service (included in XAMPP)
*   **XAMPP** or similar local server environment package

#### Enable Required PHP Extensions
To ensure Composer can build Slim framework skeletons and fetch dependencies successfully, you must enable the `zip` extension:
1. Open your active PHP configuration file (`php.ini`).
2. Search for `;extension=zip`.
3. Uncomment or replace it with:
   ```ini
   extension=zip
   ```
4. Save the file and restart your terminal or web server.

---

### 2. Folder Renaming Note
> [!IMPORTANT]
> If you are working on a university or group-assigned submission, you may be required to rename the project folder `gamma-3` to match a specific class layout (e.g., `alpha-1` or `groupname-sect`). If renamed, ensure any local base path configurations (such as Apache BasePath or virtual host setups) are updated to match the new name exactly.

---

### 3. Database Ingestion & Setup
Before launching the server, provision the database:

1. Open your database command-line utility or web administration dashboard (such as **phpMyAdmin** or **MySQL Workbench**).
2. Open the schema setup files from the directory `cpad-project/gamma-3/public/dbdocs`:
   - `schema.sql`
   - `seed.sql`
3. Execute the SQL queries inside `schema.sql`. This will:
   - Create the target database: `cpad_03_gamma`
   - Setup the default database credentials:
     * **Username**: `cpad`
     * **Password**: `cpadPassword`
   - Create all 15 relational tables.
4. Execute the SQL queries inside `seed.sql` to load initial seed information (default accounts, categories, items, and addon lists).
5. The local application establishes DB connectivity using the configuration stored in `db_connect_PDO_SLIM.php` (located in `cpad-project/gamma-3/public/libs/db_connect_PDO_SLIM.php`):
   ```php
   $host = "localhost";
   $username = "cpad";
   $password = "cpadPassword";
   $database = "cpad_03_gamma";
   ```
   *Note: If your local database is configured with a different host, user, or password, update the variables in this file.*

#### 🔑 Default Accounts (Demo Credentials)
After running the database seed script, you can use the following default credentials to log in:

| Display Name | Phone Number | Role | Position |
| :--- | :--- | :--- | :--- |
| Admin | `0111000000` | admin | Initial Admin |
| Aina Rahman | `0111000001` | admin | Restaurant Manager |
| Daniel Lee | `0111000002` | admin | Kitchen Supervisor |
| Ali Ahmad | `0122000001` | customer | Kolej Tun Dr Ismail, UTM |
| Siti Aminah | `0122000002` | customer | Kolej Datin Seri Endon, UTM |
| Muthu Raj | `0122000003` | customer | Kolej Rahman Putra, UTM |
| Nur Izzati | `0122000004` | customer | Kolej Tun Fatimah, UTM |
| Jason Wong | `0122000005` | customer | Kolej Perdana, UTM |

All admin accounts use the password **`adminPass`**.
All customer accounts use the password **`customerPass`**.

---

### 4. Fetching Dependencies
Initialize packages using Composer:
1. Open a command prompt or terminal.
2. Navigate to the `cpad-project/gamma-3` subdirectory:
   ```bash
   cd cpad-project/gamma-3
   ```
3. Run the installation instruction:
   ```bash
   composer install
   ```
   *This command parses the `composer.json` file and pulls all framework modules into the `vendor` folder.*

---

### 5. Running the Application Server

#### Option A: PHP Built-in Web Server (Recommended for Fast Local Development)
This option allows you to quickly run the server from the command line without configuring extra web server packages.

1. Navigate to the `cpad-project/gamma-3` directory in your terminal.
2. Start the application using the predefined Composer script:
   ```bash
   composer start
   ```
   *(Alternatively, run the raw command: `php -S localhost:8080 -t public`)*
3. Navigate to the landing page URL in your browser:
   [http://localhost:8080](http://localhost:8080)
   *(This URL automatically issues a redirect to the client's mobile interface running at `http://localhost:8080/mobile/`)*

To run on an alternative port (such as `8000`), issue the manual CLI instruction:
```bash
php -S localhost:8000 -t public
```
Then visit [http://localhost:8000/mobile/](http://localhost:8000/mobile/).

#### Option B: XAMPP Apache Web Server Setup
To run the Slim 4 project properly under an Apache web server (XAMPP), you need to configure Apache to route requests to the `/public` directory of the project, while keeping the folder in your custom path directory.

1. Open your XAMPP Apache configuration file, usually located at `C:\xampp\apache\conf\httpd.conf`.
2. Add a `<Directory>` block to allow Apache access to your project's `/public` folder, and define an `Alias` inside `alias_module` to map the folder name to the public path:

```apache
<Directory "<pathToFolder>/public">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>

<IfModule alias_module>
    # Alias /<folderName> "<pathToFolder>/public"
    Alias /cpad-project/gamma-3 "C:/cpad-project/gamma-3/public"
</IfModule>
```

##### Configuration Example:
If your project is saved in `C:/cpad-project`, the configuration would look like:
```apache
<Directory "C:/cpad-project/gamma-3/public">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>

Alias /cpad-project/gamma-3 C:/cpad-project/gamma-3/public
```

3. Save the `httpd.conf` file and restart your Apache server from the XAMPP Control Panel.
4. Access the web client in your browser:
   [http://localhost/gamma-3/mobile/](http://localhost/gamma-3/mobile/) (or the corresponding alias path).

<br />

---

<br />

## 🚀 Production Deployment

### 1. Environment Configurations (.env)
Create a `.env` file in the `cpad-project/gamma-3` directory to store database connection configurations:

```ini
# --------- Database Configuration ---------
# Database connection URI (MySQL Server format, e.g., from Railway)
DATABASE_URL="mysql://username:password@host:port/database"
```

---

### 2. Render Cloud Container Deployment (PHP-Slim Backend API)
To deploy the Slim API to production on [Render](https://render.com) using the custom Docker configuration, follow these instructions:

#### A. Create a New Web Service
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** (top-right) and select **Web Service**.
3. Connect the GitHub repository containing this project.

#### B. Service Configuration
During the setup of the Web Service, apply the following configuration parameters:
*   **Name**: `online-restaurant-ordering-system`
*   **Environment**: `Docker`
*   **Region**: Select a region closest to your MySQL database instance (e.g., `Singapore` for Southeast Asia).
*   **Branch**: `master` (Or your preferred deployment branch).
*   **Root Directory**: `cpad-project/gamma-3` *(This is critical since the Dockerfile sits in the backend subdirectory)*.

#### C. Environment Variables Configuration
Navigate to the **Environment** tab of the newly created Render service and add the following variables:
*   **`DATABASE_URL`**: Your MySQL production database connection URI (e.g., from Railway).

---

### 3. cron-job.org (Optional for Render Free Plan)
If you deploy the PHP-Slim backend API on a **Render Free Plan**, Render automatically spins down the web service container after 15 minutes of inactivity. The next incoming request (e.g., from the mobile app) will experience a "cold start" delay of 50 seconds or more while the instance spins back up.

To keep the Render container active and prevent it from sleeping, you can set up a free pinging service on [cron-job.org](https://cron-job.org/):

#### Steps to Configure:
1. Register a free account or log in at [cron-job.org](https://cron-job.org/).
2. Navigate to the **Cronjobs** tab and click **Create Cronjob**.
3. Set the following details:
   - **Title**: `RENDER SERVER KEEP ACTIVE CRON` (Or your preferred name.)
   - **Address (URL)**: `https://Your-Render-Service-Domain.onrender.com/` *(Replace with your actual Render service domain, e.g., `https://online-restaurant-ordering-system.onrender.com/`)*
   - **Request Method**: `GET`
   - **Schedule**: Choose **Every 10 minutes** (this runs frequently enough to beat Render's 15-minute inactivity limit).
4. Save the cron job. It will ping the base URL every 10 minutes to ensure the server remains active.

---

### 4. Railway MySQL Database Provisioning
To host the production MySQL database on [Railway](https://railway.app):
1. Sign in to your Railway dashboard and create a new project.
2. Select **Provision MySQL**.
3. Retrieve your connection variables from the **Variables** tab of the MySQL service.
4. Construct your `DATABASE_URL` in the standard format:
   ```ini
   DATABASE_URL="mysql://[user]:[password]@[host]:[port]/[database]"
   ```
5. Open your local terminal and navigate to the directory `cpad-project/gamma-3/public/dbdocs/railwaySQL`:
   ```bash
   cd cpad-project/gamma-3/public/dbdocs/railwaySQL
   ```
6. Run the following command to quickly load the prepared schema and seed data directly into the Railway database:
   ```bash
   mysql -h <host> -u <user> -p<password> --port <port> <database> < railway_schema_seed.sql
   ```
   
   ##### Command Example:
   ```bash
   mysql -h reseau.proxy.rlwy.net -u root -peUuUxoRhieerxFrbfyTZZJTZGwzOjBut --port 26489 railway < railway_schema_seed.sql
   ```

   > [!IMPORTANT]
   > The database host, port, username, and password used in the Railway command are completely different from your local database configuration (which uses `localhost`, `cpad`, and `cpadPassword`). Make sure to refer to the exact production credentials listed in your Railway MySQL service variables, and ensure there is no space between `-p` and the password value.

---

### 5. Capacitor Mobile App Build & Compilation (Android)
To compile and build the **Lanita** mobile application:
1. Navigate to the `Lanita` directory.
2. Ensure `capacitor.config.json` points to your backend web service URL (e.g., `https://online-restaurant-ordering-system.onrender.com` or your local development IP) under the `"server.url"` key if remote server hosting is desired.
3. Install dependencies:
   ```bash
   npm install
   ```
4. If you haven't add the `android` folder, run this command:
   ```bash
   npx cap add android
   ```
5. Sync the compiled assets to the native platforms:
   ```bash
   npx cap sync
   ```
6. Open the native platform workspace in Android Studio:
   ```bash
   npx cap open android
   ```
7. Resolve Potential Gradle/JDK Errors (First Time Only)
   Once Android Studio opens the project and starts indexing, if you see an "Invalid Gradle JDK configuration found" error popup in the bottom right corner:
   *   Click the blue link in the popup that says `Use Embedded JDK (.../jbr)`.
   *   Click the Sync Project with Gradle Files button (the Elephant 🐘 icon) in the top-right toolbar to re-sync.
8. Inside Android Studio, build, sign, and compile the final production APK or bundle for deployment.