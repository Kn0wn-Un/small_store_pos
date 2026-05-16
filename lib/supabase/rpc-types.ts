import type { Database, Json } from "@/types/supabase";

export type RpcInventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
export type RpcOrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type RpcPaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type RpcInvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type RpcProductRow = Database["public"]["Tables"]["products"]["Row"];

export type CreateProductWithInventoryResult = {
  product: RpcProductRow;
  inventory: RpcInventoryRow;
};

export type CreateOrderAtomicResult = {
  order: RpcOrderRow;
  payment: RpcPaymentRow;
  invoice: RpcInvoiceRow;
  sales_log: Database["public"]["Tables"]["sales_logs"]["Row"];
};

export type AdjustInventoryAtomicResult = {
  inventory: RpcInventoryRow;
};

export type InventoryAdjustmentOperation = "decrement" | "increment" | "adjust" | "reserve" | "release" | "validate";

export type AdjustInventoryAtomicParams = {
  operation: InventoryAdjustmentOperation;
  productId: string;
  actorUserId?: string;
  quantity?: number;
  newStockQuantity?: number;
  source?: Database["public"]["Enums"]["inventory_source"];
  reason?: Database["public"]["Enums"]["inventory_reason"];
  notes?: string;
  referenceOrderId?: string;
};

export type CreateOrderAtomicParams = {
  orderNumber: string;
  customerId: string;
  source: Database["public"]["Enums"]["order_source"];
  subtotalAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPriceSnapshot: string;
    taxPercentageSnapshot: string;
    lineSubtotal: string;
  }>;
  paymentProvider: Database["public"]["Enums"]["payment_provider"];
  paymentMethod: Database["public"]["Enums"]["payment_method"];
  paymentAmount: string;
  paymentStatus: Database["public"]["Enums"]["payment_status"];
  transactionId?: string;
  paymentMetadata?: Record<string, unknown>;
  invoiceNumber: string;
  invoicePdfUrl?: string;
  actorUserId: string;
};

export type CreateProductWithInventoryParams = {
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  salePrice: string;
  isActive: boolean;
  actorUserId: string;
};

export type RpcDatabase = Database & {
  public: Database["public"] & {
    Functions: {
      create_product_with_inventory: {
        Args: {
          p_category_id: string;
          p_name: string;
          p_slug: string;
          p_description: string | null;
          p_image_url: string | null;
          p_sale_price: number;
          p_is_active: boolean;
          p_actor_user_id: string;
        };
        Returns: Json;
      };
      create_order_atomic: {
        Args: {
          p_order_number: string;
          p_customer_id: string;
          p_source: Database["public"]["Enums"]["order_source"];
          p_subtotal_amount: number;
          p_tax_amount: number;
          p_discount_amount: number;
          p_total_amount: number;
          p_items: Json;
          p_payment_provider: Database["public"]["Enums"]["payment_provider"];
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_payment_amount: number;
          p_payment_status: Database["public"]["Enums"]["payment_status"];
          p_transaction_id: string | null;
          p_payment_metadata: Json | null;
          p_invoice_number: string;
          p_invoice_pdf_url: string | null;
          p_actor_user_id: string;
        };
        Returns: Json;
      };
      adjust_inventory_atomic: {
        Args: {
          p_operation: string;
          p_product_id: string;
          p_actor_user_id: string | null;
          p_quantity: number | null;
          p_new_stock_quantity: number | null;
          p_source: Database["public"]["Enums"]["inventory_source"] | null;
          p_reason: Database["public"]["Enums"]["inventory_reason"] | null;
          p_notes: string | null;
          p_reference_order_id: string | null;
        };
        Returns: Json;
      };
    };
  };
};
