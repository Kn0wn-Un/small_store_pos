"use client";

import { useRef, useTransition } from "react";
import { Barcode } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { lookupPosProductByBarcodeAction } from "@/features/pos/actions/lookup-pos-product.action";
import type { PosProduct } from "@/features/pos/types/pos.types";

type BarcodeInputProps = {
  onProductFound: (product: PosProduct) => void;
  disabled?: boolean;
};

export function BarcodeInput({ onProductFound, disabled }: BarcodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await lookupPosProductByBarcodeAction(trimmed);
      if (!result.success || !result.data?.product) {
        toast.error(result.message ?? "Product not found.");
        return;
      }
      onProductFound(result.data.product);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(`Added ${result.data.product.name}`);
    });
  };

  return (
    <div className="relative">
      <Barcode className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#B69224]" />
      <Input
        ref={inputRef}
        disabled={disabled || isPending}
        placeholder="Scan or enter barcode / SKU..."
        className="h-11 rounded-xl border-[#d9cfb7] bg-[#fcfaf7] pl-10 text-[#2C3E57] placeholder:text-[#2C3E57]/40"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e.currentTarget.value);
          }
        }}
      />
    </div>
  );
}
