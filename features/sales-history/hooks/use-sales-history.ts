"use client";

import { useCallback, useState, useTransition } from "react";
import { getSalesHistoryDetailAction } from "../actions/get-sales-history-detail.action";
import { listSalesHistoryAction } from "../actions/list-sales-history.action";
import type { SalesHistoryFilterInput } from "../schemas/sales-history-filter.schema";
import type {
  SalesHistoryDetail,
  SalesHistoryListResult,
  SalesHistoryMode,
} from "../types/sales-history.types";

export function useSalesHistory(
  mode: SalesHistoryMode,
  initialData: SalesHistoryListResult,
) {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState<SalesHistoryFilterInput>({
    page: 1,
    pageSize: 20,
    datePreset: "30d",
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SalesHistoryDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDetailPending, startDetailTransition] = useTransition();

  const fetchList = useCallback(
    (next: SalesHistoryFilterInput) => {
      startTransition(async () => {
        const result = await listSalesHistoryAction(mode, next);
        if (!result.success || !result.data || !("items" in result.data)) {
          return;
        }
        setData(result.data);
        setFilters(next);
      });
    },
    [mode],
  );

  const updateFilters = useCallback(
    (patch: Partial<SalesHistoryFilterInput>) => {
      const next = { ...filters, ...patch, page: patch.page ?? 1 };
      fetchList(next);
    },
    [filters, fetchList],
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchList({ ...filters, page });
    },
    [filters, fetchList],
  );

  const openDetail = useCallback(
    (orderId: string) => {
      setSelectedOrderId(orderId);
      setDetailOpen(true);
      setDetail(null);
      startDetailTransition(async () => {
        const result = await getSalesHistoryDetailAction(mode, orderId);
        if (!result.success || !result.data || !("orderNumber" in result.data)) {
          return;
        }
        setDetail(result.data);
      });
    },
    [mode],
  );

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedOrderId(null);
    setDetail(null);
  }, []);

  return {
    data,
    filters,
    isPending,
    isDetailPending,
    selectedOrderId,
    detail,
    detailOpen,
    updateFilters,
    goToPage,
    openDetail,
    closeDetail,
  };
}
