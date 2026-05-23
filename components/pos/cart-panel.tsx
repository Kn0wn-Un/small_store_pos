"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { posCheckoutAction } from "@/features/pos/actions/pos-checkout.action";
import type { PosCartData } from "@/features/pos/types/pos.types";
import type { PosPaymentMethod, PosPaymentProvider } from "@/features/pos/types/pos.types";
import type { PosProduct } from "@/features/pos/types/pos.types";
import { CartItemRow } from "./cart-item";
import { CustomerPanel } from "./customer-panel";
import { OrderSummary } from "./order-summary";
import { PaymentSection } from "./payment-section";
import { ShoppingBag } from "lucide-react";

type CartPanelProps = {
  cart: PosCartData;
  products: PosProduct[];
  customerId: string;
  onCustomerIdChange: (value: string) => void;
  isPending?: boolean;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
  onClear: () => void;
  onCheckoutSuccess: () => void;
  className?: string;
  mobileTrigger?: boolean;
};

function CartPanelContent({
  cart,
  products,
  customerId,
  onCustomerIdChange,
  isPending,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckoutSuccess,
}: Omit<CartPanelProps, "className" | "mobileTrigger">) {
  const [paymentProvider, setPaymentProvider] = useState<PosPaymentProvider>("cash");
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("cash");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [isCheckingOut, startCheckout] = useTransition();

  const productStockMap = new Map(products.map((p) => [p.id, p.stockQuantity]));
  const hasItems = cart.items.length > 0;
  const busy = isPending || isCheckingOut;

  const handleCheckout = () => {
    if (!hasItems) {
      toast.error("Add products to the bill first.");
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(customerId)) {
      toast.error("Enter a valid customer UUID.");
      return;
    }

    startCheckout(async () => {
      const result = await posCheckoutAction({
        customerId,
        paymentProvider,
        paymentMethod,
        discountAmount: discountAmount || "0",
        transactionId:
          paymentProvider === "cash" ? undefined : `pos_${Date.now()}`,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const saleId = result.data?.orderId;
      setLastSaleId(saleId ?? null);
      toast.success(saleId ? `Sale completed. Order ${saleId.slice(0, 8)}…` : "Sale completed.");

      if ((paymentProvider === "upi" || paymentProvider === "card") && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        try {
          const total =
            Number(cart.totals.subtotal) + Number(cart.totals.taxAmount) - (Number(discountAmount) || 0);
          openRazorpayCheckout({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: Math.round(Math.max(0, total) * 100),
            currency: "INR",
            name: "SATHVAM",
            description: "POS sale",
            handler: () => toast.success("Payment captured."),
            theme: { color: "#2C3E57" },
          });
        } catch {
          toast.message("Order saved. Razorpay SDK unavailable for capture.");
        }
      }

      setDiscountAmount("0");
      onCheckoutSuccess();
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h2 className="heading-font text-2xl font-bold text-[#2C3E57]">Current Bill</h2>
        <p className="text-sm text-[#1A1246]/60">
          {hasItems ? `${cart.items.length} line items` : "Tap products to start billing."}
        </p>
        {lastSaleId ? (
          <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Sale completed successfully. Sale ID: {lastSaleId}
          </p>
        ) : null}
      </div>

      <CustomerPanel customerId={customerId} onCustomerIdChange={onCustomerIdChange} />

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.cartItemId}
              item={item}
              maxQuantity={productStockMap.get(item.productId)}
              disabled={busy}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 shrink-0 space-y-4">
        <OrderSummary
          totals={cart.totals}
          discountAmount={discountAmount}
          onDiscountChange={setDiscountAmount}
          itemCount={cart.items.reduce((sum, i) => sum + i.quantity, 0)}
        />
        <PaymentSection
          selected={paymentProvider}
          onSelect={(provider, method) => {
            setPaymentProvider(provider);
            setPaymentMethod(method);
          }}
          disabled={busy}
        />
        <Button
          type="button"
          className="w-full rounded-xl py-6 text-base font-semibold gold-bg text-[#2C3E57] hover:opacity-90"
          disabled={busy || !hasItems}
          onClick={handleCheckout}
        >
          {isCheckingOut ? "Processing…" : `Complete Sale (${paymentProvider.toUpperCase()})`}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl border-[#2C3E57] py-5 font-semibold text-[#2C3E57] hover:bg-[#2C3E57] hover:text-white"
          disabled={busy || !hasItems}
          onClick={onClear}
        >
          Clear Bill
        </Button>
      </div>
    </div>
  );
}

export function CartPanel(props: CartPanelProps) {
  const { className, mobileTrigger, cart, ...contentProps } = props;
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const panel = (
    <aside
      className={`shadcn-card hidden h-full flex-col rounded-2xl p-5 shadow-lg lg:flex ${className ?? ""}`}
    >
      <CartPanelContent cart={cart} {...contentProps} />
    </aside>
  );

  if (!mobileTrigger) return panel;

  return (
    <>
      {panel}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full gold-bg shadow-xl lg:hidden"
            size="icon"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-6 w-6 text-[#2C3E57]" />
            {itemCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2C3E57] text-[10px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-md bg-[#FCFAF7] p-5 sm:max-w-lg">
          <SheetHeader className="mb-4">
            <SheetTitle className="heading-font text-2xl text-[#2C3E57]">Current Bill</SheetTitle>
          </SheetHeader>
          <CartPanelContent cart={cart} {...contentProps} />
        </SheetContent>
      </Sheet>
    </>
  );
}
