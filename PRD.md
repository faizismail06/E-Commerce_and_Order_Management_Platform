# Product Requirements Document (PRD)
## E-Commerce & Order Management Platform

**Document Version:** 1.0.0 
**Target Platform:** Web Application (Responsive Desktop & Mobile) 
**Target Architecture:** Full-Stack Decoupled (React SPA + Node.js REST API + PostgreSQL) 
**Author:** Full-Stack Web Development Team 
**Status:** Approved for Implementation 

---

## 1. Executive Summary & Project Objectives

### 1.1 Overview
The **E-Commerce & Order Management Platform** is a production-grade, full-stack web application designed to demonstrate enterprise-level web engineering capabilities. Unlike basic CRUD showcase applications, this platform implements complete e-commerce business logic, transactional order lifecycles, real-time inventory synchronization with race condition prevention, multi-channel payment gateway integrations, automated notifications, role-based security, and actionable executive analytics.

The system serves two distinct user experiences:
1. **Customer-Facing Storefront:** A high-conversion, modern, fast e-commerce interface featuring dynamic product exploration, cart management, multi-address checkout, coupon engines, real-time order tracking, and post-purchase product reviews.
2. **Enterprise Admin Dashboard:** A comprehensive operational portal enabling store managers and system administrators to fulfill orders, track courier shipments, manage product catalogs and stock reservations, configure promo campaigns, audit user activity, and export financial sales reports.

### 1.2 Core Business Objectives
- **Zero Overselling Guarantee:** Prevent race conditions when multiple customers purchase limited inventory simultaneously via database-level transactional stock reservation.
- **Secure Payment Verification:** Never rely on client-side transaction responses; strictly confirm order state via Midtrans Sandbox server-to-server webhook validation with cryptographic hash verification.
- **Strict Data Integrity:** Use precise monetary types (`Decimal` in Prisma / PostgreSQL) to prevent floating-point rounding errors in transactions, discounts, shipping costs, and tax calculations.
- **Complete Auditability:** Track all sensitive administrative actions (stock updates, user status changes, order overrides, promo creation) in an immutable Audit Log.

---

## 2. Target Users & Role-Based Access Control (RBAC)

The application enforces strict Role-Based Access Control (RBAC) using JSON Web Tokens (JWT) containing cryptographically signed user roles.

```
 +-------------------------------------------------------+
 | User Roles |
 +-------------------+-------------------+---------------+
 | Customer | Admin | Super Admin |
 +-------------------+-------------------+---------------+
 | Storefront access | Operations portal | Full System |
 | Self-service account| Inventory & Orders| Admin Management|
 +-------------------+-------------------+---------------+
```

### 2.1 Role Definitions & Permission Matrix

| Feature / Action | Customer | Admin | Super Admin |
| :--- | :---: | :---: | :---: |
| Self-Register & Login | [x] | [ ] (Created by Super Admin) | [ ] (System Initialized) |
| Browse Product Catalog & PDP | [x] | [x] | [x] |
| Manage Shopping Cart & Addresses | [x] | [ ] | [ ] |
| Checkout & Pay via Midtrans | [x] | [ ] | [ ] |
| Cancel Order (Pre-Shipment) | [x] (Rules apply) | [x] | [x] |
| Submit Verified Product Review | [x] (If purchased & completed) | [ ] | [ ] |
| Manage Products, Categories & Stock | [ ] | [x] | [x] |
| Update Order Status & Input Tracking # | [ ] | [x] | [x] |
| Create & Manage Promotions | [ ] | [x] | [x] |
| View Admin Dashboard Analytics & Reports | [ ] | [x] | [x] |
| Export Financial & Sales Reports (Excel/PDF) | [ ] | [x] | [x] |
| Manage Customer Accounts (Ban/Activate) | [ ] | [x] | [x] |
| Create / Deactivate Admin Accounts | [ ] | [ ] | [x] |
| View System Audit Logs | [ ] | [ ] | [x] |
| Manage System Configurations | [ ] | [ ] | [x] |

---

## 3. Technology Stack Architecture

### 3.1 Stack Blueprint

```
+-----------------------------------------------------------------------+
| FRONTEND LAYER |
| React 18 + Vite | TypeScript | Tailwind CSS | React Router v6 |
| TanStack Query v5 | React Hook Form + Zod | Axios | Recharts |
+-----------------------------------------------------------------------+
 | REST API (HTTPS / JSON)
 v
+-----------------------------------------------------------------------+
| BACKEND LAYER |
| Node.js | Express.js | TypeScript | JWT | bcrypt | Zod Validation |
| Controllers -> Services -> Repositories Layering |
+-----------------------------------------------------------------------+
 | |
 v (Prisma Client) v (HTTPS Webhook / API)
+------------------------------------+ +------------------------------+
| DATABASE LAYER | | PAYMENT GATEWAY |
| PostgreSQL 15+ (Hosted/Local) | | Midtrans Snap Sandbox API |
| Prisma ORM (Schema & Migrations) | | HMAC SHA512 Signature Verification|
+------------------------------------+ +------------------------------+
```

