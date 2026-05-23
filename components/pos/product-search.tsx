"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type ProductSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function ProductSearch({ value, onChange, placeholder = "Search products..." }: ProductSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#2C3E57]/50" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-[#d9cfb7] bg-[#fcfaf7] pl-10 text-[#2C3E57] placeholder:text-[#2C3E57]/40"
      />
    </div>
  );
}
