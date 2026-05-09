import { ROLES } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole([ROLES.ADMIN]);
  return <section className="min-h-screen bg-zinc-50 p-6">{children}</section>;
}