### 3.2 Technological Decisions & Justifications
- **Frontend Stack:**
 - **React 18 + Vite:** Lightning-fast HMR and bundle compilation.
 - **TypeScript:** Strict type safety across API requests, UI states, and form objects.
 - **Tailwind CSS:** Dynamic, utility-first UI styling enabling custom glassmorphism and modern dark/light themes without CSS bloat.
 - **TanStack Query (React Query):** Automatic background refetching, caching, optimistic updates, and loading/error state management.
 - **React Hook Form + Zod:** Zero-re-render form state management with synchronized client/server validation schema definitions.
 - **Recharts:** High-performance SVG analytics charting for the Enterprise Dashboard.

- **Backend Stack:**
 - **Node.js + Express + TypeScript:** Enterprise-grade asynchronous I/O with clean layer separation (`Routes -> Controllers -> Services -> Repositories`).
 - **JWT & bcrypt:** Stateless authentication with hashed salted password storage (`bcrypt` rounds = 10).
 - **Prisma ORM + PostgreSQL:** Type-safe database interactions with explicit schema migrations, transaction support, and high-precision `Decimal` support.

- **Payment Gateway:**
 - **Midtrans Snap Sandbox:** Industry-standard Indonesian payment gateway integration supporting Credit Card, GoPay, ShopeePay, Bank Transfer (VA), and QRIS.

---

## 4. End-to-End System & Payment Architecture

### 4.1 Payment & Webhook Verification Flow

```
+----------+ +----------+ +----------+ +-------------------+
| Customer | | Frontend | | Backend | | Midtrans Gateway |
+----+-----+ +----+-----+ +----+-----+ +---------+---------+
 | | | |
 | 1. Click Checkout | | |
 |-------------------->| 2. POST /orders | |
 | |-------------------->| 3. Reserve Stock (DB Tx) |
 | | | 4. Call Midtrans API |
 | | |------------------------->|
 | | | 5. Return Snap Token |
 | | 6. Return Token |<-------------------------|
 | |<--------------------| |
 | 7. Trigger Snap Popup | |
 |<--------------------| | |
 | 8. Complete Payment | | |
 |--------------------------------------------------------------------->|
 | | | |
 | | | 9. Webhook Notification |
 | | |<-------------------------|
 | | | 10. Verify HMAC Signature|
 | | | 11. DB Tx: Update Status |
 | | | Confirm Stock |
 | | 12. Poll/Query Status |
 | |-------------------->| |
 | | 13. Order Paid UI | |
 |<--------------------|<--------------------| |
```

> **CRITICAL SECURITY RULE:** Frontend transaction responses are treated solely as UI triggers. Order payment state transitions (`PENDING_PAYMENT` -> `PAID`) are **EXCLUSIVELY** executed after verifying Midtrans Webhook signatures on the backend server.

---

## 5. Detailed Feature & Functional Specifications

### 5.1 Authentication & Authorization
- **Registration:**
 - Fields: Full Name, Email, Password, Phone Number.
 - Validation: Email uniqueness, strong password requirements (min 8 chars, 1 uppercase, 1 number, 1 special char).
 - Role: Default role assigned is `CUSTOMER`. Admin accounts can only be provisioned by Super Admins.
- **Login & Tokens:**
 - Returns JWT containing `{ userId, email, role }`.
 - Token Expiry: Access Token (15 mins), Refresh Token stored in HttpOnly secure cookie (7 days).
- **Password Security:** Passwords hashed using `bcrypt` with salt factor 10. Never stored or logged in plain text.

### 5.2 Customer Storefront

#### A. Homepage Layout
- **Hero Banner:** Carousel showcasing seasonal promotions, featured products, and call-to-action buttons.
- **Category Grid:** Visual cards linking directly to filtered catalog views.
- **Featured & New Products:** Dynamic grids driven by popularity ratings and dynamic creation timestamps.
- **Best Selling Section:** Computed from aggregated completed order line items.
- **Promotional Banner:** Highlight active coupon codes (e.g., `WELCOME10`).

#### B. Product Catalog & PDP (Product Detail Page)
- **Filters:** Category selector, Price Range slider, In-Stock filter, Rating filter.
- **Sorting:** Price Low to High, Price High to Low, Highest Rated, Newest Additions, Best Selling.
- **Search:** Case-insensitive search on Product Name, SKU, and Description.
- **PDP Elements:** Image gallery with zoom, Title, SKU, Category, Weight (in grams), Stock status badge, Price & Discount Price, Star rating summary, verified reviews list, Quantity counter, "Add to Cart" and "Buy Now" buttons.
- **Stock Rules:** If `Available Stock <= 0`, display "Out of Stock" badge and disable checkout triggers.

#### C. Shopping Cart & Address Management
- **Cart Engine:** Persisted in PostgreSQL for logged-in users, mirrored in LocalStorage for guest session sync.
- **Price Integrity:** Cart items store `productId` and `quantity`. Prices are dynamically calculated from backend database state at display time and checkout time.
- **Address Book:**
 - Multi-address capability with custom labels (`Home`, `Office`, `Warehouse`).
 - Required fields: Recipient Name, Phone, Province, City, District, Postal Code, Full Street Address.
 - One address set as `isDefault = true`.

