"use server";

import { ROLES } from "@/constants/roles";
import { authorizeActionRole } from "@/lib/auth/action-guard";
import { listPosCategoriesService } from "../services/list-pos-categories.service";

export async function listPosCategoriesAction() {
  const auth = await authorizeActionRole([ROLES.ADMIN, ROLES.CASHIER]);
  if (!auth.success) return auth;
  return listPosCategoriesService.execute();
}
