import { redirect } from "next/navigation";
import { SalesHistoryPage } from "@/features/sales-history/components/sales-history-page";
import { loadSalesHistoryPageData } from "@/features/sales-history/services/load-sales-history-page.service";

export default async function PosHistoryPage() {
  const data = await loadSalesHistoryPageData("cashier");
  if (!data) redirect("/login");

  return (
    <SalesHistoryPage
      mode="cashier"
      userEmail={data.session.email}
      role={data.session.role}
      initialData={data.initialData}
      cashiers={data.cashiers}
    />
  );
}
