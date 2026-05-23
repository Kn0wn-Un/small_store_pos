"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PosLayoutShell } from "@/components/pos/pos-layout";
import { PosSidebar } from "@/components/pos/pos-sidebar";
import { useAnalyticsStagger } from "@/features/admin-analytics/hooks/use-analytics-animation";
import { useSalesHistory } from "../hooks/use-sales-history";
import type {
  CashierOption,
  SalesHistoryListResult,
  SalesHistoryMode,
} from "../types/sales-history.types";
import { SalesHistoryDetailsSheet } from "./sales-history-details-sheet";
import { SalesHistoryFilters } from "./sales-history-filters";
import { SalesHistorySummaryCards } from "./sales-history-summary";
import { SalesHistoryTable } from "./sales-history-table";

type SalesHistoryPageProps = {
  mode: SalesHistoryMode;
  userEmail: string;
  role: string;
  initialData: SalesHistoryListResult;
  cashiers: CashierOption[];
};

function SalesHistoryPagination({
  page,
  totalPages,
  disabled,
  onPage,
}: {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-[#1A1246]/60">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPage(page - 1)}
          className="border-[#e7dcc2]"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="border-[#e7dcc2]"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SalesHistoryContent({
  mode,
  userEmail,
  role,
  initialData,
  cashiers,
}: SalesHistoryPageProps) {
  const {
    data,
    filters,
    isPending,
    isDetailPending,
    detail,
    detailOpen,
    updateFilters,
    goToPage,
    openDetail,
    closeDetail,
  } = useSalesHistory(mode, initialData);

  const staggerRef = useAnalyticsStagger([data, isPending]);

  const subtitle =
    mode === "admin"
      ? "All store sales across POS and channels"
      : "Your completed transactions";

  return (
    <div ref={staggerRef} className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header>
        <h1 className="heading-font text-3xl font-bold text-[#2C3E57] md:text-4xl">Sales History</h1>
        <p className="mt-1 text-sm text-[#1A1246]/60 md:text-base">{subtitle}</p>
      </header>

      <SalesHistorySummaryCards summary={data.summary} />

      <SalesHistoryFilters
        mode={mode}
        filters={filters}
        cashiers={cashiers}
        disabled={isPending}
        onChange={updateFilters}
      />

      <SalesHistoryTable
        mode={mode}
        rows={data.items}
        isPending={isPending}
        onView={openDetail}
      />

      <SalesHistoryPagination
        page={data.page}
        totalPages={data.totalPages}
        disabled={isPending}
        onPage={goToPage}
      />

      <SalesHistoryDetailsSheet
        open={detailOpen}
        mode={mode}
        detail={detail}
        isLoading={isDetailPending && detailOpen && !detail}
        onClose={closeDetail}
      />
    </div>
  );
}

export function SalesHistoryPage({
  mode,
  userEmail,
  role,
  initialData,
  cashiers,
}: SalesHistoryPageProps) {
  const content = (
    <SalesHistoryContent
      mode={mode}
      userEmail={userEmail}
      role={role}
      initialData={initialData}
      cashiers={cashiers}
    />
  );

  if (mode === "cashier") {
    return (
      <PosLayoutShell userEmail={userEmail} role={role} title="Sales History">
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <PosSidebar variant="cashier" />
          <div className="min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">{content}</div>
        </div>
      </PosLayoutShell>
    );
  }

  return (
    <div className="-m-6 min-h-screen luxury-background p-4 md:p-6">
      {content}
    </div>
  );
}
