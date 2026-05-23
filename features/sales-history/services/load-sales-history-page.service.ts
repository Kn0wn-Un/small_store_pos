import type { Role } from "@/constants/roles";
import { ROLES } from "@/constants/roles";
import { getServerSession } from "@/lib/auth/session";
import { salesHistoryRepository } from "../repositories/sales-history.repository";
import type { CashierOption, SalesHistoryListResult, SalesHistoryMode } from "../types/sales-history.types";
import { salesHistoryService } from "./sales-history.service";

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 20,
  datePreset: "30d" as const,
};

export async function loadSalesHistoryPageData(mode: SalesHistoryMode): Promise<{
  session: { id: string; email: string; role: string };
  initialData: SalesHistoryListResult;
  cashiers: CashierOption[];
} | null> {
  const session = await getServerSession();
  if (!session) return null;

  const actor = { userId: session.id, role: session.role as Role };
  const listResult = await salesHistoryService.listSales(actor, mode, DEFAULT_FILTERS);

  if (!listResult.success || !listResult.data) {
    return null;
  }

  let cashiers: CashierOption[] = [];
  if (mode === "admin" && session.role === ROLES.ADMIN) {
    cashiers = await salesHistoryRepository.listCashiers();
  }

  return {
    session: { id: session.id, email: session.email, role: session.role },
    initialData: listResult.data,
    cashiers,
  };
}
