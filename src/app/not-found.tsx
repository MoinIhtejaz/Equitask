import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-wide text-slate-500">404</p>
      <h1 className="text-3xl font-bold text-ink">Page not found</h1>
      <p className="max-w-md text-slate-600">
        The page you are looking for does not exist or might have moved.
      </p>
      <Link href="/">
        <Button>Back to landing</Button>
      </Link>
    </main>
  );
}
