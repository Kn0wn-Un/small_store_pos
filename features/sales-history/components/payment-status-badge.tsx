import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-purple-50 text-purple-800 border-purple-200",
  partially_refunded: "bg-purple-50 text-purple-700 border-purple-200",
};

function formatPaymentStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type PaymentStatusBadgeProps = {
  status: string;
  className?: string;
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full border capitalize",
        PAYMENT_STATUS_STYLES[status] ?? PAYMENT_STATUS_STYLES.pending,
        className,
      )}
    >
      {formatPaymentStatus(status)}
    </Badge>
  );
}
