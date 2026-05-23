"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { POS_PRODUCT_CARD_CLASS } from "@/features/pos/constants/pos.constants";
import type { PosProduct } from "@/features/pos/types/pos.types";
import { formatPosPrice } from "@/features/pos/utils/pos-format";
import { getInventoryBadge } from "@/utils/storefront";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: PosProduct;
  disabled?: boolean;
  onAdd: (product: PosProduct) => void;
};

export function ProductCard({ product, disabled, onAdd }: ProductCardProps) {
  const badge = getInventoryBadge(product.stockQuantity, product.lowStockThreshold);
  const outOfStock = product.stockQuantity <= 0;

  return (
    <article
      className={cn(
        POS_PRODUCT_CARD_CLASS,
        "hover-glow group flex flex-col overflow-hidden rounded-2xl bg-[#FCFAF7] shadow-md transition duration-300 hover:-translate-y-1",
        outOfStock && "opacity-70",
      )}
    >
      <div className="relative h-28 w-full overflow-hidden bg-[#EFE6D7]">
        <Image
          src={
            product.imageUrl ??
            "https://images.unsplash.com/photo-1626201850129-a96f1f0d9f1e?q=80&w=600&auto=format&fit=crop"
          }
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 200px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <Badge className={cn("absolute right-2 top-2 rounded-full border text-[10px]", badge.className)}>
          {outOfStock ? "Out of stock" : badge.label}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-0.5 text-[10px] font-medium tracking-wider text-[#1A1246]/60 uppercase">SKU {product.sku}</p>
        <h3 className="heading-font navy mb-1 line-clamp-2 text-lg font-bold leading-tight">{product.name}</h3>
        <p className="mb-3 text-sm font-semibold text-[#2C3E57]">{formatPosPrice(product.salePrice)}</p>
        <p className="mb-4 text-xs text-[#1A1246]/70">
          Stock <span className="font-semibold text-[#2C3E57]">{product.stockQuantity}</span>
        </p>
        <Button
          type="button"
          className="mt-auto w-full rounded-xl gold-bg py-5 font-semibold text-[#2C3E57] hover:opacity-90"
          disabled={disabled || outOfStock}
          onClick={() => onAdd(product)}
        >
          {outOfStock ? "Unavailable" : "Add"}
        </Button>
      </div>
    </article>
  );
}
