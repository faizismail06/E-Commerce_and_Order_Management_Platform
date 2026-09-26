# NEXUS STORE — Production-Grade E-Commerce & Order Management Platform 

A comprehensive, full-stack E-Commerce & Order Management Platform built with **React 18**, **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, and **Midtrans Snap Payment Gateway**.

Designed and built as a senior full-stack web developer portfolio project featuring a customer-facing storefront and an Executive Admin Console for inventory synchronization, order fulfillment, promo vouchers, verified reviews, and business intelligence analytics.

---

## Key Features

### Storefront & Customer Experience
- **Product Catalog & Search Toolbar**: Public catalog with search bar, category filtering, min/max price range filter, and sorting (*newest, price low/high, rating*).
- **Product Detail Page (PDP)**: Thumbnail gallery switcher, stock status badges, discount indicators, and weight specifications.
- **Cart & Checkout Pipeline**: Server-recalculated cart subtotal, weight-based courier shipping fee calculation (Rp 10.000/kg), and multi-address delivery book.
- **Midtrans Snap Sandbox Integration**: Full payment popup integration with HMAC SHA-512 webhook signature verification callback.
- **Order Timeline Visualizer**: Interactive visual timeline tracking order lifecycle status (`PENDING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `EXPIRED`).
- **Verified Buyer Reviews**: Only buyers with completed orders can submit product star ratings and feedback. PDP includes star distribution progress bar graphs.

### Enterprise Admin & Operations Console
- **Executive Admin Dashboard (`/admin/dashboard`)**: Real-time DB metrics for Total Revenue, Total Orders, Active Products, Low Stock Count, and Total Registered Customers.
- **Order Fulfillment & AWB Shipping Dispatch (`/admin/orders`)**: Filter orders by status, view recipient addresses & item breakdown, update order statuses, and input AWB tracking numbers for shipping couriers (*JNE, TIKI, SiCepat, POS, J&T*).
- **Inventory Concurrency Engine (`/admin/inventory`)**: Monitored inventory formula (`Available Stock = Current Stock - Reserved Stock`), low stock alerts, manual stock restock/reduce modal with audit movement trails, and auto-release scanner for expired pending orders.
- **Customer Account Management (`/admin/customers`)**: View registered buyer profiles, lifetime total spending, order count, and enable/disable customer account status toggle.
- **Promo Vouchers Portal (`/admin/promotions`)**: Create percentage or fixed-amount discount coupons with minimum purchase rules, usage limits, and date range validity checks.
- **Business Intelligence Analytics (`/admin/analytics`)**: Recharts Area Chart for revenue trends over time, Bar Chart for top 5 best-selling products, Donut Chart for category revenue distribution, and CSV Sales Report Exporter.

### Security & Performance
- **Role-Based Access Control (RBAC)**: Stateless JWT authentication with bcrypt password hashing and middleware authorization for `CUSTOMER`, `ADMIN`, and `SUPER_ADMIN`.
- **Rate Limiting**: `express-rate-limit` protecting `/api` endpoints (200 req/15m) and authentication endpoints (20 req/15m).
- **Security Headers & CORS**: Integrated `helmet` and origin verification.
- **Automated Testing Suite**: Jest & Supertest unit & integration test suites.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **State & Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **HTTP Client**: Axios with request/response interceptors

### Backend
- **Runtime & Framework**: Node.js + Express + TypeScript
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (JSON Web Token) + bcrypt
- **Validation**: Zod
- **Payment Gateway**: Midtrans Snap SDK (Sandbox Mode)
- **Security & Testing**: Helmet, Express Rate Limit, Jest, Supertest

---

## Demo Login Credentials

You can test the application using the pre-seeded demo accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@platform.com` | `Customer123!` | Storefront, Cart, Address Book, Checkout, Order Tracking, Product Reviews |
| **Admin** | `admin@platform.com` | `Admin123!` | Executive Dashboard, Order Fulfillment, Inventory Sync, Customer Management, Coupons, BI Analytics |
| **Super Admin** | `superadmin@platform.com` | `SuperAdmin123!` | Full System Control, Audit Logs, Security Access |

---

## Local Setup & Installation

### Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher running locally on `localhost:5432`

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment template & configure database connection
cp .env.example .env

# Run Prisma Database Push (Creates PostgreSQL tables)
npx prisma db push

# Seed 8 Categories, 50 Products, Demo Users, Vouchers, and Reviews
npx prisma db seed

# Start Development Server (Runs on http://localhost:5001)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start Vite Development Server (Runs on http://localhost:5174)
npm run dev
```

### 3. Run Automated Test Suite
```bash
cd backend

# Execute Jest unit & integration test suite
npm test
```

---

## REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/products` | Public | List products with pagination, search, & filters |
| `GET` | `/api/products/:slug` | Public | Get product detail by slug |
| `GET` | `/api/cart` | Customer | Fetch user persistent cart |
| `POST` | `/api/cart/items` | Customer | Add product item to cart |
| `POST` | `/api/orders` | Customer | Create order, reserve stock, & get Midtrans Snap token |
| `POST` | `/api/payments/webhook` | Public | Midtrans payment notification callback (HMAC SHA-512 signature verified) |
| `GET` | `/api/admin/metrics` | Admin | Fetch real-time DB operational metrics |
| `GET` | `/api/admin/orders` | Admin | Fetch admin orders with status filter & search |
| `POST` | `/api/admin/orders/:id/ship` | Admin | Dispatch shipping AWB tracking number |
| `GET` | `/api/admin/inventory` | Admin | Fetch monitored stock, reserved pool, & low stock alerts |
| `POST` | `/api/admin/inventory/adjust` | Admin | Perform manual stock restock/reduce with audit log |
| `GET` | `/api/admin/customers` | Admin | Fetch customer buyer directory & toggle active status |
| `POST` | `/api/promotions/apply` | Customer | Validate and calculate coupon discount |
| `GET` | `/api/products/:id/reviews` | Public | Fetch product reviews & star rating distribution graph |
| `POST` | `/api/products/:id/reviews` | Customer | Submit verified buyer review |
| `GET` | `/api/admin/analytics/overview` | Admin | Fetch revenue trends & sales summary |
| `GET` | `/api/admin/analytics/export` | Admin | Download sales transactions CSV report |

---

## License
This project is licensed under the MIT License — built for portfolio demonstration.
