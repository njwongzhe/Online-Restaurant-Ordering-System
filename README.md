Please rename the 'groupname-sect folder' accordingly.

<<<<<<< Updated upstream
If you are in section 1 and you group name is Alpha the rename it to 'aplha-1'.
=======
<img src="gamma-3/public/assets/logo.svg" alt="Lanita Restaurant Logo" width="120" height="120" />

# Online Restaurant Ordering System
Comprehensive Food & Drink Ordering Platform for Restaurants

[![Platform - Web](https://img.shields.io/badge/platform-Web-blue?logo=html5)](#)
[![Slim Framework - 4.10](https://img.shields.io/badge/Slim%20Framework-4.10.0-black?logo=slim&logoColor=white)](#)
[![PHP - 7.4/8.0](https://img.shields.io/badge/PHP-%5E7.4%20%7C%7C%20%5E8.0-777bb4?logo=php&logoColor=white)](#)
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
6. [Setup & Local Deployment](#-setup--local-deployment)
7. [Production Deployment](#-production-deployment)

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
*   **Mobile Web UI**: Located under the public web-accessible directory (`/mobile/`) featuring dynamic web components, styles, and order interfaces interacting with API endpoints.

*(Diagrams and graphs are excluded per documentation instructions.)*

<br />

---

<br />

## 🛠 Technology Stack

### Backend API
*   **Framework**: Slim Framework v4.10 (Microframework)
*   **Dependency Container**: PHP-DI v6.4 (Dependency injection container)
*   **PSR-7 Implementation**: Slim PSR-7 v1.5
*   **Token Authentication**: Firebase PHP-JWT v7.1
*   **Logging Utility**: Monolog Logger v2.8 (with console and file outputs)

### Database System
*   **Engine**: MySQL 5.7+ / MariaDB 10.3+
*   **Database Driver**: PHP Data Objects (PDO) with error exception modes and associative fetching.

### Development, Testing & QA
*   **Testing Library**: PHPUnit v9.5 (Unit & Endpoint Integration testing)
*   **Static Code Analysis**: PHPStan v1.8 (including PHPStan extension installer)
*   **Formatting/Linting**: PHP CodeSniffer v3.7

<br />

---

<br />

## 📂 Directory Structure

Below is an overview of the primary files and directories within this project:

```txt
/
├── README.md               # Root documentation file
└── gamma-3/                # Core application workspace folder
    ├── .coveralls.yml      # Coveralls configuration for test coverage
    ├── .gitignore          # Git exclusion patterns
    ├── .htaccess           # Apache configuration rules for redirection
    ├── composer.json       # PHP dependencies list and startup scripts
    ├── composer.lock       # Locked versions of vendor dependencies
    ├── phpcs.xml           # PHP CodeSniffer style configuration rules
    ├── phpstan.neon.dist   # PHPStan analysis levels and custom rules
    ├── phpunit.xml         # PHPUnit testing target directories and environment
    ├── app/                # Application bootstrapping configurations
    │   ├── dependencies.php   # Dependency Injection container container definitions
    │   ├── middleware.php     # Global routing middlewares configuration
    │   ├── repositories.php   # Model repository mappings mapping interfaces
    │   ├── routes.php         # Main application endpoint mapping routes
    │   └── settings.php       # Environment configuration parameters (Logger, debugging, etc.)
    ├── logs/               # Local file logs directory (Monolog storage)
    ├── public/             # Public server DocumentRoot files
    │   ├── .htaccess          # Apache URL rewriting rules for index.php routing
    │   ├── index.php          # Main execution file and app entry point
    │   ├── assets/            # Static image assets, illustrations, and logos
    │   ├── css/               # Stylesheets for web frontend pages
    │   ├── js/                # Javascript modules and interactive component logic
    │   ├── libs/              # External library files and local DB connector
    │   │   └── db_connect_PDO_SLIM.php # Relational database connection file
    │   ├── mobile/            # Client mobile ordering portal frontend
    │   │   └── index.html         # Mobile browser landing interface
    │   ├── uploads/           # User/Admin uploaded media files (e.g. food images)
    │   └── dbdocs/            # Database schema models and script backups
    │       ├── README.md          # Database documentation guide
    │       ├── schema.sql         # Main database schema setup file
    │       └── seed.sql           # Database initial demo data seeding script
    ├── src/                # Backend source code files
    │   ├── Api/               # API Router Handlers & repositories
    │   │   ├── Auth/              # Registration and JWT login authentication API
    │   │   ├── Cart/              # Cart management logic
    │   │   ├── Menu/              # Item listings and menu parameters
    │   │   ├── Orders/            # Checkout flows and order state handlers
    │   │   ├── Shared/            # Reusable helper mechanisms
    │   │   └── routes.php         # API modular endpoint registrations
    │   ├── Application/       # Core app controllers and action schemas
    │   ├── Domain/            # Business models and entity domains
    │   └── Infrastructure/    # Data repositories and hardware mappings
    └── tests/              # PHPUnit testing suites
        ├── Api/               # REST API endpoints unit test suites
        ├── Application/       # Application routing layer tests
        ├── TestCase.php       # Master TestCase parent class
        └── bootstrap.php      # Test run bootstrap loader script
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

## 🚀 Setup & Local Deployment

This guide outlines the workflows for setting up your local development environment using either the **PHP Built-in Server** or **XAMPP Apache Server**.

### 1. Prerequisites & Environment Setup
Ensure you have the following installed and configured:
*   **PHP** (version `7.4` or `8.0+` required)
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
2. Open the schema setup files from the directory:
   - [schema.sql](file:///e:/GitHub/cpad-project/gamma-3/public/dbdocs/schema.sql)
   - [seed.sql](file:///e:/GitHub/cpad-project/gamma-3/public/dbdocs/seed.sql)
3. Execute the SQL queries inside [schema.sql](file:///e:/GitHub/cpad-project/gamma-3/public/dbdocs/schema.sql). This will:
   - Create the target database: `cpad_03_gamma`
   - Setup the default database credentials:
     * **Username**: `cpad`
     * **Password**: `cpadPassword`
   - Create all 15 relational tables.
4. Execute the SQL queries inside [seed.sql](file:///e:/GitHub/cpad-project/gamma-3/public/dbdocs/seed.sql) to load initial seed information (default accounts, categories, items, and addon lists).
5. The local application establishes DB connectivity using the configuration stored in [db_connect_PDO_SLIM.php](file:///e:/GitHub/cpad-project/gamma-3/public/libs/db_connect_PDO_SLIM.php):
   ```php
   $host = "localhost";
   $username = "cpad";
   $password = "cpadPassword";
   $database = "cpad_03_gamma";
   ```
   *Note: If your local database is configured with a different host, user, or password, update the variables in this file.*

---

### 4. Fetching Dependencies
Initialize packages using Composer:
1. Open a command prompt or terminal.
2. Navigate to the `gamma-3` subdirectory:
   ```bash
   cd gamma-3
   ```
3. Run the installation instruction:
   ```bash
   composer install
   ```
   *This command parses the [composer.json](file:///e:/GitHub/cpad-project/gamma-3/composer.json) file and pulls all framework modules into the `vendor` folder.*

---

### 5. Running the Application Server

#### Option A: PHP Built-in Web Server (Recommended for Fast Local Development)
This option allows you to quickly run the server from the command line without configuring extra web server packages.

1. Navigate to the `gamma-3` directory in your terminal.
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

---

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
    Alias /gamma-3 "E:/GitHub/cpad-project/gamma-3/public"
</IfModule>
```

##### Configuration Example:
If your project is saved in `C:/cpad-project`, the configuration would look like:
```apache
Alias /cpad-project/gamma-3 C:/cpad-project/gamma-3/public

<Directory "C:/cpad-project/gamma-3/public">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Require all granted
</Directory>
```

3. Save the `httpd.conf` file and restart your Apache server from the XAMPP Control Panel.
4. Access the web client in your browser:
   [http://localhost/gamma-3/mobile/](http://localhost/gamma-3/mobile/) (or the corresponding alias path).

---

### 6. Executing Tests
The project contains modular testing suites verifying API route handling and cart repositories.

1. Navigate to the `gamma-3` root directory.
2. Run the test commands using Composer:
   ```bash
   composer test
   ```
   *(Alternatively, run the PHPUnit binary directly: `./vendor/bin/phpunit`)*
3. Review the test assertions and coverage analysis printouts.

<br />

---

<br />

## 🚀 Production Deployment

> [!NOTE]
> Since this project is still in active development, details regarding production hosting (e.g., container deployments, cloud database integrations, SSL configuration) will be added here once deployment targets are finalized. Refer to the local setup instructions above for current testing procedures.
>>>>>>> Stashed changes
