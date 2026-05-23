"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItemView } from "@/features/cart/types/cart.types";
import { formatPosPrice } from "@/features/pos/utils/pos-format";
import { QuantityControls } from "./quantity-controls";

type CartItemProps = {
  item: CartItemView;
  maxQuantity?: number;
  disabled?: boolean;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
};

export function CartItemRow({ item, maxQuantity, disabled, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#e7dcc2]/80 bg-white/60 p-3">
      <div className="min-w-0 flex-1">
        <p className="heading-font line-clamp-1 text-base font-semibold text-[#2C3E57]">
          {item.productName ?? "Product"}
        </p>
        <p className="text-xs text-[#1A1246]/60">{formatPosPrice(item.unitPrice)} each</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <QuantityControls
            quantity={item.quantity}
            max={maxQuantity}
            disabled={disabled}
            onChange={(qty) => onUpdateQuantity(item.cartItemId, qty)}
          />
          <p className="text-sm font-bold text-[#2C3E57]">{formatPosPrice(item.lineSubtotal)}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-[#1A1246]/50 hover:text-red-600"
        disabled={disabled}
        onClick={() => onRemove(item.cartItemId)}
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
