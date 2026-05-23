"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuantityControlsProps = {
  quantity: number;
  max?: number;
  disabled?: boolean;
  onChange: (quantity: number) => void;
  className?: string;
};

export function QuantityControls({ quantity, max, disabled, onChange, className }: QuantityControlsProps) {
  const atMax = max !== undefined && quantity >= max;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="h-8 w-8 rounded-lg border-[#d9cfb7] bg-white/80 text-[#2C3E57] hover:bg-[#2C3E57] hover:text-white"
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-8 text-center text-sm font-semibold text-[#2C3E57]">{quantity}</span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="h-8 w-8 rounded-lg border-[#d9cfb7] bg-white/80 text-[#2C3E57] hover:bg-[#2C3E57] hover:text-white"
        disabled={disabled || atMax}
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
