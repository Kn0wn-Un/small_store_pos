import { createClient } from "@/supabase/server";
import { mapOrderItemRow, mapOrderRow, mapPaymentRow, toMoneyString } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";
import { customerInitial } from "@/features/admin-analytics/utils/analytics-format";
import { resolveSearchOrderIds } from "../utils/sales-history-search";
import type {
  CashierOption,
  SalesHistoryDetail,
  SalesHistoryListRow,
  SalesHistorySummary,
} from "../types/sales-history.types";

export type SalesHistoryQueryFilters = {
  page: number;
  pageSize: number;
  search?: string;
  from: Date;
  to: Date;
  paymentStatus?: string;
  orderStatus?: "completed" | "cancelled" | "refunded";
  cashierUserId?: string;
  filterCashierId?: string;
};

export type SalesHistorySummaryFilters = Omit<SalesHistoryQueryFilters, "page" | "pageSize">;

type SalesHistoryOrderListRow = {
  id: string;
  users: { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
  cashier: { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
  payments: { method: string; status: string } | { method: string; status: string }[] | null;
  invoices: { invoice_number: string } | { invoice_number: string }[] | null;
  order_items: { id: string } | { id: string }[] | null;
  [key: string]: unknown;
};

const COMPLETED_STATUSES = ["paid", "processing", "delivered"] as const;

function displayCustomerName(email: string | null | undefined, fullName: string | null | undefined) {
  if (fullName?.trim()) return fullName.trim();
  if (!email) return "Walk-in";
  return email.split("@")[0] ?? "Customer";
}

function displayCashierName(email: string | null | undefined, fullName: string | null | undefined) {
  if (fullName?.trim()) return fullName.trim();
  if (!email) return "Staff";
  return email.split("@")[0] ?? "Staff";
}

function resolveCashierScope(
  filters: Pick<SalesHistoryQueryFilters, "cashierUserId" | "filterCashierId">,
): string | undefined {
  return filters.cashierUserId ?? filters.filterCashierId;
}

export class SalesHistoryRepository {
  async listCashiers(): Promise<CashierOption[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .in("role", ["admin", "cashier"])
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("full_name", { ascending: true });

    throwOnSupabaseError(error);

    return (data ?? []).map((row) => ({
      id: row.id,
      label: row.full_name?.trim() || row.email.split("@")[0] || row.email,
    }));
  }

  private applySharedFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    filters: SalesHistoryQueryFilters,
    searchOrderIds: string[] | null,
  ) {
    let q = query
      .is("deleted_at", null)
      .gte("placed_at", filters.from.toISOString())
      .lte("placed_at", filters.to.toISOString());

    const cashierScope = resolveCashierScope(filters);
    if (cashierScope) {
      q = q.eq("cashier_user_id", cashierScope);
    }

    if (searchOrderIds) {
      if (searchOrderIds.length === 0) {
        return null;
      }
      q = q.in("id", searchOrderIds);
    }

    if (filters.paymentStatus) {
      q = q.eq(
        "payment_status",
        filters.paymentStatus as "paid" | "pending" | "failed" | "refunded",
      );
    }

    if (filters.orderStatus === "cancelled") {
      q = q.eq("status", "cancelled");
    } else if (filters.orderStatus === "refunded") {
      q = q.eq("status", "refunded");
    } else if (filters.orderStatus === "completed") {
      q = q.in("status", [...COMPLETED_STATUSES]);
    }

    return q;
  }

  async listSales(filters: SalesHistoryQueryFilters): Promise<{ rows: SalesHistoryListRow[]; total: number }> {
    const supabase = await createClient();
    const offset = (filters.page - 1) * filters.pageSize;
    const searchOrderIds = await resolveSearchOrderIds(filters.search);

    let query = supabase.from("orders").select(
      `
        *,
        users:customer_id ( email, full_name ),
        cashier:cashier_user_id ( email, full_name ),
        payments ( method, status ),
        invoices ( invoice_number ),
        order_items ( id )
      `,
      { count: "exact" },
    );

    const filtered = this.applySharedFilters(query, filters, searchOrderIds);
    if (filtered === null) {
      return { rows: [], total: 0 };
    }

    const { data, error, count } = await filtered
      .order("placed_at", { ascending: false })
      .range(offset, offset + filters.pageSize - 1);

    throwOnSupabaseError(error);

    const rows: SalesHistoryListRow[] = ((data ?? []) as SalesHistoryOrderListRow[]).map((row) => {
      const order = mapOrderRow(row as unknown as Parameters<typeof mapOrderRow>[0]);
      const customer = Array.isArray(row.users) ? row.users[0] : row.users;
      const cashierUser = Array.isArray(row.cashier) ? row.cashier[0] : row.cashier;
      const payments = Array.isArray(row.payments) ? row.payments : row.payments ? [row.payments] : [];
      const paidPayment = payments.find((p: { status: string }) => p.status === "paid") ?? payments[0];
      const items = Array.isArray(row.order_items) ? row.order_items : row.order_items ? [row.order_items] : [];
      const invoice = Array.isArray(row.invoices) ? row.invoices[0] : row.invoices;
      const customerName = displayCustomerName(customer?.email, customer?.full_name);
      const cashierName = order.cashierUserId
        ? displayCashierName(cashierUser?.email, cashierUser?.full_name)
        : null;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName,
        customerInitial: customerInitial(customerName),
        cashierId: order.cashierUserId,
        cashierName,
        itemCount: items.length,
        totalAmount: order.totalAmount,
        paymentMethod: (paidPayment?.method ?? "cash").toUpperCase(),
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        placedAt: order.placedAt.toISOString(),
        invoiceNumber: invoice?.invoice_number ?? null,
      };
    });

    return { rows, total: count ?? 0 };
  }

  async getSummary(filters: SalesHistorySummaryFilters): Promise<SalesHistorySummary> {
    const supabase = await createClient();
    const cashierScope = resolveCashierScope(filters);

    const { data, error } = await supabase.rpc("sales_history_summary", {
      p_from: filters.from.toISOString(),
      p_to: filters.to.toISOString(),
      p_cashier_user_id: cashierScope ?? null,
      p_payment_status:
        (filters.paymentStatus as "paid" | "pending" | "failed" | "refunded" | null) ?? null,
      p_order_status_filter: filters.orderStatus ?? null,
      p_search: filters.search?.trim() || null,
    });

    throwOnSupabaseError(error);

    const summary = data as {
      ordersCount?: number;
      totalRevenue?: number;
      todaysSales?: number;
      averageOrderValue?: number;
    } | null;

    return {
      totalRevenue: toMoneyString(summary?.totalRevenue ?? 0),
      ordersCount: Number(summary?.ordersCount ?? 0),
      averageOrderValue: toMoneyString(summary?.averageOrderValue ?? 0),
      todaysSales: toMoneyString(summary?.todaysSales ?? 0),
    };
  }

  async getDetail(orderId: string): Promise<SalesHistoryDetail | null> {
    const supabase = await createClient();

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        users:customer_id ( email, full_name ),
        cashier:cashier_user_id ( email, full_name ),
        payments ( * ),
        invoices ( invoice_number )
      `,
      )
      .eq("id", orderId)
      .is("deleted_at", null)
      .maybeSingle();

    throwOnSupabaseError(orderError);
    if (!orderRow) return null;

    const { data: itemRows, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        *,
        products ( name )
      `,
      )
      .eq("order_id", orderId);

    throwOnSupabaseError(itemsError);

    const order = mapOrderRow(orderRow);
    const customer = Array.isArray(orderRow.users) ? orderRow.users[0] : orderRow.users;
    const cashierUser = Array.isArray(orderRow.cashier) ? orderRow.cashier[0] : orderRow.cashier;
    const paymentsRaw = Array.isArray(orderRow.payments) ? orderRow.payments : orderRow.payments ? [orderRow.payments] : [];
    const paymentRow = paymentsRaw[0];
    const payment = paymentRow ? mapPaymentRow(paymentRow) : null;
    const invoice = Array.isArray(orderRow.invoices) ? orderRow.invoices[0] : orderRow.invoices;

    const items = (itemRows ?? []).map((row) => {
      const mapped = mapOrderItemRow(row);
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      return {
        id: mapped.id,
        productName: product?.name ?? "Product",
        quantity: mapped.quantity,
        unitPrice: mapped.unitPriceSnapshot,
        lineSubtotal: mapped.lineSubtotal,
      };
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      placedAt: order.placedAt.toISOString(),
      cashierName: order.cashierUserId
        ? displayCashierName(cashierUser?.email, cashierUser?.full_name)
        : null,
      customerName: displayCustomerName(customer?.email, customer?.full_name),
      invoiceNumber: invoice?.invoice_number ?? null,
      items,
      payment: {
        method: (payment?.method ?? "cash").toUpperCase(),
        status: payment?.status ?? order.paymentStatus,
        transactionId: payment?.transactionId ?? null,
        amount: payment?.amount ?? order.totalAmount,
      },
      totals: {
        subtotal: order.subtotalAmount,
        tax: order.taxAmount,
        discount: order.discountAmount,
        grandTotal: order.totalAmount,
      },
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      cashierUserId: order.cashierUserId,
      customerId: order.customerId,
    };
  }
}

export const salesHistoryRepository = new SalesHistoryRepository();
