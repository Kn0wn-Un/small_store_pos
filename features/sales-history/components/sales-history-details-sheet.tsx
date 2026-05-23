"use client";

import { Loader2, Printer, Receipt, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import type { SalesHistoryDetail, SalesHistoryMode } from "../types/sales-history.types";
import { PaymentStatusBadge } from "./payment-status-badge";
import { SalesStatusBadge } from "./sales-status-badge";

type SalesHistoryDetailsSheetProps = {
  open: boolean;
  mode: SalesHistoryMode;
  detail: SalesHistoryDetail | null;
  isLoading?: boolean;
  onClose: () => void;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SalesHistoryDetailsSheet({
  open,
  mode,
  detail,
  isLoading,
  onClose,
}: SalesHistoryDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="luxury-background w-full overflow-y-auto border-l border-[#e7dcc2] sm:max-w-lg"
      >
        <SheetHeader className="border-b border-[#e7dcc2]/60 pb-4">
          <SheetTitle className="heading-font text-2xl text-[#2C3E57]">Sale details</SheetTitle>
          <SheetDescription className="text-[#1A1246]/60">
            Order summary and payment breakdown
          </SheetDescription>
        </SheetHeader>

        {isLoading && !detail ? (
          <div className="flex items-center justify-center py-16 text-[#B69224]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : null}

        {detail ? (
          <div className="space-y-6 py-6">
            <section className="shadcn-card rounded-2xl p-4">
              <h3 className="heading-font text-lg font-semibold text-[#2C3E57]">Order info</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Order number</dt>
                  <dd className="font-mono font-medium text-[#2C3E57]">{detail.orderNumber}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Created</dt>
                  <dd className="text-[#2C3E57]">{formatDateTime(detail.placedAt)}</dd>
                </div>
                {mode === "admin" ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#1A1246]/60">Cashier</dt>
                    <dd className="text-[#2C3E57]">{detail.cashierName ?? "—"}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Customer</dt>
                  <dd className="text-[#2C3E57]">{detail.customerName}</dd>
                </div>
                {detail.invoiceNumber ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#1A1246]/60">Invoice</dt>
                    <dd className="font-mono text-[#2C3E57]">{detail.invoiceNumber}</dd>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <SalesStatusBadge status={detail.orderStatus} />
                  <PaymentStatusBadge status={detail.paymentStatus} />
                </div>
              </dl>
            </section>

            <section className="shadcn-card rounded-2xl p-4">
              <h3 className="heading-font text-lg font-semibold text-[#2C3E57]">Items purchased</h3>
              <ul className="mt-3 divide-y divide-[#e7dcc2]/50">
                {detail.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-[#2C3E57]">{item.productName}</p>
                      <p className="text-[#1A1246]/60">
                        {item.quantity} × {formatInrFull(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold text-[#2C3E57]">{formatInrFull(item.lineSubtotal)}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="shadcn-card rounded-2xl p-4">
              <h3 className="heading-font text-lg font-semibold text-[#2C3E57]">Payment</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Method</dt>
                  <dd className="text-[#2C3E57]">{detail.payment.method}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Status</dt>
                  <dd>
                    <PaymentStatusBadge status={detail.payment.status} />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Transaction ID</dt>
                  <dd className="max-w-[180px] truncate font-mono text-xs text-[#2C3E57]">
                    {detail.payment.transactionId ?? "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="shadcn-card rounded-2xl p-4">
              <h3 className="heading-font text-lg font-semibold text-[#2C3E57]">Totals</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Subtotal</dt>
                  <dd className="text-[#2C3E57]">{formatInrFull(detail.totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Tax</dt>
                  <dd className="text-[#2C3E57]">{formatInrFull(detail.totals.tax)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#1A1246]/60">Discount</dt>
                  <dd className="text-[#2C3E57]">−{formatInrFull(detail.totals.discount)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-[#e7dcc2]/60 pt-2 text-base">
                  <dt className="heading-font font-semibold text-[#2C3E57]">Grand total</dt>
                  <dd className="heading-font font-bold text-[#B69224]">
                    {formatInrFull(detail.totals.grandTotal)}
                  </dd>
                </div>
              </dl>
            </section>

            <div className="grid gap-2">
              <Button variant="outline" disabled className="justify-start border-[#e7dcc2] text-[#1A1246]/50">
                <Printer className="mr-2 h-4 w-4" />
                Print receipt (coming soon)
              </Button>
              <Button variant="outline" disabled className="justify-start border-[#e7dcc2] text-[#1A1246]/50">
                <Receipt className="mr-2 h-4 w-4" />
                Refund sale (coming soon)
              </Button>
              <Button variant="outline" disabled className="justify-start border-[#e7dcc2] text-[#1A1246]/50">
                <FileText className="mr-2 h-4 w-4" />
                Generate invoice (coming soon)
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
