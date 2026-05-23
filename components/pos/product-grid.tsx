"use client";

import { ProductCard } from "./product-card";
import { PosLoadingSkeleton } from "./pos-loading-skeleton";
import { usePosGridAnimation } from "@/features/pos/hooks/use-pos-animation";
import type { PosProduct } from "@/features/pos/types/pos.types";

type ProductGridProps = {
  products: PosProduct[];
  isLoading?: boolean;
  isCartPending?: boolean;
  onAddProduct: (product: PosProduct) => void;
};

export function ProductGrid({ products, isLoading, isCartPending, onAddProduct }: ProductGridProps) {
  const gridRef = usePosGridAnimation([products.length, isLoading]);

  if (isLoading && products.length === 0) {
    return <PosLoadingSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div className="shadcn-card flex min-h-[240px] flex-col items-center justify-center rounded-2xl p-8 text-center">
        <p className="heading-font navy text-2xl font-bold">No products found</p>
        <p className="mt-2 text-sm text-[#1A1246]/70">Try another search or category.</p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          disabled={isCartPending}
          onAdd={onAddProduct}
        />
      ))}
    </div>
  );
}
