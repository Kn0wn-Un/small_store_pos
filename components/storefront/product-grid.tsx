"use client";

import { useMemo, useState } from "react";
import type { StorefrontProduct } from "@/types/storefront/product";
import { useFadeUpAnimation } from "@/hooks/useFadeUpAnimation";
import { ProductCard } from "./product-card";
import { ProductSearch } from "./product-search";

type ProductGridProps = {
  products: StorefrontProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch] = useState("");
  useFadeUpAnimation(".storefront-product-card");

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return products;
    return products.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, search]);

  return (
    <section className="bg-white py-24" id="products">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="gold mb-4 text-sm font-semibold tracking-[5px] uppercase">Our Collection</p>
          <h2 className="heading-font navy text-6xl font-bold">Best Selling Oils</h2>
        </div>
        <ProductSearch value={search} onChange={setSearch} />
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="storefront-product-card">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