#### D. Checkout Pipeline
- **Validation Stage:** Backend checks:
 1. Product availability & active status.
 2. Inventory availability (`Available Stock >= Requested Quantity`).
 3. Price consistency (recomputed server-side).
 4. Promotion code validity (minimum purchase, expiration date, remaining usage limits).
- **Calculation Formula:**
 $$\text{Subtotal} = \sum (\text{Item Unit Price} \times \text{Quantity})$$
 $$\text{Discount} = \text{CalculatePromo}(\text{PromoCode}, \text{Subtotal})$$
 $$\text{Grand Total} = \text{Subtotal} - \text{Discount} + \text{Shipping Fee}$$

---

## 6. Business Logic, State Machines & Algorithms

### 6.1 Order Lifecycle State Machine

```
 +-------------------+
 | PENDING_PAYMENT |
 +---------+---------+
 |
 +----------------+----------------+
 | (Payment OK) | (Cancel/Exp) | (Payment Fail)
 v v v
 +----+---+ +-----+----+ +-----+------+
 | PAID | |CANCELLED | |PAYMENT_FAIL|
 +----+---+ +----------+ +------------+
 |
 v (Admin Action: Process)
+------+-----+
| PROCESSING |
+------+-----+
 |
 v (Admin Action: Ship with Tracking #)
 +----+---+
 | SHIPPED|
 +----+---+
 |
 v (System/Customer Action: Delivery Confirm)
+------+-----+
| DELIVERED |
+------+-----+
 |
 v (Customer Confirm / Auto 7-day completion)
+------+-----+
| COMPLETED | <-- Customer can now post verified review
+------------+
```

### 6.2 Stock Synchronization & Concurrency Control

To eliminate race conditions (overselling when stock = 1 and multiple users checkout simultaneously), the backend uses PostgreSQL **Row-Level Locking (`SELECT FOR UPDATE`)** inside Prisma database transactions:

$$\text{Available Stock} = \text{Current Stock} - \text{Reserved Stock}$$

```typescript
// Transactional Stock Reservation Logic
await prisma.$transaction(async (tx) => {
 for (const item of orderItems) {
 // Lock row for update
 const product = await tx.$queryRaw`
 SELECT stock, reserved_stock FROM products 
 WHERE id = ${item.productId} FOR UPDATE
 `;
 
 const available = product.stock - product.reserved_stock;
 if (available < item.quantity) {
 throw new Error(`Insufficient stock for product ${item.productId}`);
 }
 
 // Reserve stock
 await tx.product.update({
 where: { id: item.productId },
 data: { reservedStock: { increment: item.quantity } }
 });
 }
});
```

- **Order Creation:** Increments `reservedStock`.
- **Payment Success (Settlement Webhook):** Decrements `stock` by item quantity and decrements `reservedStock` by item quantity.
- **Order Cancellation / Payment Expiry:** Decrements `reservedStock` by item quantity (returning available stock to pool).

### 6.3 Order Number Generator Algorithm
Order numbers must be human-readable, unique, and strictly formatted:

$$\text{Format: } \mathbf{ORD-YYYYMMDD-XXXXXX}$$

Example: `ORD-20260923-000001` (Reset or sequential zero-padded auto-increment counter per day using Redis/DB counter table).

### 6.4 Midtrans Status Mapping Table

| Midtrans Notification Status | Fraud Status / Transaction Status | System Payment Status | System Order Status Action | Stock Action |
| :--- | :--- | :--- | :--- | :--- |
| `settlement` | `accept` | `PAID` | `PAID` | Deduct Stock & Clear Reserved |
| `capture` | `accept` | `PAID` | `PAID` | Deduct Stock & Clear Reserved |
| `pending` | - | `PENDING` | `PENDING_PAYMENT` | Maintain Reserved Stock |
| `deny` | - | `FAILED` | `PAYMENT_FAILED` | Release Reserved Stock |
| `expire` | - | `EXPIRED` | `EXPIRED` | Release Reserved Stock |
| `cancel` | - | `CANCELLED` | `CANCELLED` | Release Reserved Stock |

---

## 7. Admin & Super Admin Core Modules

### 7.1 Real-Time Analytics Dashboard
- **KPI Metrics Cards:** Total Revenue (Rp), Total Orders, Total Active Customers, Total Active Products, Pending Payment Orders, Low Stock Alerts (`Available Stock <= Min Stock`).
- **Interactive Recharts Visualizations:**
 - **Revenue & Order Trends:** Bar/Line combination chart filtered by period (`Today`, `7 Days`, `30 Days`, `This Month`, `Custom Date Range`).
 - **Revenue by Category:** Donut chart breakdown.
 - **Top 5 Selling Products:** Ranking table with units sold and total revenue generated.

### 7.2 Fulfillment & Shipping Management
- Admin order interface provides detailed order timelines.
- Shipping dispatch modal requires: Courier Name (e.g., JNE, POS, TIKI, J&T), Service Type (e.g., REG, YES), Tracking Number (AWB), and Dispatch Date.
- Transitioning order to `SHIPPED` automatically notifies customer with clickable tracking details.

