"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StorefrontProduct } from "@/types/storefront/product";
import { getInventoryBadge } from "@/utils/storefront";
import { addProductToStorefrontCartAction } from "@/features/storefront/actions/add-to-cart.action";

type ProductCardProps = {
  product: StorefrontProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCount, addOptimisticCount] = useOptimistic(0, (current) => current + 1);
  const badge = getInventoryBadge(product.stockQuantity, product.lowStockThreshold);
  const canAddToCart = product.stockQuantity > 0;

  const onAddToCart = () => {
    if (!canAddToCart) return;

    addOptimisticCount(1);
    startTransition(async () => {
      const result = await addProductToStorefrontCartAction({
        productId: product.id,
        quantity: 1,
        unitPrice: product.salePrice,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Added to cart");
    });
  };

  return (
    <article className="hover-glow group rounded-[30px] bg-[#FCFAF7] overflow-hidden shadow-md transition duration-500 hover:-translate-y-3">
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imageUrl ?? "https://images.unsplash.com/photo-1626201850129-a96f1f0d9f1e?q=80&w=1200&auto=format&fit=crop"}
            alt={product.name}
            width={1200}
            height={700}
            className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition duration-1000 group-hover:translate-x-full" />
        </Link>
      </div>
      <div className="p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="heading-font navy text-4xl font-bold">{product.name}</h3>
          <Badge className={`rounded-full border px-3 py-1 text-xs ${badge.className}`}>{badge.label}</Badge>
        </div>
        <p className="subtext mb-8 line-clamp-3 leading-relaxed">
          {product.description ?? "Traditional, small-batch homemade quality crafted for premium taste and purity."}
        </p>
        <div className="flex items-center justify-between">
          <h4 className="navy text-4xl font-bold">₹{product.salePrice}</h4>
          <Button
            className="gold-bg px-6 py-3 text-white hover:opacity-90"
            disabled={!canAddToCart || isPending}
            onClick={onAddToCart}
          >
            {isPending ? "Adding..." : optimisticCount > 0 ? `Added (${optimisticCount})` : "Add to Cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}
