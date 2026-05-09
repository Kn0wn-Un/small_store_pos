# Unified System: Core POS + E-commerce Platform

---

## 1. Product Overview

### Product Name

Unified Commerce System (POS + E-commerce)

### Summary

A single integrated web platform that combines:

- **Core POS system** (inventory, billing, invoices, analytics, admin control)
- **E-commerce storefront** (customer ordering, cart, checkout, payments)

Both systems share the same backend, database, and product/inventory source of truth.

Built for a **single business (e.g., ice cream store)** and optimized for:

- Speed
- Simplicity
- Low cost
- Easy deployment

---

## 2. Goals

### Primary Goals

- Enable in-store sales through a POS system
- Enable online sales through e-commerce
- Maintain a single source of truth for inventory and products
- Provide real-time sales and business insights
- Minimize operational complexity for small businesses

---

### Secondary Goals

- Reduce manual bookkeeping
- Automate invoice generation
- Synchronize online and offline orders
- Provide unified analytics dashboard

---

## 3. Non-Goals (MVP)

This system will NOT include:

- Multi-store / franchise management
- Advanced accounting systems (Tally-level)
- Marketplace/multi-vendor support
- Mobile apps (native)
- AI forecasting
- Offline-first POS mode (future scope)
- Subscription billing systems

---

## 4. Target Users

### 1. Admin (Business Owner)

- Full system control
- Product & inventory management
- Sales monitoring
- Analytics review

### 2. Cashier (POS User)

- Handles billing
- Processes payments
- Generates invoices

### 3. Customer (E-commerce User)

- Browses products
- Places orders
- Tracks orders

---

## 5. System Architecture

### Tech Stack

### Frontend + Backend

