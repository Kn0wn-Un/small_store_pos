import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

export default async function PosBillingRedirectPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role === "admin") {
    redirect("/admin/pos");
  }

  redirect("/cashier/pos");
}
