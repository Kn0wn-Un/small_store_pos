import { createClient } from "@/supabase/server";
import { mapCartItemRow, mapCartRow, toMoneyNumber } from "@/lib/supabase/mappers";
import { throwOnSupabaseError } from "@/lib/supabase/query";

export class CartRepository {
  async createCart(payload: { userId?: string; source: "pos" | "ecommerce" }) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("carts")
      .insert({
        user_id: payload.userId ?? null,
        source: payload.source,
      })
      .select("*")
      .single();

    throwOnSupabaseError(error);
    if (!data) {
      throw new Error("Cart creation failed.");
    }
    return mapCartRow(data);
  }

  async getCartById(cartId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("carts").select("*").eq("id", cartId).maybeSingle();
    throwOnSupabaseError(error);
    return data ? mapCartRow(data) : null;
  }

  async getCartItems(cartId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        quantity,
        unit_price,
        tax_percentage,
        products ( name )
      `,
      )
      .eq("cart_id", cartId);

    throwOnSupabaseError(error);

    return (data ?? []).map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      return {
        cartItemId: row.id,
        productId: row.product_id,
        productName: product?.name ?? "",
        quantity: row.quantity,
        unitPrice: String(row.unit_price),
        taxPercentage: String(row.tax_percentage),
      };
    });
  }

  async getCartItemByProduct(cartId: string, productId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .maybeSingle();

    throwOnSupabaseError(error);
    return data ? mapCartItemRow(data) : null;
  }

  async addCartItem(payload: {
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    taxPercentage: string;
  }) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        cart_id: payload.cartId,
        product_id: payload.productId,
        quantity: payload.quantity,
        unit_price: toMoneyNumber(payload.unitPrice),
        tax_percentage: toMoneyNumber(payload.taxPercentage),
      })
      .select("*")
      .single();

    throwOnSupabaseError(error);
    if (!data) {
      throw new Error("Cart item creation failed.");
    }
    return mapCartItemRow(data);
  }

  async updateCartItemQuantity(payload: { cartItemId: string; quantity: number }) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: payload.quantity })
      .eq("id", payload.cartItemId)
      .select("*")
      .maybeSingle();

    throwOnSupabaseError(error);
    return data ? mapCartItemRow(data) : null;
  }

  async deleteCartItem(cartItemId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("cart_items").delete().eq("id", cartItemId).select("*").maybeSingle();

    throwOnSupabaseError(error);
    return data ? mapCartItemRow(data) : null;
  }

  async clearCart(cartId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId);
    throwOnSupabaseError(error);
  }
}

export const cartRepository = new CartRepository();
