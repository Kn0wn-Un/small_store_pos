"use server";

import { revalidatePath } from "next/cache";
import { ordersService } from "../services/orders.service";

export async function createOrderAction(payload: unknown) {
  const result = await ordersService.createOrder(payload);
  if (result.success) {
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/pos/history");
  }
  return result;
}
