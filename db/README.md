# Unified Commerce Database (POS + Ecommerce)

Production-ready schema for a unified small-business commerce platform using PostgreSQL, Drizzle ORM, Supabase, and TypeScript.

## Folder structure

```txt
db/
├── index.ts
├── schema/
├── relations/
├── migrations/
```

## Suggested migration order

1. `schema/enums.ts`
2. `schema/users.ts` (`users`, `addresses`, `sessions`)
3. `schema/catalog.ts` (`categories`, `products`)
4. `schema/inventory.ts` (`inventory`, `inventory_logs`)
5. `schema/commerce.ts` (`carts`, `cart_items`, `coupons`, `orders`, `order_items`, `payments`, `invoices`, `sales_logs`, `audit_logs`)
6. `relations/index.ts` (Drizzle relation metadata only)

## Architectural decisions

- Single source of truth for products/inventory shared by POS and ecommerce.
- Order model unified via `order_source` enum (`pos`, `ecommerce`).
- Transaction-safe checks for inventory balance and order total consistency.
- Monetary fields use precise `numeric(12,2)` values.
- Soft delete enabled where historical retention is useful.
