"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin/analytics", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/pos", label: "POS", icon: Store },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AnalyticsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-[#e7dcc2]/80 bg-[#FCFAF7]/90 lg:w-64 lg:min-h-screen">
      <div className="border-b border-[#e7dcc2]/60 px-6 py-8 text-center">
        <p className="text-3xl text-[#B69224]">✿</p>
        <h2 className="heading-font mt-2 text-3xl font-bold text-[#2C3E57]">SATHVAM</h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="gold-bg h-px w-10" />
          <span className="text-[10px] tracking-[3px] text-[#1A1246]/60 uppercase">Admin Portal</span>
          <span className="gold-bg h-px w-10" />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin/analytics" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-[#F8F1DB] text-[#2C3E57] shadow-sm"
                  : "text-[#1A1246]/75 hover:bg-white/80 hover:text-[#2C3E57]",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-[#B69224]" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e7dcc2]/60 p-4">
        <Button
          asChild
          variant="outline"
          className="w-full rounded-xl border-[#B69224]/50 text-[#2C3E57] hover:bg-[#2C3E57] hover:text-white"
        >
          <Link href="/login">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </Button>
        <p className="pointer-events-none mt-8 text-center text-6xl text-[#B69224]/15">✿</p>
      </div>
    </aside>
  );
}
