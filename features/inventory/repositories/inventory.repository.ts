import { mapInventoryRow } from "@/lib/supabase/mappers";
import { callInventoryAdjustmentRpc } from "@/lib/supabase/rpc";
import type { AdjustInventoryAtomicParams } from "@/lib/supabase/rpc-types";

export class InventoryRepository {
  async adjustInventoryAtomic(params: AdjustInventoryAtomicParams) {
    const result = await callInventoryAdjustmentRpc(params);
    return mapInventoryRow(result.inventory);
  }
}

export const inventoryRepository = new InventoryRepository();
