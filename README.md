# Inventory Management System (IMS)

## Overview

This project is a **simple Inventory Management System (IMS)** designed to manage and track product stock inside a warehouse.
It replaces manual inventory tracking (Excel sheets or registers) with a centralized digital system.

The application allows users to:

* Create and manage products
* Track incoming stock (receipts)
* Track outgoing stock (deliveries)
* Monitor current inventory levels

---

## Technology Stack

**Frontend**

* React.js
* Vite

**Backend**

* Python (FastAPI / Django REST API)

**Database**

* PostgreSQL

---

## Features

* Product Management (Create / View products)
* Receive stock from vendors
* Deliver stock to customers
* Automatic stock quantity update
* Inventory tracking
* Simple dashboard for stock overview

---

## Project Structure

```
project-root
│
├── frontend
│   ├── React + Vite application
│   └── UI for managing inventory
│
├── backend
│   ├── Python API
│   ├── Business logic for inventory
│   └── Database connection
│
└── database
    └── PostgreSQL tables for products and transactions
```

---

## Installation

### 1. Clone the repository

```
git clone <repository-url>
cd inventory-system
```

---

### 2. Backend Setup

Install dependencies

```
pip install -r requirements.txt
```

Run backend server

```
python main.py
```

or

```
uvicorn main:app --reload
```

---

### 3. Frontend Setup

Navigate to frontend folder

```
cd frontend
```

Install dependencies

```
npm install
```

Start development server

```
npm run dev
```

---

### 4. Database Setup

Create PostgreSQL database

```
CREATE DATABASE inventory_db;
```

Update database configuration in the backend settings file with:

* Database name
* Username
* Password
* Host
* Port

---

## API Endpoints (Example)

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| POST   | /products | Create product   |
| GET    | /products | Get all products |
| POST   | /receive  | Add stock        |
| POST   | /deliver  | Remove stock     |

---

## Future Improvements

* User authentication
* Multi-warehouse support
* Stock alerts
* Dashboard analytics
* Barcode scanning

---

## Author

Developed as a learning project to demonstrate **inventory management and backend API development using Python and React**.
