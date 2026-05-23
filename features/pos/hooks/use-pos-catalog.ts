"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { listPosProductsAction } from "../actions/list-pos-products.action";
import type { PosCategory, PosProduct, PosProductFilters } from "../types/pos.types";

type UsePosCatalogOptions = {
  initialProducts: PosProduct[];
  initialTotal: number;
  categories: PosCategory[];
};

export function usePosCatalog({ initialProducts, initialTotal, categories }: UsePosCatalogOptions) {
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadProducts = useCallback(
    (filters: PosProductFilters) => {
      startTransition(async () => {
        const result = await listPosProductsAction(filters);
        if (result.success && result.data && "products" in result.data) {
          setProducts(result.data.products);
          setTotal(result.data.total);
        }
      });
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadProducts({
        search: search || undefined,
        categoryId,
        page: 1,
        pageSize: 48,
      });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [search, categoryId, loadProducts]);

  return {
    products,
    total,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    categories,
    isPending,
    refresh: () => loadProducts({ search: search || undefined, categoryId, page: 1, pageSize: 48 }),
  };
}
