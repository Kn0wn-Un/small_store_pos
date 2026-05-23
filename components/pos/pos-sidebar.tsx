"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const POS_NAV = [
  { href: "/cashier/pos", label: "Billing" },
  { href: "/pos/history", label: "History" },
  { href: "/pos/invoices", label: "Invoices" },
] as const;

const ADMIN_POS_NAV = [
  { href: "/admin/pos", label: "Billing" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

type PosSidebarProps = {
  variant?: "cashier" | "admin";
};

export function PosSidebar({ variant = "cashier" }: PosSidebarProps) {
  const pathname = usePathname();
  const links = variant === "admin" ? ADMIN_POS_NAV : POS_NAV;

  return (
    <nav className="mb-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            pathname === link.href || pathname.startsWith(`${link.href}/`)
              ? "bg-[#2C3E57] text-white shadow"
              : "bg-white/70 text-[#2C3E57] hover:bg-[#2C3E57]/10",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
