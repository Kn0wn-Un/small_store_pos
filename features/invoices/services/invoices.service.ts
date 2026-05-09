import { randomUUID } from "node:crypto";
import type { ActionResult } from "@/types/action-result";
import { invoicesRepository } from "../repositories/invoices.repository";

export class InvoicesService {
  buildInvoiceNumber() {
    return `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;
  }

  async getByOrderId(orderId: string): Promise<ActionResult<Record<string, unknown>>> {
    const invoice = await invoicesRepository.getByOrderId(orderId);
    if (!invoice) {
      return { success: false, message: "Invoice not found.", data: null, errors: [{ field: "orderId", message: "Invoice not found for order." }] };
    }
    return { success: true, message: "Invoice fetched.", data: invoice };
  }
}

export const invoicesService = new InvoicesService();
