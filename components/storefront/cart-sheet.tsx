"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  clearStorefrontCartAction,
  getStorefrontCartForSheetAction,
  removeStorefrontCartItemAction,
  updateStorefrontCartItemAction,
} from "@/features/storefront/actions/cart-sheet.action";

type CartData = {
  cartId: string;
  items: Array<{
    cartItemId: string;
    productId: string;
    productName: string | null;
    quantity: number;
    unitPrice: string;
    taxPercentage: string;
    lineSubtotal: string;
  }>;
  totals: {
    subtotal: string;
    taxAmount: string;
    discountAmount: string;
    total: string;
  };
};

export function CartSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [cart, setCart] = useState<CartData | null>(null);

  const itemCount = useMemo(() => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0, [cart]);

  const refreshCart = () => {
    startTransition(async () => {
      const result = await getStorefrontCartForSheetAction();
      if (result.success && result.data) {
        setCart(result.data as CartData);
      }
    });
  };

  useEffect(() => {
    if (open) refreshCart();
  }, [open]);

  const updateQty = (cartItemId: string, quantity: number) => {
    startTransition(async () => {
      const result = await updateStorefrontCartItemAction({ cartItemId, quantity: Math.max(1, quantity) });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      refreshCart();
    });
  };

  const removeItem = (cartItemId: string) => {
    startTransition(async () => {
      const result = await removeStorefrontCartItemAction({ cartItemId });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      refreshCart();
    });
  };

  const clearCart = () => {
    startTransition(async () => {
      const result = await clearStorefrontCartAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      refreshCart();
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
          Cart <Badge className="ml-2 bg-[#B69224] text-white">{itemCount}</Badge>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xl bg-[#FCFAF7]">
        <SheetHeader>
          <SheetTitle className="heading-font text-3xl text-[#2C3E57]">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-4">
          {cart?.items?.length ? (
            <>
              {cart.items.map((item) => (
                <div key={item.cartItemId} className="rounded-xl border border-[#e7dcc2] bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-[#2C3E57]">{item.productName ?? "Product"}</h4>
                    <button
                      type="button"
                      className="text-sm text-red-600"
                      onClick={() => removeItem(item.cartItemId)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => updateQty(item.cartItemId, Number(event.target.value))}
                      className="h-9 w-20"
                    />
                    <p className="text-sm text-[#1A1246]">₹{item.lineSubtotal}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-[#e7dcc2] bg-white p-4 text-sm">
                <p>Subtotal: ₹{cart.totals.subtotal}</p>
                <p>Tax: ₹{cart.totals.taxAmount}</p>
                <p className="mt-2 text-lg font-semibold text-[#2C3E57]">Total: ₹{cart.totals.total}</p>
              </div>
              <div className="flex gap-3">
                <Button className="gold-bg text-white" onClick={clearCart} disabled={isPending}>Clear Cart</Button>
                <Button className="bg-[#2C3E57] text-white" onClick={() => router.push("/checkout")}>
                  Go To Checkout
                </Button>
              </div>
            </>
          ) : (
            <p className="text-[#1A1246]">Your cart is empty.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
