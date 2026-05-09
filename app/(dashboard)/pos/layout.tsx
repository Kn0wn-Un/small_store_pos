import { ROLES } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  await requireRole([ROLES.ADMIN, ROLES.CASHIER]);
  return <section className="min-h-screen bg-zinc-50 p-6">{children}</section>;
}
