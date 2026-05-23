"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type PosHeaderProps = {
  title?: string;
  userEmail?: string;
  role?: string;
  logoutHref?: string;
};

export function PosHeader({
  title = "POS Terminal",
  userEmail,
  role,
  logoutHref = "/login",
}: PosHeaderProps) {
  return (
    <header className="luxury-nav flex shrink-0 items-center justify-between px-5 py-3 shadow-md">
      <div>
        <p className="gold text-[10px] font-semibold tracking-[4px] uppercase">Sathvam Retail</p>
        <h1 className="heading-font text-2xl font-bold text-white md:text-3xl">{title}</h1>
        {userEmail ? (
          <p className="text-xs text-gray-300">
            {userEmail}
            {role ? ` · ${role}` : ""}
          </p>
        ) : null}
      </div>
      <Button
        asChild
        variant="outline"
        className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#2C3E57]"
      >
        <Link href={logoutHref}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Link>
      </Button>
    </header>
  );
}