### 7.3 Promotional Campaign Engine
- **Promo Parameters:** Code (e.g. `FLASH20`), Name, Discount Type (`PERCENTAGE` vs `FIXED_AMOUNT`), Value (e.g. `20` or `50000`), Minimum Order Amount, Maximum Discount Cap, Usage Limit, Start Date, End Date, Status (`ACTIVE` / `INACTIVE`).
- System prevents stackable discounts unless explicitly configured.

### 7.4 Comprehensive Reporting & File Export
- Export modules generate detailed **Excel (.xlsx)** and **PDF (.pdf)** reports for:
 1. **Sales Report:** Total sales, net revenue, tax/shipping breakdown, average order value (AOV).
 2. **Product Performance Report:** Inventory valuation, top performers, dead stock.
 3. **Payment Reconciliation Report:** Paid, pending, failed, refunded metrics.

---

## 8. Complete Database Schema (Prisma ORM)

```prisma
datasource db {
 provider = "postgresql"
 url = env("DATABASE_URL")
}

generator client {
 provider = "prisma-client-js"
}

enum RoleName {
 SUPER_ADMIN
 ADMIN
 CUSTOMER
}

enum OrderStatus {
 PENDING_PAYMENT
 PAID
 PROCESSING
 SHIPPED
 DELIVERED
 COMPLETED
 CANCELLED
 PAYMENT_FAILED
 EXPIRED
}

enum PaymentStatus {
 PENDING
 PAID
 FAILED
 EXPIRED
 REFUNDED
}

enum PromoType {
 PERCENTAGE
 FIXED_AMOUNT
}

model User {
 id String @id @default(uuid())
 email String @unique
 password String
 fullName String
 phone String?
 isActive Boolean @default(true)
 roleId String
 role Role @relation(fields: [roleId], references: [id])
 addresses Address[]
 orders Order[]
 reviews Review[]
 cart Cart?
 notifications Notification[]
 auditLogs AuditLog[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@index([email])
 @@map("users")
}

model Role {
 id String @id @default(uuid())
 name RoleName @unique
 description String?
 users User[]

 @@map("roles")
}

model Category {
 id String @id @default(uuid())
 name String @unique
 slug String @unique
 description String?
 imageUrl String?
 products Product[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("categories")
}

model Product {
 id String @id @default(uuid())
 sku String @unique
 name String
 slug String @unique
 description String @db.Text
 price Decimal @db.Decimal(12, 2)
 discountPrice Decimal? @db.Decimal(12, 2)
 stock Int @default(0)
 reservedStock Int @default(0)
 minStock Int @default(5)
 weight Int // weight in grams
 isActive Boolean @default(true)
 categoryId String
 category Category @relation(fields: [categoryId], references: [id])
 images ProductImage[]
 cartItems CartItem[]
 orderItems OrderItem[]
 reviews Review[]
 inventoryLogs InventoryMovement[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@index([slug])
 @@index([categoryId])
 @@map("products")
}

model ProductImage {
 id String @id @default(uuid())
 url String
 isPrimary Boolean @default(false)
 productId String
 product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

 @@map("product_images")
}

model Address {
 id String @id @default(uuid())
 userId String
 user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 recipientName String
 phone String
 province String
 city String
 district String
 postalCode String
 fullAddress String @db.Text
 label String // e.g., "Home", "Office"
 isDefault Boolean @default(false)
 orders Order[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("addresses")
}

model Cart {
 id String @id @default(uuid())
 userId String @unique
 user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 items CartItem[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("carts")
}

model CartItem {
 id String @id @default(uuid())
 cartId String
 cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)
 productId String
 product Product @relation(fields: [productId], references: [id])
 quantity Int
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@unique([cartId, productId])
 @@map("cart_items")
}

model Order {
 id String @id @default(uuid())
 orderNumber String @unique
 userId String
 user User @relation(fields: [userId], references: [id])
 addressId String
 address Address @relation(fields: [addressId], references: [id])
 subtotal Decimal @db.Decimal(12, 2)
 discountAmount Decimal @default(0) @db.Decimal(12, 2)
 shippingCost Decimal @db.Decimal(12, 2)
 grandTotal Decimal @db.Decimal(12, 2)
 orderStatus OrderStatus @default(PENDING_PAYMENT)
 paymentStatus PaymentStatus @default(PENDING)
 courier String?
 courierService String?
 trackingNumber String?
 shippedAt DateTime?
 promotionId String?
 promotion Promotion? @relation(fields: [promotionId], references: [id])
 items OrderItem[]
 payment Payment?
 reviews Review[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@index([orderNumber])
 @@index([userId])
 @@index([orderStatus])
 @@map("orders")
}

model OrderItem {
 id String @id @default(uuid())
 orderId String
 order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
 productId String
 product Product @relation(fields: [productId], references: [id])
 name String // Snapshot product name
 price Decimal @db.Decimal(12, 2) // Snapshot unit price
 quantity Int
 subtotal Decimal @db.Decimal(12, 2)

 @@map("order_items")
}

model Payment {
 id String @id @default(uuid())
 orderId String @unique
 order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
 snapToken String?
 snapRedirectUrl String?
 paymentType String?
 transactionId String? @unique
 transactionStatus String?
 fraudStatus String?
 status PaymentStatus @default(PENDING)
 rawWebhookPayload Json?
 paidAt DateTime?
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("payments")
}

model InventoryMovement {
 id String @id @default(uuid())
 productId String
 product Product @relation(fields: [productId], references: [id])
 type String // IN, OUT, RESERVE, RELEASE
 quantity Int
 reference String // e.g., Order Number or Manual Restock ID
 notes String?
 createdAt DateTime @default(now())

 @@map("inventory_movements")
}

model Promotion {
 id String @id @default(uuid())
 code String @unique
 name String
 type PromoType
 value Decimal @db.Decimal(12, 2)
 minPurchase Decimal @default(0) @db.Decimal(12, 2)
 maxDiscount Decimal? @db.Decimal(12, 2)
 usageLimit Int @default(100)
 usedCount Int @default(0)
 startDate DateTime
 endDate DateTime
 isActive Boolean @default(true)
 orders Order[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@index([code])
 @@map("promotions")
}

model Review {
 id String @id @default(uuid())
 productId String
 product Product @relation(fields: [productId], references: [id])
 userId String
 user User @relation(fields: [userId], references: [id])
 orderId String
 order Order @relation(fields: [orderId], references: [id])
 rating Int // 1 to 5
 comment String @db.Text
 createdAt DateTime @default(now())

 @@unique([userId, orderId, productId])
 @@map("reviews")
}

model Notification {
 id String @id @default(uuid())
 userId String
 user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 title String
 message String
 isRead Boolean @default(false)
 type String // ORDER_STATUS, LOW_STOCK, PAYMENT
 createdAt DateTime @default(now())

 @@map("notifications")
}

model AuditLog {
 id String @id @default(uuid())
 userId String?
 user User? @relation(fields: [userId], references: [id])
 action String // e.g., UPDATE_PRODUCT, CHANGE_ORDER_STATUS
 module String // e.g., INVENTORY, ORDER, USER
 recordId String?
 metadata Json?
 timestamp DateTime @default(now())

 @@map("audit_logs")
}
```

