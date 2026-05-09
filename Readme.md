# Unified Commerce System

A modern full-stack commerce platform that combines:

* 🧾 POS (Point of Sale) System
* 🛒 E-commerce Storefront
* 📦 Inventory Management
* 📊 Analytics Dashboard
* 👨‍💼 Admin Control Panel

Built using:

* Next.js
* TypeScript
* Supabase
* Tailwind CSS
* shadcn/ui
* Vercel

---

# 🚀 Features

## POS System

* Fast billing interface
* Barcode/product search
* Cart management
* Invoice generation
* Payment handling
* Real-time inventory updates

---

## E-commerce Storefront

* Product catalog
* Product detail pages
* Shopping cart
* Checkout flow
* Order tracking
* Shared inventory with POS

---

## Admin Dashboard

* Product management
* Inventory management
* Sales monitoring
* Order management
* Business analytics
* Low stock alerts

---

## Shared Systems

* Unified product database
* Shared inventory source of truth
* Centralized order management
* Sales analytics
* Invoice generation
* Role-based authentication

---

# 🏗️ Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | Next.js App Router                  |
| Language       | TypeScript                          |
| Styling        | Tailwind CSS                        |
| UI Components  | shadcn/ui                           |
| Backend        | Next.js Server Actions / API Routes |
| Database       | Supabase PostgreSQL                 |
| Authentication | Supabase Auth                       |
| Storage        | Supabase Storage                    |
| Deployment     | Vercel                              |

---

# 📁 Project Structure

```txt
app/
components/
features/
lib/
services/
repositories/
hooks/
store/
types/
schemas/
constants/
middleware/
providers/
utils/
styles/
supabase/
tests/
```

---

# 🧩 Architecture

## Core Domains

### POS

Handles:

* Billing
* Cart
* Payments
* Invoice generation

### Ecommerce

Handles:

* Product browsing
* Checkout
* Orders
* Customer experience

### Admin

Handles:

* Analytics
* Inventory
* Product management
* Monitoring

### Shared/Core

Handles:

* Auth
* Database access
* Validation
* Shared UI
* Utilities

---

# 🔐 Authentication & Authorization

Roles supported:

* Admin
* Cashier
* Customer

Features:

* Protected routes
* Role-based middleware
* Session management
* Secure APIs

---

# 📦 Inventory Rules

* Single source of truth
* Shared between POS and ecommerce
* Auto deduction on order/payment
* Real-time synchronization

---

# 💳 Payment Flow

```txt
Cart → Checkout → Payment → Order Created → Inventory Updated
```

---

# 🧾 POS Flow

```txt
Product Search → Cart → Payment → Invoice → Inventory Update
```

---

# 📊 Analytics

Includes:

* Daily revenue
* Monthly trends
* Top-selling products
* POS vs online sales
* Inventory insights

---

# ⚙️ Environment Variables

Create:

```bash
.env.local
```

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=

PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
```

---

# 🛠️ Development Setup

## Install dependencies

```bash
npm install
```

---

## Run development server

```bash
npm run dev
```

---

## Run linting

```bash
npm run lint
```

---

## Build production app

```bash
npm run build
```

---

# 🗄️ Database

Main tables:

* users
* products
* categories
* inventory
* orders
* order_items
* payments
* invoices
* sales_logs

---

# 📈 MVP Scope

## Included

* Authentication
* POS billing
* Product management
* Inventory management
* Ecommerce storefront
* Checkout system
* Order management
* Invoice generation
* Analytics dashboard

---

## Excluded

* Multi-store support
* Native mobile apps
* AI forecasting
* Offline POS mode
* Advanced accounting

---

# 🚀 Deployment

Hosted on:

* Vercel
* Supabase

---

# 📌 Future Enhancements

## Phase 2

* Loyalty system
* Coupons
* Advanced analytics

## Phase 3

* Multi-branch support
* Delivery tracking
* Real-time sync improvements

---

# 🧪 Testing

Planned:

* Unit testing
* Integration testing
* E2E testing

Tools:

* Vitest
* Playwright
* React Testing Library
