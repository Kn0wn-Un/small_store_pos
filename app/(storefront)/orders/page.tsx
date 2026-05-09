import { ROLES } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";

export default async function StorefrontOrdersPage() {
  await requireRole([ROLES.ADMIN, ROLES.CASHIER, ROLES.CUSTOMER]);
  return <h1 className="text-2xl font-semibold">My Orders</h1>;
}
