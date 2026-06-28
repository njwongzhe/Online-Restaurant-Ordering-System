<div align="center">

<img src="../assets/logo.svg" alt="Lanita Restaurant Logo" width="120" height="120" />

# Lanita Restaurant Database Documentation
Database Schema, Setup Guide, and Table Reference

[![Database - MySQL/MariaDB](https://img.shields.io/badge/Database-MySQL%2FMariaDB-4479a1?logo=mysql&logoColor=white)](#)
[![Tables - 15](https://img.shields.io/badge/Tables-15-blue)](#)
[![Connection - PDO](https://img.shields.io/badge/Connection-PDO-777bb4?logo=php&logoColor=white)](#)
[![License - MIT](https://img.shields.io/badge/license-MIT-green)](#)

---
</div>

This directory contains the database schema scripts and seed data for the **Online Restaurant Ordering System**. The application uses a relational database structure with **15 tables** to support transactional operations and history tracking.

<br />

---

<br />

## 🛠 Local Database Setup & Ingestion

To set up the database locally (using **phpMyAdmin**, **MySQL Workbench**, or the command line):

1. Open your database administration dashboard or utility.
2. Open and execute the SQL script files from this directory:
   *   `schema.sql` — Creates the database `cpad_03_gamma` and structures the 15 relational tables.
   *   `seed.sql` — Loads default categories, menu items, customizable addons, and test user accounts.
3. Configure the database credentials:
   *   **Default Username**: `cpad`
   *   **Default Password**: `cpadPassword`
   *   **Default Schema**: `cpad_03_gamma`
4. The local application establishes DB connectivity using the configuration stored in `db_connect_PDO_SLIM.php` (located in `cpad-project/gamma-3/public/libs/db_connect_PDO_SLIM.php`):
   ```php
   $host = "localhost";
   $username = "cpad";
   $password = "cpadPassword";
   $database = "cpad_03_gamma";
   ```
   *Note: If your local database is configured with a different host, user, or password, update the variables in that connection file.*

---

### 🔑 Default Accounts (Demo Credentials)

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

*   All admin accounts use the password **`adminPass`**.
*   All customer accounts use the password **`customerPass`**.

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