---

## 9. Comprehensive REST API Specifications

### 9.1 Standard API Envelope
All REST API endpoints return JSON conforming to standard response structures:

**Success Response Envelope:**
```json
{
 "success": true,
 "message": "Operation completed successfully",
 "data": {},
 "meta": {
 "page": 1,
 "limit": 10,
 "totalItems": 50,
 "totalPages": 5
 }
}
```

**Error Response Envelope:**
```json
{
 "success": false,
 "error": {
 "code": "INSUFFICIENT_STOCK",
 "message": "Product SKU-102 has only 2 available units remaining.",
 "details": []
 }
}
```

### 9.2 Complete Endpoint Index

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **AUTH** | | | |
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate refresh token cookie |
| **PRODUCTS** | | | |
| `GET` | `/api/products` | Public | Search, filter & paginate catalog |
| `GET` | `/api/products/:slug` | Public | Get single product by slug |
| `GET` | `/api/categories` | Public | List all categories |
| **CART & ADDRESS** | | | |
| `GET` | `/api/cart` | Customer | Fetch current customer cart |
| `POST` | `/api/cart/items` | Customer | Add product item to cart |
| `PUT` | `/api/cart/items/:id` | Customer | Update item quantity in cart |
| `DELETE` | `/api/cart/items/:id`| Customer | Remove item from cart |
| `GET` | `/api/addresses` | Customer | List saved delivery addresses |
| `POST` | `/api/addresses` | Customer | Create new delivery address |
| `PUT` | `/api/addresses/:id` | Customer | Update existing address |
| `DELETE` | `/api/addresses/:id` | Customer | Delete saved address |
| **PROMOTION & REVIEWS** | | | |
| `POST` | `/api/promotions/validate`| Customer | Validate coupon code against cart |
| `POST` | `/api/reviews` | Customer | Submit verified product review |
| **ORDERS & PAYMENTS** | | | |
| `POST` | `/api/orders` | Customer | Checkout cart & create pending order |
| `GET` | `/api/orders` | Customer | List user's order history |
| `GET` | `/api/orders/:id` | Customer | Get order detail & tracking info |
| `POST` | `/api/orders/:id/cancel`| Customer | Cancel order (if `PENDING_PAYMENT`) |
| `POST` | `/api/payments/create` | Customer | Obtain Midtrans Snap Token for order |
| `POST` | `/api/payments/webhook` | Midtrans Server| Process gateway notification callback |
| **ADMIN & OPERATIONAL** | | | |
| `GET` | `/api/admin/dashboard` | Admin/Super | Fetch KPI cards & chart series data |
| `GET` | `/api/admin/orders` | Admin/Super | Filterable order management list |
| `GET` | `/api/admin/orders/:id` | Admin/Super | Order detail & timeline view |
| `PUT` | `/api/admin/orders/:id/status`| Admin/Super | Update order lifecycle state |
| `PUT` | `/api/admin/orders/:id/ship` | Admin/Super | Input courier & AWB tracking # |
| `POST` | `/api/admin/products` | Admin/Super | Create product with image uploads |
| `PUT` | `/api/admin/products/:id` | Admin/Super | Modify product details & stock |
| `DELETE` | `/api/admin/products/:id` | Admin/Super | Soft delete product catalog item |
| `GET` | `/api/admin/inventory` | Admin/Super | Audit stock levels & alerts |
| `POST` | `/api/admin/promotions` | Admin/Super | Create promotional campaign |
| `GET` | `/api/admin/customers` | Admin/Super | List & manage customer accounts |
| `PUT` | `/api/admin/customers/:id/toggle`| Admin/Super| Enable or suspend customer |
| `GET` | `/api/admin/reports/sales` | Admin/Super | Sales metrics & PDF/Excel export |
| `GET` | `/api/admin/audit-logs` | Super Admin | Query immutable administrative logs |

