"use client";

import { useState } from "react";
import { usePosCatalog } from "@/features/pos/hooks/use-pos-catalog";
import { usePosCart } from "@/features/pos/hooks/use-pos-cart";
import type { PosCartData, PosCategory, PosProduct } from "@/features/pos/types/pos.types";
import { BarcodeInput } from "./barcode-input";
import { CartPanel } from "./cart-panel";
import { CategoryTabs } from "./category-tabs";
import { PosLayoutShell } from "./pos-layout";
import { PosSidebar } from "./pos-sidebar";
import { ProductGrid } from "./product-grid";
import { ProductSearch } from "./product-search";

type PosTerminalProps = {
  initialProducts: PosProduct[];
  initialTotal: number;
  categories: PosCategory[];
  initialCart: PosCartData;
  userEmail: string;
  role: string;
  defaultCustomerId: string;
  sidebarVariant?: "cashier" | "admin";
};

export function PosTerminal({
  initialProducts,
  initialTotal,
  categories,
  initialCart,
  userEmail,
  role,
  defaultCustomerId,
  sidebarVariant = "cashier",
}: PosTerminalProps) {
  const [customerId, setCustomerId] = useState(defaultCustomerId);

  const catalog = usePosCatalog({ initialProducts, initialTotal, categories });
  const cart = usePosCart(initialCart);

  const handleProductFound = (product: PosProduct) => {
    cart.addProduct(product, 1);
  };

  return (
    <PosLayoutShell userEmail={userEmail} role={role}>
      <PosSidebar variant={sidebarVariant} />
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        <section className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="shadcn-card grid gap-3 rounded-2xl p-4 md:grid-cols-2">
            <ProductSearch value={catalog.search} onChange={catalog.setSearch} />
            <BarcodeInput onProductFound={handleProductFound} disabled={cart.isPending} />
          </div>
          <CategoryTabs
            categories={catalog.categories}
            value={catalog.categoryId}
            onChange={catalog.setCategoryId}
          />
          <div className="min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
            <ProductGrid
              products={catalog.products}
              isLoading={catalog.isPending}
              isCartPending={cart.isPending}
              onAddProduct={(product) => cart.addProduct(product, 1)}
            />
          </div>
        </section>

        <CartPanel
          cart={cart.cart}
          products={catalog.products}
          customerId={customerId}
          onCustomerIdChange={setCustomerId}
          isPending={cart.isPending}
          onUpdateQuantity={cart.updateQuantity}
          onRemove={cart.removeItem}
          onClear={cart.clearCart}
          onCheckoutSuccess={cart.syncCart}
          mobileTrigger
          className="min-h-[480px] lg:max-h-[calc(100vh-140px)]"
        />
      </div>
    </PosLayoutShell>
  );
}
