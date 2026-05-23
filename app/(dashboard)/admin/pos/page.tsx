import { redirect } from "next/navigation";
import { PosTerminal } from "@/components/pos/pos-terminal";
import { loadPosPageData } from "@/features/pos/services/load-pos-page.service";

export default async function AdminPosPage() {
  const data = await loadPosPageData();
  if (!data) redirect("/login");

  return (
    <PosTerminal
      initialProducts={data.catalog.products}
      initialTotal={data.catalog.total}
      categories={data.catalog.categories}
      initialCart={data.cart}
      userEmail={data.session.email}
      role={data.session.role}
      defaultCustomerId={data.session.id}
      sidebarVariant="admin"
    />
  );
}
