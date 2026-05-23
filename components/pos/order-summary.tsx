"use client";

import type { CartTotals } from "@/features/cart/types/cart.types";
import { formatPosPrice } from "@/features/pos/utils/pos-format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OrderSummaryProps = {
  totals: CartTotals;
  discountAmount: string;
  onDiscountChange: (value: string) => void;
  itemCount: number;
};

export function OrderSummary({ totals, discountAmount, onDiscountChange, itemCount }: OrderSummaryProps) {
  const discount = Number(discountAmount) || 0;
  const displayTotal = Math.max(0, Number(totals.subtotal) + Number(totals.taxAmount) - discount);

  return (
    <div className="space-y-3 border-t border-[#e7dcc2] pt-4">
      <div className="flex justify-between text-sm text-[#1A1246]/80">
        <span>Items ({itemCount})</span>
        <span>{formatPosPrice(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-[#1A1246]/80">
        <span>Tax</span>
        <span>{formatPosPrice(totals.taxAmount)}</span>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pos-discount" className="text-xs text-[#1A1246]/70">
          Discount (₹)
        </Label>
        <Input
          id="pos-discount"
          type="number"
          min={0}
          step="0.01"
          value={discountAmount}
          onChange={(e) => onDiscountChange(e.target.value)}
          className="h-9 rounded-lg border-[#d9cfb7] bg-[#fcfaf7]"
        />
      </div>
      <div className="flex justify-between border-t border-[#e7dcc2] pt-3">
        <span className="heading-font text-lg font-bold text-[#2C3E57]">Total</span>
        <span className="heading-font text-xl font-bold text-[#B69224]">{formatPosPrice(displayTotal)}</span>
      </div>
    </div>
  );
}