---

## 10. Security & Non-Functional Requirements

1. **Server-Side Verification Enforcement:** Frontend-provided prices, totals, discounts, shipping fees, or stock counts are **NEVER** trusted. All values are calculated server-side inside transactional boundary handlers.
2. **Webhook Signature Validation:** Midtrans Webhooks are validated using HMAC SHA-512 hashes constructed from:
 $$\text{Signature} = \text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{ServerKey})$$
3. **HTTP Security Headers & CORS:** Helmet middleware enabled for Security Headers (XSS, CSP, HSTS). CORS configured to strictly whitelist the frontend origin (`http://localhost:5174`).
4. **Rate Limiting:** Express Rate Limiting applied (`100 requests per 15 minutes` per IP; `5 attempts per 15 minutes` for `/api/auth/login`).
5. **Sanitization & Zod Validation:** All request payloads parsed and validated against strict Zod schemas prior to reaching controller handlers.

---

## 11. Environment Variables Blueprint (`.env.example`)

### Backend Environment Configuration (`/backend/.env.example`)
```env
# Server Setup
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5174
FRONTEND_URL=http://localhost:5174

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"

# Authentication Security
JWT_SECRET=super_secret_jwt_access_token_key_change_in_production_32chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_key_change_in_production

# Midtrans Payment Gateway (Sandbox Credentials)
MIDTRANS_SERVER_KEY=Mid-server-m7m5KgxdU2we7jwU2w028EVf
MIDTRANS_CLIENT_KEY=Mid-client-jS6re3d154mUXjB6
MIDTRANS_MERCHANT_ID=M212842153
MIDTRANS_IS_PRODUCTION=false
```

### Frontend Environment Configuration (`/frontend/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_MIDTRANS_CLIENT_KEY=Mid-client-jS6re3d154mUXjB6
VITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
```

---

## 12. Complete Phase-by-Phase Roadmap (Phases 1 – 11)

To ensure systematic implementation, development is divided into 11 strictly sequential phases. Progressing to a subsequent phase requires fulfilling 100% of the current phase's Acceptance Criteria.

---

### Phase 1: Core Foundation & Authentication System
- **Objective:** Establish workspace structure, database models, backend Express server, and secure JWT authentication workflows.
- **Tasks:**
 - Initialize Node.js TypeScript project (`/backend`) and React Vite TS project (`/frontend`).
 - Configure Prisma ORM with PostgreSQL connection and run initial migrations (`User`, `Role`).
 - Implement `/api/auth/register`, `/api/auth/login`, and `/api/auth/me` endpoints.
 - Setup JWT middleware and password hashing using `bcrypt`.
 - Frontend: Setup Tailwind CSS, React Router, and Auth Context state with Protected Route wrappers.
- **Database Changes:** Tables `users` and `roles`.
- **API Endpoints:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- **Acceptance Criteria:**
 - User registration succeeds and hashes password in DB.
 - Login returns valid JWT and sets Auth Context in React.
 - Unauthenticated access to protected routes is redirected to Login.

---

### Phase 2: Category & Product Catalog Module
- **Objective:** Enable catalog management, product listing, complex search/filtering, and detail view.
- **Tasks:**
 - Add Prisma schemas for `Category`, `Product`, and `ProductImage`.
 - Build Admin Product & Category CRUD endpoints.
 - Implement public catalog endpoints supporting text search, category filtering, price bounds, sorting, and pagination.
 - Frontend: Build Customer Storefront Product Grid, Search/Filter Toolbar, and Product Detail Page (PDP) with image viewer.
- **Database Changes:** Tables `categories`, `products`, `product_images`.
- **API Endpoints:** `GET /api/products`, `GET /api/products/:slug`, `POST /api/admin/products`, `PUT /api/admin/products/:id`.
- **Acceptance Criteria:**
 - Products display accurately with image galleries and stock indicators.
 - Search and filter queries execute in under 150ms on database indexes.
 - Out of stock products display "Out of Stock" badge and disable purchase actions.

---

### Phase 3: Cart System & Address Management
- **Objective:** Implement shopping cart state persistence and multi-address customer management.
- **Tasks:**
 - Add Prisma schemas for `Cart`, `CartItem`, and `Address`.
 - Backend: Build Cart endpoints for add, update quantity, remove, and get.
 - Build Address CRUD endpoints with default address toggle logic.
 - Frontend: Build Slide-over Cart Drawer, Cart Page, and Address Management Profile tab.
- **Database Changes:** Tables `carts`, `cart_items`, `addresses`.
- **API Endpoints:** `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `GET /api/addresses`, `POST /api/addresses`.
- **Acceptance Criteria:**
 - Cart item quantities correctly update subtotal.
 - Addresses can be set as default (`isDefault: true` unsets previous default).

