"use client";

import { useCallback, useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import {
  addPosCartItemAction,
  clearPosCartAction,
  getPosCartAction,
  removePosCartItemAction,
  updatePosCartItemAction,
} from "../actions/pos-cart.actions";
import { validateStockAction } from "@/features/inventory/actions/validate-stock.action";
import type { PosCartData } from "../types/pos.types";
import type { PosProduct } from "../types/pos.types";
import { POS_DEFAULT_TAX_PERCENTAGE } from "../constants/pos.constants";

type CartAction =
  | { type: "add"; product: PosProduct; quantity?: number }
  | { type: "update"; cartItemId: string; quantity: number }
  | { type: "remove"; cartItemId: string }
  | { type: "clear" }
  | { type: "sync"; cart: PosCartData };

export function usePosCart(initialCart: PosCartData) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCart, setOptimisticCart] = useOptimistic(initialCart, (state, action: CartAction) => {
    switch (action.type) {
      case "sync":
        return action.cart;
      case "clear":
        return {
          cartId: state.cartId,
          items: [],
          totals: { subtotal: "0.00", taxAmount: "0.00", discountAmount: "0.00", total: "0.00" },
        };
      case "add": {
        const existing = state.items.find((i) => i.productId === action.product.id);
        const qty = action.quantity ?? 1;
        if (existing) {
          const quantity = existing.quantity + qty;
          const lineSubtotal = (Number(existing.unitPrice) * quantity).toFixed(2);
          const items = state.items.map((i) =>
            i.cartItemId === existing.cartItemId ? { ...i, quantity, lineSubtotal } : i,
          );
          return { ...state, items };
        }
        const lineSubtotal = (Number(action.product.salePrice) * qty).toFixed(2);
        return {
          ...state,
          items: [
            ...state.items,
            {
              cartItemId: `temp-${action.product.id}`,
              productId: action.product.id,
              productName: action.product.name,
              quantity: qty,
              unitPrice: action.product.salePrice,
              taxPercentage: POS_DEFAULT_TAX_PERCENTAGE,
              lineSubtotal,
            },
          ],
        };
      }
      case "update": {
        const items = state.items.map((i) =>
          i.cartItemId === action.cartItemId
            ? {
                ...i,
                quantity: action.quantity,
                lineSubtotal: (Number(i.unitPrice) * action.quantity).toFixed(2),
              }
            : i,
        );
        return { ...state, items };
      }
      case "remove":
        return { ...state, items: state.items.filter((i) => i.cartItemId !== action.cartItemId) };
      default:
        return state;
    }
  });

  const syncCart = useCallback(() => {
    startTransition(async () => {
      const result = await getPosCartAction();
      if (result.success && result.data) {
        setOptimisticCart({ type: "sync", cart: result.data });
      }
    });
  }, []);

  const addProduct = useCallback(
    (product: PosProduct, quantity = 1) => {
      if (product.stockQuantity <= 0) {
        toast.error("Product is out of stock.");
        return;
      }

      startTransition(async () => {
        setOptimisticCart({ type: "add", product, quantity });

        const stockCheck = await validateStockAction({ productId: product.id, quantity });
        if (!stockCheck.success) {
          toast.error(stockCheck.message);
          syncCart();
          return;
        }

        const result = await addPosCartItemAction({
          productId: product.id,
          quantity,
          unitPrice: product.salePrice,
          taxPercentage: POS_DEFAULT_TAX_PERCENTAGE,
        });

        if (!result.success) {
          toast.error(result.message);
          syncCart();
          return;
        }

        syncCart();
      });
    },
    [syncCart],
  );

  const updateQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (quantity < 1) return;
      startTransition(async () => {
        setOptimisticCart({ type: "update", cartItemId, quantity });
        const result = await updatePosCartItemAction({ cartItemId, quantity });
        if (!result.success) {
          toast.error(result.message);
          syncCart();
          return;
        }
        syncCart();
      });
    },
    [syncCart],
  );

  const removeItem = useCallback(
    (cartItemId: string) => {
      startTransition(async () => {
        setOptimisticCart({ type: "remove", cartItemId });
        const result = await removePosCartItemAction({ cartItemId });
        if (!result.success) {
          toast.error(result.message);
          syncCart();
          return;
        }
        syncCart();
      });
    },
    [syncCart],
  );

  const clearCart = useCallback(() => {
    startTransition(async () => {
      setOptimisticCart({ type: "clear" });
      const result = await clearPosCartAction();
      if (!result.success) {
        toast.error(result.message);
        syncCart();
      }
    });
  }, [syncCart]);

  return {
    cart: optimisticCart,
    isPending,
    addProduct,
    updateQuantity,
    removeItem,
    clearCart,
    syncCart,
  };
}
