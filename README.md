# Inventory Management System API

A RESTful backend service built with Node.js, Express, and MongoDB for product catalog management, stock tracking, and aggregated inventory reporting.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square&logo=mongoose&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
  - [Endpoints](#endpoints)
  - [Query Parameters](#query-parameters)
  - [Sample Payloads](#sample-payloads)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [API Verification & Screenshots](#api-verification--screenshots)
- [Author](#author)

---

## Overview

The **Inventory Management System** is a backend REST API designed for managing retail or warehouse product inventories. It provides full CRUD capabilities, schema-level validation, stock adjustment mechanisms, low-stock threshold queries, and category-level aggregation reports using MongoDB pipelines.

---

## Key Features

- **Product Catalog Management**: Complete CRUD operations for products with strict schema constraints.
- **Data Validation & Integrity**: Middleware validation ensuring required fields, numeric constraints, non-negative stock, and unique SKU enforcement.
- **Flexible Product Queries**: Filter by category and price range, multi-field sorting, and offset-based pagination.
- **Stock Tracking**: Atomic adjustments to product quantity with validation preventing negative inventory.
- **Low-Stock Detection**: Dedicated endpoint retrieving products that have reached or dropped below their reorder threshold.
- **Inventory Aggregation**: MongoDB aggregation pipeline generating category-level metrics (total items, total inventory value, average price).
- **Centralized Error Handling**: Unified middleware returning consistent HTTP status codes and structured JSON errors for validation, casting, duplicate keys, and route misses.

---

## Tech Stack

| Component | Technology | Description |
|:---|:---|:---|
| **Runtime** | Node.js | Asynchronous JavaScript runtime |
| **Framework** | Express.js (v5) | HTTP server and routing |
| **Database** | MongoDB | Document database |
| **ODM** | Mongoose | Schema definitions, validation, and aggregations |
| **Configuration** | dotenv | Environment variable isolation |
| **API Testing** | Postman | Endpoint testing and verification |

---

## Project Structure

```text
Inventory-Management-System/
├── middleware/
│   ├── errorHandler.js       # Centralized error handling middleware
│   └── validateProduct.js    # Request body validation middleware
├── models/
│   └── Product.js            # Mongoose schema and model definition
├── routes/
│   └── productRoutes.js      # REST endpoints and aggregation logic
├── .env.example              # Template for environment configuration
├── .gitignore                # Ignored files and directories
├── package.json              # Project dependencies and npm scripts
├── README.md                 # Project documentation
└── server.js                 # App initialization and database connection
```

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/` | API health check |
| `POST` | `/api/products` | Create a new product |
| `GET` | `/api/products` | List all products (with filters, sorting, pagination) |
| `GET` | `/api/products/low-stock` | List products with quantity at or below reorder level |
| `GET` | `/api/products/summary` | Category-wise inventory aggregation summary |
| `GET` | `/api/products/:id` | Retrieve product details by ID |
| `PUT` | `/api/products/:id` | Update all product fields |
| `PATCH` | `/api/products/:id/stock` | Adjust product stock quantity |
| `DELETE` | `/api/products/:id` | Remove a product from inventory |

### Query Parameters for `GET /api/products`

| Parameter | Type | Default | Description |
|:---|:---:|:---:|:---|
| `category` | String | — | Filter by product category |
| `minPrice` | Number | — | Minimum price boundary |
| `maxPrice` | Number | — | Maximum price boundary |
| `sort` | String | `createdAt` | Field to sort by (`name`, `price`, `quantity`, `reorderLevel`, `createdAt`) |
| `order` | String | `desc` | Sort direction (`asc` or `desc`) |
| `page` | Number | `1` | Page number |
| `limit` | Number | `10` | Number of items per page |

**Example Request:**
```http
GET /api/products?category=Electronics&minPrice=20&maxPrice=200&sort=price&order=asc&page=1&limit=5
```

### Sample Payloads

#### Create Product (`POST /api/products`)
```json
{
  "name": "Wireless Ergonomic Mouse",
  "sku": "TECH-MOU-001",
  "category": "Electronics",
  "price": 49.99,
  "quantity": 50,
  "reorderLevel": 10,
  "supplier": "LogiSupply Co."
}
```

#### Adjust Stock (`PATCH /api/products/:id/stock`)
```json
{
  "quantityChange": -5
}
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas connection)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/codeREDxbt/Inventory-Management-System.git
   cd Inventory-Management-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Start the application**
   ```bash
   npm start
   ```

   The server will start listening at `http://localhost:5000`.

---

## API Verification & Screenshots

All endpoints and validations have been verified via Postman test suites.

### 1. Server & Database Connection
Health check route and successful MongoDB connection:
![Server and DB Connection](https://github.com/user-attachments/assets/1b16008f-d57a-40c9-8b75-bc936059dfbc)

### 2. Create Product
Creating a new product entry with 201 Created response:
![Create Product](https://github.com/user-attachments/assets/35fe2aa3-130c-494d-8238-85e74cdc1e37)

### 3. Request Validation & Error Handling
Middleware intercepting missing required fields and schema violations:
![Validation Handling](https://github.com/user-attachments/assets/b3147437-5289-485e-9305-0392f019972f)

### 4. Filtering, Sorting & Pagination
Fetching products matching category, price boundaries, and page offsets:
![Filtering and Pagination](https://github.com/user-attachments/assets/01ec12a7-d5a7-462b-85a4-d82e35c42c98)

### 5. Retrieve & Update Product
Fetching individual product by ID and updating fields:
![Retrieve and Update Product](https://github.com/user-attachments/assets/e35f2a60-971c-4fbd-8a28-18676d21a5f3)

### 6. Delete Product
Deleting an existing product by ID:
![Delete Product](https://github.com/user-attachments/assets/71e1744f-d22a-490b-a856-c8c263e9f843)

### 7. Stock Adjustment & Low-Stock Alerts
Adjusting inventory count and listing items reaching reorder thresholds:
![Stock Adjustment](https://github.com/user-attachments/assets/74cdd72b-bc0a-44c4-bb14-df56b05a9f8f)
![Low Stock List](https://github.com/user-attachments/assets/8192d3a2-05e6-4113-89db-cad1e9b53551)
![Low Stock Query Result](https://github.com/user-attachments/assets/fe3c77af-bed7-45f4-bbf7-8f983d9e104a)

### 8. Category-wise Inventory Summary (Aggregation)
Category summary report generated using MongoDB aggregation pipeline:
![Inventory Summary Aggregation](https://github.com/user-attachments/assets/98455991-aba1-40cb-9205-62d8d034b3aa)

---

## Author

- **Vinayak Vashisth**
- **Roll Number**: 2501730150
- **Academic Project**: Web Development III