---

### Phase 4: Order Creation & Midtrans Payment Gateway
- **Objective:** Implement transactional checkout, stock reservation, and Midtrans Snap payment gateway integration with Webhooks.
- **Tasks:**
 - Add Prisma schemas for `Order`, `OrderItem`, and `Payment`.
 - Implement Order Creation logic wrapped in database transaction (`SELECT FOR UPDATE` stock reservation).
 - Integrate Midtrans Snap SDK on backend to request payment tokens.
 - Implement `/api/payments/webhook` handler with HMAC SHA512 signature verification.
 - Frontend: Embed Midtrans Snap popup trigger on Checkout summary page.
- **Database Changes:** Tables `orders`, `order_items`, `payments`.
- **API Endpoints:** `POST /api/orders`, `POST /api/payments/create`, `POST /api/payments/webhook`.
- **Acceptance Criteria:**
 - Checkout creates order with `PENDING_PAYMENT` status and reserves stock.
 - Midtrans Snap popup opens seamlessly on frontend.
 - Webhook callback updates payment status to `PAID` and transitions order status to `PAID`.
 - Invalid signature webhooks are rejected with `400 Bad Request`.

---

### Phase 5: Inventory Synchronization & Concurrency Engine
- **Objective:** Build robust inventory tracking, stock movements, and automatic stock release on order cancellation or payment expiry.
- **Tasks:**
 - Add Prisma schema for `InventoryMovement`.
 - Create automated cron/background job or payment expiry checker to release reserved stock when payment expires.
 - Implement stock adjustment audit trails for inventory movements (`IN`, `OUT`, `RESERVE`, `RELEASE`).
 - Frontend Admin: Inventory management table displaying Current Stock, Reserved Stock, and Available Stock formulas.
- **Database Changes:** Table `inventory_movements`.
- **API Endpoints:** `GET /api/admin/inventory`, `POST /api/admin/inventory/adjust`.
- **Acceptance Criteria:**
 - Concurrent checkout attempts beyond available stock are rejected gracefully.
 - Cancelled or expired orders restore reserved stock back to available stock immediately.

---

### Phase 6: Operational Admin Dashboard & Order Fulfillment
- **Objective:** Deliver enterprise operational portal for managing orders and shipping logistics.
- **Tasks:**
 - Build Admin Order Management table with multi-status filters (`PENDING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED`).
 - Build Order Detail view with full pricing breakdown and step-by-step timeline.
 - Implement Shipping Dispatch modal to record Courier Name, Service Type, and Tracking Number (AWB).
 - Update Order state to `SHIPPED`.
- **API Endpoints:** `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PUT /api/admin/orders/:id/status`, `PUT /api/admin/orders/:id/ship`.
- **Acceptance Criteria:**
 - Admin can transition order state step-by-step through order lifecycle.
 - Inputting tracking number updates status to `SHIPPED` and exposes tracking number to Customer.

---

### Phase 7: Promotion System & Verified Product Reviews
- **Objective:** Launch coupon discount engine and post-purchase verified review module.
- **Tasks:**
 - Add Prisma schemas for `Promotion`, `PromotionUsage`, and `Review`.
 - Backend: Implement Coupon validation logic (`PERCENTAGE` & `FIXED_AMOUNT`, minimum spend, expiration date, max discount).
 - Implement Verified Review submission logic (Verify user bought item in a `COMPLETED` order and has not previously reviewed).
 - Frontend: Promo input field at Checkout and Review form modal on Order History detail.
- **Database Changes:** Tables `promotions`, `reviews`.
- **API Endpoints:** `POST /api/promotions/validate`, `POST /api/reviews`.
- **Acceptance Criteria:**
 - Valid promos deduct exact calculated discount on backend checkout computation.
 - Reviews can ONLY be submitted for products in `COMPLETED` orders.

---

### Phase 8: Executive Analytics & Sales Reports Export
- **Objective:** Provide visual business analytics and downloadable PDF/Excel reporting capabilities.
- **Tasks:**
 - Implement aggregated analytics queries for KPI cards (Total Revenue, Orders, Customers, Products, Low Stock).
 - Integration with Recharts for visual line/bar/pie charts on Admin Dashboard.
 - Implement PDF (via `pdfkit`) and Excel (via `exceljs`) export handlers for Sales, Inventory, and Payment reconciliation reports.
- **API Endpoints:** `GET /api/admin/dashboard`, `GET /api/admin/reports/sales?format=pdf`.
- **Acceptance Criteria:**
 - Dashboard analytics reflect live database records dynamically.
 - PDF and Excel report downloads generate cleanly formatted financial documents.

---

### Phase 9: System Notifications & Audit Logging
- **Objective:** Provide automated notifications for operational events and immutable system audit logging.
- **Tasks:**
 - Add Prisma schemas for `Notification` and `AuditLog`.
 - Backend: Interceptor/middleware service to log sensitive actions (product price changes, order status overrides, user bans, promo creation).
 - Implement Notification trigger service (Order created, payment confirmed, shipped, low stock alert for admin).
 - Frontend: Notification bell dropdown in Customer header & Admin navbar.
