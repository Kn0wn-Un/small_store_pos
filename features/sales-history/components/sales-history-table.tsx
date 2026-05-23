"use client";

import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";
import { cn } from "@/lib/utils";
import type { SalesHistoryListRow, SalesHistoryMode } from "../types/sales-history.types";
import { PaymentStatusBadge } from "./payment-status-badge";
import { SalesStatusBadge } from "./sales-status-badge";

type SalesHistoryTableProps = {
  mode: SalesHistoryMode;
  rows: SalesHistoryListRow[];
  isPending?: boolean;
  onView: (orderId: string) => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SalesHistoryMobileCard({
  row,
  onView,
}: {
  row: SalesHistoryListRow;
  onView: (orderId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onView(row.id)}
      className="shadcn-card w-full rounded-2xl border border-[#e7dcc2]/60 p-4 text-left transition hover:border-[#B69224]/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs font-semibold text-[#2C3E57]">{row.orderNumber}</p>
          <p className="mt-1 text-sm text-[#1A1246]/60">{formatDate(row.placedAt)}</p>
        </div>
        <p className="heading-font text-lg font-bold text-[#2C3E57]">
          {formatInrFull(row.totalAmount)}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SalesStatusBadge status={row.orderStatus} />
        <PaymentStatusBadge status={row.paymentStatus} />
      </div>
    </button>
  );
}

export function SalesHistoryTable({ mode, rows, isPending, onView }: SalesHistoryTableProps) {
  const showCashier = mode === "admin";
  const showCustomer = mode === "admin";

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <SalesHistoryMobileCard key={row.id} row={row} onView={onView} />
        ))}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#1A1246]/60">No sales found for these filters.</p>
        ) : null}
      </div>

      <article
        className={cn(
          ANALYTICS_CARD_CLASS,
          "shadcn-card hidden overflow-hidden rounded-2xl p-5 md:block",
          isPending && "opacity-60",
        )}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#e7dcc2] hover:bg-transparent">
                <TableHead className="text-[#1A1246]/70">Order #</TableHead>
                {showCustomer ? <TableHead className="text-[#1A1246]/70">Customer</TableHead> : null}
                {showCashier ? <TableHead className="text-[#1A1246]/70">Cashier</TableHead> : null}
                <TableHead className="text-[#1A1246]/70">Items</TableHead>
                <TableHead className="text-[#1A1246]/70">Amount</TableHead>
                <TableHead className="text-[#1A1246]/70">Payment</TableHead>
                <TableHead className="text-[#1A1246]/70">Status</TableHead>
                <TableHead className="text-[#1A1246]/70">Date</TableHead>
                <TableHead className="w-24 text-[#1A1246]/70">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="border-[#e7dcc2]/60">
                  <TableCell className="font-mono text-xs font-medium text-[#2C3E57]">
                    {row.orderNumber}
                  </TableCell>
                  {showCustomer ? (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2C3E57] text-xs font-bold text-white">
                          {row.customerInitial}
                        </span>
                        <span className="text-sm text-[#2C3E57]">{row.customerName}</span>
                      </div>
                    </TableCell>
                  ) : null}
                  {showCashier ? (
                    <TableCell className="text-sm text-[#2C3E57]">
                      {row.cashierName ?? "—"}
                    </TableCell>
                  ) : null}
                  <TableCell className="text-sm text-[#1A1246]/70">{row.itemCount}</TableCell>
                  <TableCell className="font-semibold text-[#2C3E57]">
                    {formatInrFull(row.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs text-[#1A1246]/70">{row.paymentMethod}</p>
                      <PaymentStatusBadge status={row.paymentStatus} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <SalesStatusBadge status={row.orderStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-[#1A1246]/70">
                    {formatDate(row.placedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-[#B69224]"
                        aria-label="View details"
                        onClick={() => onView(row.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-[#1A1246]/30"
                        disabled
                        aria-label="More actions (coming soon)"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#1A1246]/60">No sales found for these filters.</p>
        ) : null}
      </article>
    </>
  );
}
