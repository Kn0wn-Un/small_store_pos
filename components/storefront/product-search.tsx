"use client";

import { Input } from "@/components/ui/input";

type ProductSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="mx-auto mb-12 max-w-xl">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products..."
        className="h-12 rounded-xl border-[#d9cfb7] bg-[#fcfaf7] text-base shadow-sm"
      />
    </div>
  );
}
