import { PropsWithChildren } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { SessionUser } from "@/types";

export function AppShell({ children, session }: PropsWithChildren<{ session: SessionUser }>) {
  return (
    <div className="workspace-shell min-h-screen">
      <div className="mx-auto flex max-w-[1720px] items-start gap-4 px-4 py-4 sm:px-5 lg:gap-6 lg:px-6">
        <Sidebar session={session} />
        <main className="min-w-0 flex-1 pb-8">
          <TopBar session={session} />
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
