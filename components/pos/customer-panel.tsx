"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type CustomerPanelProps = {
  customerId: string;
  onCustomerIdChange: (value: string) => void;
  walkInLabel?: string;
};

export function CustomerPanel({
  customerId,
  onCustomerIdChange,
  walkInLabel = "Walk-in customer (your session ID is pre-filled)",
}: CustomerPanelProps) {
  return (
    <div className="space-y-2 rounded-xl border border-[#e7dcc2]/80 bg-white/50 p-3">
      <Label htmlFor="pos-customer" className="text-xs font-semibold tracking-wide text-[#2C3E57] uppercase">
        Customer
      </Label>
      <Input
        id="pos-customer"
        value={customerId}
        onChange={(e) => onCustomerIdChange(e.target.value)}
        placeholder="Customer UUID"
        className="h-9 rounded-lg border-[#d9cfb7] bg-[#fcfaf7] font-mono text-xs"
      />
      <p className="text-[11px] leading-relaxed text-[#1A1246]/60">{walkInLabel}</p>
    </div>
  );
}
