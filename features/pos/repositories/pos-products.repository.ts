import { createClient } from "@/supabase/server";
import { mapStorefrontProduct } from "@/lib/supabase/mappers";
import type { Database } from "@/types/supabase";
import { throwOnSupabaseError } from "@/lib/supabase/query";
import type { PosProductFiltersInput } from "../schemas/pos-product-filters.schema";
import { toPosSku } from "../utils/pos-format";
import type { PosProduct } from "../types/pos.types";

const posProductSelect = `
  id,
  name,
  description,
  image_url,
  category_id,
  sale_price,
  is_active,
  deleted_at,
  categories (
    id,
    name
  ),
  inventory (
    product_id,
    stock_quantity,
    reserved_stock,
    low_stock_threshold
  )
`;

type ProductListRow = Database["public"]["Tables"]["products"]["Row"] & {
  categories?: RawCategory | RawCategory[] | null;
  inventory?: RawInventory | RawInventory[] | null;
};

type RawCategory = {
  id?: string;
  name?: string | null;
} | null;

type RawInventory = {
  product_id?: string;
  stock_quantity?: number | null;
  reserved_stock?: number | null;
  low_stock_threshold?: number | null;
} | null;

type NormalizedInventory = {
  product_id?: string;
  stock_quantity: number;
  low_stock_threshold: number;
};

function pickCategory(
  categories: RawCategory | RawCategory[] | null | undefined,
): { id?: string; name: string } | null {
  if (categories == null) {
    return null;
  }

  const rows = Array.isArray(categories) ? categories : [categories];
  const category = rows.find((row) => row && typeof row === "object");

  if (!category?.name) {
    return category?.id ? { id: category.id, name: "Uncategorized" } : null;
  }

  return { id: category.id, name: category.name };
}

function pickInventory(
  inventory: RawInventory | RawInventory[] | null | undefined,
  productId: string,
): NormalizedInventory | null {
  if (inventory == null) {
    return null;
  }

  const rows = (Array.isArray(inventory) ? inventory : [inventory]).filter(
    (row): row is NonNullable<RawInventory> => row != null && typeof row === "object",
  );

  if (rows.length === 0) {
    return null;
  }

  const matched =
    rows.find((row) => row.product_id === productId) ??
    rows.find((row) => row.product_id != null) ??
    rows[0];

  if (!matched) {
    return null;
  }

  return {
    product_id: matched.product_id,
    stock_quantity: matched.stock_quantity ?? 0,
    low_stock_threshold: matched.low_stock_threshold ?? 0,
  };
}

function mapRowToPosProduct(row: ProductListRow): PosProduct {
  const category = pickCategory(row.categories);
  const inventoryRow = pickInventory(row.inventory, row.id);

  console.log("INVENTORY ROW:", {
    productId: row.id,
    productName: row.name,
    inventoryRow,
    rawInventory: row.inventory,
  });

  const mapped = mapStorefrontProduct(
    row,
    inventoryRow
      ? {
          stock_quantity: inventoryRow.stock_quantity,
          low_stock_threshold: inventoryRow.low_stock_threshold,
        }
      : null,
    category ? { name: category.name } : null,
  );

  const stockQuantity = inventoryRow?.stock_quantity ?? 0;

  return {
    ...mapped,
    sku: toPosSku(mapped.id),
    stockQuantity,
    lowStockThreshold: inventoryRow?.low_stock_threshold ?? mapped.lowStockThreshold ?? 0,
    inStock: stockQuantity > 0,
    isActive: row.is_active,
  };
}

export class PosProductsRepository {
  async list(filters: PosProductFiltersInput): Promise<{ products: PosProduct[]; total: number }> {
    const supabase = await createClient();
    const offset = (filters.page - 1) * filters.pageSize;

    let query = supabase
      .from("products")
      .select(posProductSelect, { count: "exact" })
      .eq("is_active", true)
      .is("deleted_at", null);

    if (filters.search?.trim()) {
      const term = filters.search.trim().replace(/%/g, "");
      const pattern = `%${term}%`;
      query = query.or(`name.ilike.${pattern},id.ilike.${pattern}`);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    const { data, error, count } = await query
      .order("name", { ascending: true })
      .range(offset, offset + filters.pageSize - 1);

    console.log("POS PRODUCTS RAW:", { data, error, count });

    throwOnSupabaseError(error);

    const products = (data ?? []).map((row) => mapRowToPosProduct(row as ProductListRow));
    console.log("FINAL POS PRODUCTS:", products);

    return { products, total: count ?? 0 };
  }

  async findByBarcode(barcode: string): Promise<PosProduct | null> {
    const trimmed = barcode.trim();
    if (!trimmed) return null;

    const supabase = await createClient();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let query = supabase
      .from("products")
      .select(posProductSelect)
      .eq("is_active", true)
      .is("deleted_at", null);

    if (uuidPattern.test(trimmed)) {
      query = query.eq("id", trimmed);
    } else if (/^[0-9a-f]{8}$/i.test(trimmed)) {
      query = query.ilike("id", `${trimmed}%`);
    } else {
      query = query.ilike("name", `%${trimmed}%`);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    console.log("POS BARCODE LOOKUP RAW:", { barcode: trimmed, data, error });

    throwOnSupabaseError(error);
    if (!data) return null;

    return mapRowToPosProduct(data as ProductListRow);
  }
}

export const posProductsRepository = new PosProductsRepository();
