import { AppShell } from "@/components/layout/AppShell";
import { requireWorkspaceSession } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = requireWorkspaceSession();

  return <AppShell session={session}>{children}</AppShell>;
}
