"use client";

import type { ReactNode } from "react";
import { AnalyticsSidebar } from "./analytics-sidebar";

type AnalyticsLayoutProps = {
  children: ReactNode;
};

export function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return (
    <div className="-m-6 flex min-h-screen luxury-background">
      <AnalyticsSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
