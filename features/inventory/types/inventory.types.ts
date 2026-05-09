import type { ActionResult, AuthenticatedActor } from "@/types/action-result";

export type InventoryActor = AuthenticatedActor;

export type InventoryState = {
  productId: string;
  stockQuantity: number;
  reservedStock: number;
  updatedAt: Date;
};

export type InventoryResult<T = InventoryState> = ActionResult<T>;
