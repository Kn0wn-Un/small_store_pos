"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentOrderRow } from "@/features/admin-analytics/types/analytics.types";
import { formatInrFull } from "@/features/admin-analytics/utils/analytics-format";
import { cn } from "@/lib/utils";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";

type RecentOrdersProps = {
  orders: RecentOrderRow[];
};

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-purple-100 text-purple-800 border-purple-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <article className={`${ANALYTICS_CARD_CLASS} shadcn-card overflow-hidden rounded-2xl p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="heading-font text-xl font-bold text-[#2C3E57]">Recent Orders</h3>
          <p className="text-sm text-[#1A1246]/60">Latest transactions</p>
        </div>
        <Link href="/admin/orders" className="text-sm font-medium text-[#B69224] hover:underline">
          View all orders
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#e7dcc2] hover:bg-transparent">
              <TableHead className="text-[#1A1246]/70">Order ID</TableHead>
              <TableHead className="text-[#1A1246]/70">Customer</TableHead>
              <TableHead className="text-[#1A1246]/70">Date</TableHead>
              <TableHead className="text-[#1A1246]/70">Amount</TableHead>
              <TableHead className="text-[#1A1246]/70">Payment</TableHead>
              <TableHead className="text-[#1A1246]/70">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-[#e7dcc2]/60">
                <TableCell className="font-mono text-xs font-medium text-[#2C3E57]">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2C3E57] text-xs font-bold text-white">
                      {order.customerInitial}
                    </span>
                    <span className="text-sm text-[#2C3E57]">{order.customerName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#1A1246]/70">{formatDate(order.placedAt)}</TableCell>
                <TableCell className="font-semibold text-[#2C3E57]">{formatInrFull(order.totalAmount)}</TableCell>
                <TableCell className="text-sm text-[#1A1246]/70">{order.paymentMethod}</TableCell>
                <TableCell>
                  <Badge className={cn("rounded-full border capitalize", STATUS_STYLES[order.status] ?? STATUS_STYLES.pending)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" className="text-[#1A1246]/50" aria-label="Order actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </article>
  );
}