- [Next.js](https://nextjs.org/?utm_source=chatgpt.com) (Full-stack framework)

### Backend Services

- [Supabase](https://supabase.com/?utm_source=chatgpt.com) (Database + Auth + Storage)

### UI

- [Tailwind CSS](https://tailwindcss.com/?utm_source=chatgpt.com)
- [shadcn/ui](https://ui.shadcn.com/?utm_source=chatgpt.com)

### Deployment

- [Vercel](https://vercel.com/?utm_source=chatgpt.com)

---

### High-Level Architecture

```
                    ┌──────────────────────┐
                    │      Vercel App      │
                    │  (Next.js Fullstack) │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
 POS Dashboard        E-commerce Storefront      Admin Panel
 (Billing system)     (Customer app)            (Management)

                               │
                               ▼
                    ┌──────────────────────┐
                    │      Supabase        │
                    │----------------------│
                    │ Auth + DB + Storage  │
                    └──────────────────────┘
```

---

## 6. Core Modules

---

# 6.1 Authentication Module

### Purpose

Secure access for admin, cashier, and customers.

### Features

- Email/password login
- Session management
- Role-based access control:
    - Admin
    - Cashier
    - Customer

### Requirements

- Supabase Auth integration
- Protected routes
- Role middleware

---

# 6.2 Product Management (Single Source of Truth)

### Purpose

Central product system shared between POS and e-commerce.

### Features

- Create/update/delete products
- Categories
- Pricing
- Images
- SKU/barcode
- Active/inactive status

### Key Rule

👉 POS is the **only system allowed to modify products**

---

# 6.3 Inventory Management

### Purpose

Track stock across POS and online orders.

### Features

- Stock tracking per product
- Auto deduction from:
    - POS sales
    - Online orders
- Low stock alerts
- Stock adjustment logs

### Rules

- Inventory is shared between POS + ecommerce
- No duplicate stock systems

---

# 6.4 POS System (In-store Billing Engine)

### Purpose

Enable fast billing at physical store.

### Features

- Product search/barcode scan
- Cart system
- Quantity adjustments
- Discounts
- Tax calculation
- Payment handling (cash/UPI/card)
- Invoice generation

### Flow

```
Select Product → Cart → Payment → Invoice → Inventory Update
```

---

# 6.5 Invoice System

### Purpose

Generate billing receipts for POS and ecommerce.

### Features

- Auto invoice generation
- PDF export
- Invoice numbering
- Tax breakdown
- Reprint support

### Applies To:

- POS transactions
- E-commerce orders

---

# 6.6 Sales Tracking System

### Purpose

Store and track all transactions.

### Features

- Unified sales database (POS + ecommerce)
- Transaction history
- Refund tracking (optional)
- Search/filter sales

### Data Includes

- Order ID
- Source (POS / Online)
- Items
- Total amount
- Payment method
- Timestamp

---

# 6.7 Basic Analytics Module

### Purpose

Provide business insights.

### Features

- Daily sales dashboard
- Monthly revenue trends
- Top products
- Inventory status
- POS vs online sales comparison

### Visuals

- Bar charts
- Line charts
- KPI cards

---

# 6.8 E-commerce Product Catalog

### Purpose

Expose products to customers online.

### Features

- Product listing
- Product detail page
- Search/filter
- Stock visibility (read-only from POS)

---

# 6.9 Cart System

### Purpose

Temporary shopping storage.

### Features

- Add/remove products
- Quantity update
- Price calculation
- Persistent cart (logged-in users)

---

# 6.10 Checkout System

### Purpose

Convert cart into paid order.

### Features

- Address input
- Order summary
- Payment integration
- Order confirmation

### Payment Flow

```
Cart → Checkout → Payment → Order Created → Inventory Update
```

---

# 6.11 Order Management System

### Purpose

Track ecommerce orders and sync with POS.

### Features

- Order creation
- Order status tracking
- Order history
- Cancellation (optional)

### Status Flow

- Pending
- Paid
- Processing
- Delivered
- Cancelled

---

# 6.12 Admin Dashboard (Unified Control Center)

### Purpose

Single control panel for entire system.

### Features

- Business overview
- Sales analytics
- Inventory alerts
- Product management (via POS UI)
- Order monitoring

---

## 7. Data Model (High-Level)

```
users
products
categories
inventory
orders
order_items
payments
invoices
sales_logs
```

### Key Rule

- Products + Inventory = managed by POS
- Orders = shared (POS + ecommerce)
- Sales logs = unified system

---

## 8. Functional Requirements

| ID | Requirement |
| --- | --- |
| FR-1 | System must support authentication for all users |
| FR-2 | POS must handle real-time billing |
| FR-3 | Ecommerce must reflect POS inventory |
| FR-4 | Orders must be stored centrally |
| FR-5 | Invoices must be auto-generated |
| FR-6 | Inventory must sync across POS and ecommerce |
| FR-7 | Analytics must show unified data |
| FR-8 | Payments must be verified before order confirmation |

---

## 9. Non-Functional Requirements

### Performance

- POS actions < 1s response
- Product pages < 2s load time

### Scalability

- 10k+ products
- 1k+ daily transactions

### Security

- Role-based access control
- Secure payment handling
- Protected API routes

### Reliability

- No duplicate orders
- Idempotent payment processing

---

## 10. Deployment Architecture

```
Frontend + Backend (Next.js)
        │
        ▼
   Vercel Hosting
        │
        ▼
 Supabase (Database + Auth + Storage)
```

---

## 11. MVP Scope

### Included

- Authentication
- POS billing system
- Product + inventory management
- Invoice generation
- Sales tracking
- Ecommerce catalog
- Cart + checkout
- Orders system
- Basic analytics

### Excluded

- Multi-store system
- Mobile apps
- AI recommendations
- Offline mode
- Advanced accounting

---

## 12. Success Metrics

### Business Metrics

- Increase in total sales (POS + online)
- Reduced manual billing effort
- Inventory accuracy improvement

### Product Metrics

- Checkout completion rate
- POS transaction speed
- Order success rate

---

## 13. Future Enhancements

### Phase 2

- Customer loyalty system
- Coupons & discounts engine
- Advanced analytics dashboard

### Phase 3

- Real-time POS sync enhancements
- Delivery tracking system
- Multi-branch support

---

## 14. Development Milestones

| Phase | Deliverable |
| --- | --- |
| Phase 1 | Auth + DB setup |
| Phase 2 | Product + Inventory system |
| Phase 3 | POS billing system |
| Phase 4 | Ecommerce storefront |
| Phase 5 | Orders + payments |
| Phase 6 | Analytics dashboard |
| Phase 7 | Deployment + testing |

---

# Final Summary

This system is designed as:

👉 One backend (Supabase)

👉 One frontend (Next.js on Vercel)

👉 Two interfaces (POS + Ecommerce)

👉 One unified business data model