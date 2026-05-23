# Sales History — Migration Notes

## Database migration

Apply:

```bash
supabase db push
# or run SQL manually:
# supabase/migrations/20250523120000_orders_cashier_rls.sql
```

### Changes

1. **`orders.cashier_user_id`** (nullable FK → `users.id`, indexed)
2. **Backfill** from `audit_logs` where `entity_name = 'orders'` and `action = 'create'`
3. **`create_order_atomic`** — new argument `p_cashier_user_id`; persisted on insert
4. **`sales_history_summary`** RPC — KPI aggregates with search/cashier/status filters (revenue = paid orders only; AOV = revenue / paid count)
5. **RLS** on `orders` — admin: all rows; cashier: `cashier_user_id = auth.uid()`; customer: `customer_id = auth.uid()`

### After migrate

- Redeploy / restart Next.js so server code uses new RPC signature.
- New POS checkouts set `cashier_user_id` to the authenticated cashier.
- Legacy rows rely on backfill; mis-attributed audit actors (old POS used `customer_id` as actor) may need manual correction.

### Drizzle

`db/schema/commerce.ts` includes `cashierUserId` for schema parity; run Drizzle migrate separately if you use it for local DDL.

## Application changes

- **Order access policy:** `lib/auth/order-access-policy.ts`
- **Create order:** passes `actorUserId` + `cashierUserId` from authenticated POS/checkout actions
- **Read order:** `getOrder`, `listOrders`, cancel/status mutations enforce `canViewOrder`
- **Sales history:** scopes by `cashier_user_id`; KPI via `sales_history_summary` RPC; search via `resolveSearchOrderIds`

## Regression checklist

### Database

- [ ] Migration `20250523120000_orders_cashier_rls.sql` applied without errors
- [ ] `orders.cashier_user_id` column exists and is indexed
- [ ] `sales_history_summary` RPC returns JSON with `ordersCount`, `totalRevenue`, `todaysSales`, `averageOrderValue`
- [ ] RLS enabled on `orders`; admin/cashier/customer policies active

### Cashier attribution

- [ ] Complete a POS sale as cashier A → `orders.cashier_user_id` = cashier A’s user id
- [ ] Ecommerce checkout as customer → `cashier_user_id` is NULL
- [ ] `/pos/history` shows only cashier A’s sales (not other cashiers)
- [ ] `/admin/orders` shows all sales; cashier filter narrows correctly

### RBAC

- [ ] Cashier cannot open `/admin/orders` (redirect)
- [ ] Cashier cannot call `getOrderAction` for another cashier’s order id (403)
- [ ] Cashier cannot call `listOrdersAction` and see other cashiers’ orders
- [ ] Detail sheet forbidden for another cashier’s order

### KPIs

- [ ] Total revenue excludes non-`paid` orders
- [ ] Orders count matches table `total` for same filters (including search)
- [ ] Today’s sales uses Asia/Kolkata calendar day
- [ ] AOV = total revenue ÷ paid order count (not all orders)

### Search

- [ ] Order number partial match
- [ ] Invoice number match
- [ ] Customer email / name match
- [ ] Payment transaction id match
- [ ] Empty search returns unfiltered (within date/cashier scope)

### UI routes

- [ ] `/admin/orders` — admin mode, KPIs, table, filters, pagination, detail sheet
- [ ] `/pos/history` — cashier layout, own sales only, mobile cards + filters sheet

### Performance

- [ ] List page loads with 20 rows (no full-table fetch for KPIs)
- [ ] Cashier scope uses `cashier_user_id` index (no huge `IN (...)` audit id lists)
