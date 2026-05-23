import { ROLES } from "@/constants/roles";
import type { AuthenticatedActor } from "@/types/action-result";
import {
  assertCashierFilterAllowed,
  canViewOrder,
  resolveOrderListScope,
} from "@/lib/auth/order-access-policy";
import { salesHistoryFilterSchema } from "../schemas/sales-history-filter.schema";
import { salesHistoryRepository } from "../repositories/sales-history.repository";
import { resolveSalesHistoryDateRange } from "../utils/sales-history-date";
import type { SalesHistoryMode } from "../types/sales-history.types";

export class SalesHistoryService {
  async listSales(actor: AuthenticatedActor, mode: SalesHistoryMode, payload: unknown) {
    const parsed = salesHistoryFilterSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      return {
        success: false as const,
        message: "Invalid sales history filters.",
        data: null,
        errors: [{ field: "payload", message: "Invalid filters." }],
      };
    }

    const filterCheck = assertCashierFilterAllowed(actor, parsed.data.cashierId);
    if (!filterCheck.allowed) {
      return {
        success: false as const,
        message: "Forbidden.",
        data: null,
        errors: [{ field: "cashierId", message: filterCheck.message }],
      };
    }

    const scope = resolveOrderListScope(actor, {
      salesHistoryMode: mode,
      filterCashierId: parsed.data.cashierId,
    });

    const { from, to } = resolveSalesHistoryDateRange(
      parsed.data.datePreset,
      parsed.data.from,
      parsed.data.to,
    );

    const listFilters = {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      search: parsed.data.search,
      from,
      to,
      paymentStatus: parsed.data.paymentStatus,
      orderStatus: parsed.data.orderStatus,
      cashierUserId: scope.cashierUserId,
      filterCashierId: scope.filterCashierId,
    };

    const [{ rows, total }, summary] = await Promise.all([
      salesHistoryRepository.listSales(listFilters),
      salesHistoryRepository.getSummary(listFilters),
    ]);

    return {
      success: true as const,
      message: "Sales history fetched.",
      data: {
        items: rows,
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsed.data.pageSize)),
        summary,
      },
    };
  }

  async getDetail(actor: AuthenticatedActor, mode: SalesHistoryMode, orderId: string) {
    if (!orderId) {
      return {
        success: false as const,
        message: "Invalid order id.",
        data: null,
        errors: [{ field: "orderId", message: "Order id is required." }],
      };
    }

    const detail = await salesHistoryRepository.getDetail(orderId);
    if (!detail) {
      return {
        success: false as const,
        message: "Order not found.",
        data: null,
        errors: [{ field: "orderId", message: "Order not found." }],
      };
    }

    if (
      !canViewOrder(
        actor,
        {
          customerId: detail.customerId ?? null,
          cashierUserId: detail.cashierUserId ?? null,
        },
        { salesHistoryMode: mode },
      )
    ) {
      return {
        success: false as const,
        message: "Forbidden.",
        data: null,
        errors: [{ field: "orderId", message: "You can only view your own sales." }],
      };
    }

    const { customerId: _c, cashierUserId: _cashier, ...publicDetail } = detail;

    return {
      success: true as const,
      message: "Sale detail fetched.",
      data: publicDetail,
    };
  }

  async listCashiers(actor: AuthenticatedActor, mode: SalesHistoryMode) {
    if (mode !== "admin" || actor.role !== ROLES.ADMIN) {
      return {
        success: false as const,
        message: "Forbidden.",
        data: null,
        errors: [{ field: "auth", message: "Admin only." }],
      };
    }

    const cashiers = await salesHistoryRepository.listCashiers();
    return {
      success: true as const,
      message: "Cashiers fetched.",
      data: { cashiers },
    };
  }
}

export const salesHistoryService = new SalesHistoryService();
