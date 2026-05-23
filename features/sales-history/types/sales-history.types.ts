import type { Role } from "@/constants/roles";

export type SalesHistoryMode = "admin" | "cashier";

export type SalesHistoryDatePreset = "today" | "7d" | "30d" | "custom";

export type SalesHistoryOrderStatusFilter = "completed" | "cancelled" | "refunded";

export type SalesHistoryPaymentStatusFilter = "paid" | "pending" | "failed" | "refunded";

export type SalesHistoryListRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerInitial: string;
  cashierId: string | null;
  cashierName: string | null;
  itemCount: number;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  placedAt: string;
  invoiceNumber: string | null;
};

export type SalesHistorySummary = {
  totalRevenue: string;
  ordersCount: number;
  averageOrderValue: string;
  todaysSales: string;
};

export type SalesHistoryListResult = {
  items: SalesHistoryListRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  summary: SalesHistorySummary;
};

export type SalesHistoryDetailItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  lineSubtotal: string;
};

export type SalesHistoryDetail = {
  id: string;
  orderNumber: string;
  placedAt: string;
  cashierName: string | null;
  customerName: string;
  /** Used for access checks in service layer; stripped from action responses. */
  customerId?: string | null;
  cashierUserId?: string | null;
  invoiceNumber: string | null;
  items: SalesHistoryDetailItem[];
  payment: {
    method: string;
    status: string;
    transactionId: string | null;
    amount: string;
  };
  totals: {
    subtotal: string;
    tax: string;
    discount: string;
    grandTotal: string;
  };
  orderStatus: string;
  paymentStatus: string;
};

export type CashierOption = {
  id: string;
  label: string;
};

export type SalesHistoryPageContext = {
  mode: SalesHistoryMode;
  userEmail: string;
  role: Role;
  userId: string;
};
