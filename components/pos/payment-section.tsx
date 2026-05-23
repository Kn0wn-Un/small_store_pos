"use client";

import { cn } from "@/lib/utils";
import type { PosPaymentMethod, PosPaymentProvider } from "@/features/pos/types/pos.types";

const PAYMENT_OPTIONS: Array<{ provider: PosPaymentProvider; method: PosPaymentMethod; label: string }> = [
  { provider: "cash", method: "cash", label: "Cash" },
  { provider: "upi", method: "upi", label: "UPI" },
  { provider: "card", method: "card", label: "Card" },
];

type PaymentSectionProps = {
  selected: PosPaymentProvider;
  onSelect: (provider: PosPaymentProvider, method: PosPaymentMethod) => void;
  disabled?: boolean;
};

export function PaymentSection({ selected, onSelect, disabled }: PaymentSectionProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-[#2C3E57] uppercase">Payment</p>
      <div className="grid grid-cols-3 gap-2">
        {PAYMENT_OPTIONS.map((option) => (
          <button
            key={option.provider}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.provider, option.method)}
            className={cn(
              "rounded-xl border-2 px-2 py-2.5 text-xs font-bold tracking-wide uppercase transition",
              selected === option.provider
                ? "border-[#2C3E57] bg-[#2C3E57] text-white shadow-md"
                : "border-[#B69224]/40 bg-[#F8F1DB] text-[#2C3E57] hover:border-[#B69224]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-[#1A1246]/50">UPI & Card support Razorpay checkout when configured.</p>
    </div>
  );
}
