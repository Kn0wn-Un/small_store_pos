export type TrendDirection = "up" | "down" | "neutral";

export type KpiFormat = "currency" | "number" | "percent";

export type AnalyticsKpi = {
  key: string;
  label: string;
  value: string;
  numericValue: number;
  trendPercent: number | null;
  trendDirection: TrendDirection;
  format: KpiFormat;
};

export type DailySalesPoint = {
  day: string;
  totalSales: string;
  totalTax: string;
  totalDiscount: string;
};

export type MonthlySalesPoint = {
  month: string;
  totalSales: string;
};

export type TopProductRow = {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: string;
};

export type LowStockRow = {
  productId: string;
  productName: string;
  stockQuantity: number;
  lowStockThreshold: number;
};

export type SourceSplitRow = {
  source: "pos" | "ecommerce";
  ordersCount: number;
  revenue: string;
};

export type PaymentBreakdownRow = {
  method: string;
  count: number;
  amount: string;
};

export type CategorySalesRow = {
  categoryName: string;
  revenue: string;
  quantitySold: number;
};

export type RecentOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerInitial: string;
  placedAt: string;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
};

export type AnalyticsAlert = {
  id: string;
  type: "low_stock" | "out_of_stock" | "payment_failed" | "order_failed" | "refund";
  title: string;
  description: string;
  severity: "warning" | "error" | "info";
};

export type AdminAnalyticsDashboard = {
  kpis: AnalyticsKpi[];
  dailySales: DailySalesPoint[];
  monthlySales: MonthlySalesPoint[];
  topProducts: TopProductRow[];
  lowInventory: LowStockRow[];
  sourceSplit: SourceSplitRow[];
  paymentBreakdown: PaymentBreakdownRow[];
  categorySales: CategorySalesRow[];
  recentOrders: RecentOrderRow[];
  alerts: AnalyticsAlert[];
  pendingOrdersCount: number;
};