- **Database Changes:** Tables `notifications`, `audit_logs`.
- **API Endpoints:** `GET /api/notifications`, `GET /api/admin/audit-logs`.
- **Acceptance Criteria:**
 - Admin actions are strictly recorded in `audit_logs` with actor ID, timestamp, and metadata payload.

---

### Phase 10: UI/UX Polish, Micro-Animations & Responsive Testing
- **Objective:** Elevate visual aesthetics to production-level standards with micro-animations, loading skeletons, and responsive layouts.
- **Tasks:**
 - Integrate Lucide Icons, glassmorphism cards, dynamic hover states, and smooth modal transitions.
 - Implement dedicated Loading Skeletons, Empty States ("Your cart is empty", "No orders found"), and Error Boundary toasts.
 - Perform thorough cross-device responsive testing (Mobile, Tablet, Desktop).
- **Acceptance Criteria:**
 - Zero layout breaking across viewport widths (320px to 4K).
 - All asynchronous states (loading, error, empty, success) provide clean user feedback.

---

### Phase 11: Production Seeding, Testing Suite & GitHub Portfolio Setup
- **Objective:** Populate realistic database seed data, write test suites, and write professional portfolio documentation.
- **Tasks:**
 - Create robust Prisma Seed script (`prisma/seed.ts`): 3 Roles, 5 Users (Super Admin, Admin, Customers), 8 Categories, 50 Products with Unsplash images, Inventory records, Promos, Sample Orders, and Verified Reviews.
 - Write unit and integration tests (Jest / Supertest) verifying auth, stock reservation concurrency, webhook signature check, and promo validation.
 - Construct GitHub `README.md` complete with Architecture Diagrams, System ERD (Mermaid format), Payment Sequence Diagrams, Setup Instructions, and Demo Credentials.
- **Acceptance Criteria:**
 - `npx prisma db seed` populates clean, realistic store data effortlessly.
 - Test suite passes with 100% green status on core business endpoints.

---

## 13. Comprehensive Database Seed & Demo Accounts

### 13.1 Pre-Configured Demo Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@platform.com` | `SuperAdmin123!` | Complete System Control & Audit Logs |
| **Admin Manager** | `admin@platform.com` | `Admin123!` | Product Catalog, Stock & Order Management |
| **Customer Demo** | `customer@platform.com` | `Customer123!` | Customer Storefront, Cart & Checkout |

---

## 14. Acceptance Criteria Master Checklist

- [ ] **Authentication & Security:**
 - [ ] Customer can self-register and log in.
 - [ ] JWT tokens enforce RBAC on all protected routes.
 - [ ] Passwords stored using `bcrypt` hashing (zero plain text).
- [ ] **Catalog & PDP:**
 - [ ] Customer can search products, filter by category and price, and sort items.
 - [ ] PDP displays image gallery, weight, stock, rating, and customer reviews.
 - [ ] Out of stock products are visually badged and purchase disabled.
- [ ] **Cart & Checkout Validation:**
 - [ ] Customer can add items, alter quantities, and apply promo codes.
 - [ ] Backend re-validates stock availability, active status, price integrity, and promo limits during checkout.
- [ ] **Payment & Midtrans Webhook:**
 - [ ] Midtrans Snap popup triggers seamlessly in Sandbox environment.
 - [ ] Backend verifies Webhook signature hash (`SHA512`) prior to altering payment/order status.
 - [ ] Payment status `settlement`/`capture` updates order to `PAID`.
- [ ] **Inventory & Concurrency:**
 - [ ] Stock reservation prevents race conditions during simultaneous checkouts.
 - [ ] Order cancellation or payment expiration restores reserved stock to available inventory.
- [ ] **Order Lifecycle & Shipping:**
 - [ ] State transition follows strictly: `PENDING_PAYMENT` -> `PAID` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` -> `COMPLETED`.
 - [ ] Admin can enter courier and tracking number to update order to `SHIPPED`.
- [ ] **Admin Analytics & Reporting:**
 - [ ] Dashboard displays live KPIs and interactive Recharts graphs with date range filters.
 - [ ] Sales, Product, and Payment reports export cleanly to Excel and PDF formats.
- [ ] **Reviews & Audit Logs:**
 - [ ] Product reviews restricted to verified customers with `COMPLETED` orders.
 - [ ] System records administrative actions in immutable `audit_logs` table.

---

## 15. Portfolio & GitHub Documentation Requirements

The root repository `README.md` must be formatted professionally for recruiters and engineering managers, including:
1. **Badges:** Tech stack icons (React, TypeScript, Express, PostgreSQL, Prisma, Tailwind).
2. **Interactive System Architecture & Sequence Diagrams:** Embedded Mermaid charts for Payment Flow, Order State Machine, and Architecture Layering.
3. **Database ERD Visualizer:** Mermaid diagram of all 18 Prisma schema tables and relationships.
4. **Quick Start Guide:** One-line commands for Docker DB setup, Prisma migration, database seeding, backend server launch, and frontend dev server execution.
5. **API Documentation Table:** Clear breakdown of REST endpoints and request/response payloads.
6. **Testing Execution Guide:** Command instructions to execute backend automated unit/integration tests.
