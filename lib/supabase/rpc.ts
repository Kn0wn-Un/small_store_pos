import "server-only";

import type { Json } from "@/types/supabase";
import { createAdminClient } from "@/supabase/admin";
import { throwOnSupabaseError } from "@/lib/supabase/query";
import type {
  AdjustInventoryAtomicParams,
  AdjustInventoryAtomicResult,
  CreateOrderAtomicParams,
  CreateOrderAtomicResult,
  CreateProductWithInventoryParams,
  CreateProductWithInventoryResult,
} from "@/lib/supabase/rpc-types";
import { toMoneyNumber } from "@/lib/supabase/mappers";

function getRpcClient() {
  return createAdminClient();
}

function parseRpcResult<T>(data: Json | null): T {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid RPC response payload.");
  }
  return data as T;
}

export async function callCreateProductRpc(
  params: CreateProductWithInventoryParams,
): Promise<CreateProductWithInventoryResult> {
  const supabase = getRpcClient();
  const { data, error } = await supabase.rpc("create_product_with_inventory", {
    p_category_id: params.categoryId,
    p_name: params.name,
    p_slug: params.slug,
    p_description: params.description,
    p_image_url: params.imageUrl,
    p_sale_price: toMoneyNumber(params.salePrice),
    p_is_active: params.isActive,
    p_actor_user_id: params.actorUserId ?? null,
  });

  throwOnSupabaseError(error);
  return parseRpcResult<CreateProductWithInventoryResult>(data);
}

export async function callCreateOrderRpc(params: CreateOrderAtomicParams): Promise<CreateOrderAtomicResult> {
  const supabase = getRpcClient();
  const items: Json = params.items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    unit_price_snapshot: toMoneyNumber(item.unitPriceSnapshot),
    tax_percentage_snapshot: toMoneyNumber(item.taxPercentageSnapshot),
    line_subtotal: toMoneyNumber(item.lineSubtotal),
  }));

  const { data, error } = await supabase.rpc("create_order_atomic", {
    p_order_number: params.orderNumber,
    p_customer_id: params.customerId,
    p_source: params.source,
    p_subtotal_amount: toMoneyNumber(params.subtotalAmount),
    p_tax_amount: toMoneyNumber(params.taxAmount),
    p_discount_amount: toMoneyNumber(params.discountAmount),
    p_total_amount: toMoneyNumber(params.totalAmount),
    p_items: items,
    p_payment_provider: params.paymentProvider,
    p_payment_method: params.paymentMethod,
    p_payment_amount: toMoneyNumber(params.paymentAmount),
    p_payment_status: params.paymentStatus,
    p_transaction_id: params.transactionId ?? null,
    p_payment_metadata: (params.paymentMetadata ?? null) as Json | null,
    p_invoice_number: params.invoiceNumber,
    p_invoice_pdf_url: params.invoicePdfUrl ?? null,
    p_actor_user_id: params.actorUserId ?? null,
  });

  throwOnSupabaseError(error);
  return parseRpcResult<CreateOrderAtomicResult>(data);
}

export async function callInventoryAdjustmentRpc(
  params: AdjustInventoryAtomicParams,
): Promise<AdjustInventoryAtomicResult> {
  const supabase = getRpcClient();
  const { data, error } = await supabase.rpc("adjust_inventory_atomic", {
    p_operation: params.operation,
    p_product_id: params.productId,
    p_actor_user_id: params.actorUserId ?? null,
    p_quantity: params.quantity ?? null,
    p_new_stock_quantity: params.newStockQuantity ?? null,
    p_source: params.source ?? null,
    p_reason: params.reason ?? null,
    p_notes: params.notes ?? null,
    p_reference_order_id: params.referenceOrderId ?? null,
  });

  throwOnSupabaseError(error);
  return parseRpcResult<AdjustInventoryAtomicResult>(data);
}
