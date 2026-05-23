import { redirect } from "next/navigation";
import { SalesHistoryPage } from "@/features/sales-history/components/sales-history-page";
import { loadSalesHistoryPageData } from "@/features/sales-history/services/load-sales-history-page.service";

export default async function AdminOrdersPage() {
  const data = await loadSalesHistoryPageData("admin");
  if (!data) redirect("/login");

  return (
    <SalesHistoryPage
      mode="admin"
      userEmail={data.session.email}
      role={data.session.role}
      initialData={data.initialData}
      cashiers={data.cashiers}
    />
  );
}
