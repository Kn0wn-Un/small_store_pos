import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import type { DbTransaction } from "@/lib/transaction";

export class InvoicesRepository {
  async createInvoiceTx(
    tx: DbTransaction,
    payload: {
      invoiceNumber: string;
      orderId: string;
      pdfUrl?: string;
    },
  ) {
    const [created] = await tx.insert(invoices).values(payload).returning();
    return created;
  }

  async getByOrderId(orderId: string) {
    const [row] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1);
    return row ?? null;
  }

  async getByInvoiceNumber(invoiceNumber: string) {
    const [row] = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber)).limit(1);
    return row ?? null;
  }
}

export const invoicesRepository = new InvoicesRepository();
