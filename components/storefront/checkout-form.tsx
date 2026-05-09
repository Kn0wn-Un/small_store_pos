"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutSessionAction } from "@/features/storefront/actions/checkout-session.action";
import { openRazorpayCheckout } from "@/lib/razorpay";

const checkoutFormSchema = z.object({
  customerId: z.string().uuid("Valid customer ID is required"),
  addressId: z.string().uuid().optional().or(z.literal("")),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer"]),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerId: "",
      addressId: "",
      paymentMethod: "upi",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createCheckoutSessionAction({
        customerId: values.customerId,
        addressId: values.addressId || undefined,
        paymentMethod: values.paymentMethod,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (values.paymentMethod === "upi" || values.paymentMethod === "card") {
        try {
          openRazorpayCheckout({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
            amount: Math.round(Number(result.data?.paymentPayload?.amount ?? 0) * 100),
            currency: "INR",
            name: "SATHVAM",
            description: "Storefront order payment",
            order_id: result.data?.orderId ?? undefined,
            handler: () => {
              toast.success("Payment successful.");
            },
            theme: { color: "#2C3E57" },
          });
        } catch {
          toast.error("Unable to open Razorpay checkout.");
        }
      }

      toast.success("Order created successfully.");
    });
  });

  return (
    <form onSubmit={onSubmit} className="shadcn-card rounded-3xl p-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="customerId">Customer ID</Label>
        <Input id="customerId" {...form.register("customerId")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="addressId">Address ID (optional)</Label>
        <Input id="addressId" {...form.register("addressId")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <select
          id="paymentMethod"
          {...form.register("paymentMethod")}
          className="h-10 w-full rounded-lg border border-input bg-background px-3"
        >
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>
      <Button type="submit" className="gold-bg w-full text-white" disabled={isPending}>
        {isPending ? "Processing..." : "Place Order"}
      </Button>
    </form>
  );
}
