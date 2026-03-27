import { PropsWithChildren } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { SessionUser } from "@/types";

export function AppShell({ children, session }: PropsWithChildren<{ session: SessionUser }>) {
  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar session={session} />
        <main className="min-h-screen flex-1 p-4 sm:p-6">
          <TopBar session={session} />
          {children}
        </main>
      </div>
    </div>
  );
}
