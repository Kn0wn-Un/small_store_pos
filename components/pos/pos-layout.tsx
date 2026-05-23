"use client";

import type { ReactNode } from "react";
import { PosHeader } from "./pos-header";

type PosLayoutProps = {
  children: ReactNode;
  userEmail?: string;
  role?: string;
  title?: string;
};

export function PosLayoutShell({ children, userEmail, role, title }: PosLayoutProps) {
  return (
    <div className="-m-6 flex min-h-screen flex-col luxury-background">
      <PosHeader title={title} userEmail={userEmail} role={role} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-5">{children}</div>
    </div>
  );
}
