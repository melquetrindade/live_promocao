"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "../dashboard/dashboard-sider";

type AdminLayoutShellProps = {
  administratorName: string | null;
  children: ReactNode;
};

export function AdminLayoutShell({
  administratorName,
  children,
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const showSidebar = administratorName !== null && pathname !== "/admin";

  return (
    <div className="min-h-screen bg-background">
      {showSidebar && (
        <DashboardSidebar administratorName={administratorName} />
      )}
      <div className={showSidebar ? "lg:ml-72" : undefined}>{children}</div>
    </div>
  );
}
