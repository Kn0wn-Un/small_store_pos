import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";

export class CheckoutRepository {
  async validateAddressForUser(payload: { addressId: string; userId: string }) {
    const [row] = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(and(eq(addresses.id, payload.addressId), eq(addresses.userId, payload.userId), isNull(addresses.deletedAt)))
      .limit(1);
    return Boolean(row);
  }
}

export const checkoutRepository = new CheckoutRepository();
