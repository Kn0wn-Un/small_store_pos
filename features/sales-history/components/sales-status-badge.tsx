import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ORDER_STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  processing: "bg-amber-50 text-amber-800 border-amber-200",
  pending: "bg-slate-50 text-slate-700 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-purple-50 text-purple-800 border-purple-200",
};

function formatOrderStatus(status: string) {
  if (status === "delivered" || status === "paid" || status === "processing") {
    return "Completed";
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type SalesStatusBadgeProps = {
  status: string;
  className?: string;
};

export function SalesStatusBadge({ status, className }: SalesStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full border capitalize",
        ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.pending,
        className,
      )}
    >
      {formatOrderStatus(status)}
    </Badge>
  );
}
