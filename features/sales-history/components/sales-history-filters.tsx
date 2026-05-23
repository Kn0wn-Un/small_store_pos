"use client";

import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ANALYTICS_CARD_CLASS } from "@/features/admin-analytics/hooks/use-analytics-animation";
import { cn } from "@/lib/utils";
import type { SalesHistoryFilterInput } from "../schemas/sales-history-filter.schema";
import type { CashierOption, SalesHistoryMode } from "../types/sales-history.types";

type SalesHistoryFiltersProps = {
  mode: SalesHistoryMode;
  filters: SalesHistoryFilterInput;
  cashiers: CashierOption[];
  disabled?: boolean;
  onChange: (patch: Partial<SalesHistoryFilterInput>) => void;
};

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
] as const;

const PAYMENT_STATUSES = ["paid", "pending", "failed", "refunded"] as const;
const ORDER_STATUSES = ["completed", "cancelled", "refunded"] as const;

function FilterFields({
  mode,
  filters,
  cashiers,
  disabled,
  onChange,
}: SalesHistoryFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchValue.trim();
      const next = trimmed || undefined;
      if (next !== filters.search) {
        onChange({ search: next });
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchValue, filters.search, onChange]);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Input
        placeholder="Order ID, customer, invoice…"
        value={searchValue}
        disabled={disabled}
        onChange={(e) => setSearchValue(e.target.value)}
        className="border-[#e7dcc2] bg-white/80 md:col-span-2 xl:col-span-1"
      />

      <Select
        value={filters.datePreset}
        onValueChange={(value) =>
          onChange({ datePreset: value as SalesHistoryFilterInput["datePreset"] })
        }
        disabled={disabled}
      >
        <SelectTrigger className="border-[#e7dcc2] bg-white/80">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.paymentStatus ?? "all"}
        onValueChange={(value) =>
          onChange({
            paymentStatus:
              value === "all" ? undefined : (value as (typeof PAYMENT_STATUSES)[number]),
          })
        }
        disabled={disabled}
      >
        <SelectTrigger className="border-[#e7dcc2] bg-white/80">
          <SelectValue placeholder="Payment status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All payments</SelectItem>
          {PAYMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.orderStatus ?? "all"}
        onValueChange={(value) =>
          onChange({
            orderStatus:
              value === "all" ? undefined : (value as (typeof ORDER_STATUSES)[number]),
          })
        }
        disabled={disabled}
      >
        <SelectTrigger className="border-[#e7dcc2] bg-white/80">
          <SelectValue placeholder="Order status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All orders</SelectItem>
          {ORDER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mode === "admin" ? (
        <Select
          value={filters.cashierId ?? "all"}
          onValueChange={(value) =>
            onChange({ cashierId: value === "all" ? undefined : value })
          }
          disabled={disabled}
        >
          <SelectTrigger className="border-[#e7dcc2] bg-white/80 md:col-span-2">
            <SelectValue placeholder="Cashier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cashiers</SelectItem>
            {cashiers.map((cashier) => (
              <SelectItem key={cashier.id} value={cashier.id}>
                {cashier.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

export function SalesHistoryFilters(props: SalesHistoryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <article className={cn(ANALYTICS_CARD_CLASS, "shadcn-card hidden rounded-2xl p-4 md:block")}>
        <FilterFields {...props} />
      </article>

      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-[#e7dcc2] bg-white/80 text-[#2C3E57]"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="luxury-background rounded-t-2xl">
            <SheetHeader>
              <SheetTitle className="heading-font text-[#2C3E57]">Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4 pb-6">
              <FilterFields
                {...props}
                onChange={(patch) => {
                  props.onChange(patch);
                }}
              />
              <Button
                className="mt-4 w-full bg-[#2C3E57] text-white"
                onClick={() => setMobileOpen(false)}
              >
                Apply filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
