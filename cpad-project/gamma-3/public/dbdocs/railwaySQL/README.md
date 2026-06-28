<div align="center">

<img src="../../assets/logo.svg" alt="Lanita Restaurant Logo" width="120" height="120" />

# Railway MySQL Database Setup
Production Database Provisioning and Ingestion

[![Database - MySQL](https://img.shields.io/badge/Database-MySQL-4479a1?logo=mysql&logoColor=white)](#)
[![Host - Railway](https://img.shields.io/badge/Host-Railway-0B0D0E?logo=railway&logoColor=white)](#)
[![License - MIT](https://img.shields.io/badge/license-MIT-green)](#)

---
</div>

This directory contains the production-ready unified database script `railway_schema_seed.sql` for deploying and seeding the **Online Restaurant Ordering System** database on **Railway**.

<br />

---

<br />

## 🚀 Railway MySQL Provisioning & Seeding

Follow these steps to host and initialize the production database:

1. **Provision MySQL Instance**:
   *   Sign in to your [Railway](https://railway.app) dashboard and create a new project.
   *   Select **Provision MySQL**.
2. **Retrieve Connection Credentials**:
   *   Navigate to the **Variables** tab of the MySQL service on Railway.
   *   Construct your `DATABASE_URL` in the standard format:
       ```ini
       DATABASE_URL="mysql://[user]:[password]@[host]:[port]/[database]"
       ```
3. **Ingest Database Schema & Seed Data**:
   *   Open your terminal and navigate to this directory:
       ```bash
       cd cpad-project/gamma-3/public/dbdocs/railwaySQL
       ```
   *   Run the following CLI command to import the schema structures and default data directly into Railway:
       ```bash
       mysql -h <host> -u <user> -p<password> --port <port> <database> < railway_schema_seed.sql
       ```

### ⚠️ Important Note
The database host, port, username, and password used in the Railway CLI import are completely different from your local database configuration. Make sure to refer to the exact production credentials listed in your Railway MySQL service variables, and ensure there is no space between `-p` and the password value.