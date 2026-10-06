import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-wide text-slate-500">404</p>
      <h1 className="text-3xl font-bold text-ink">Page not found</h1>
      <p className="max-w-md text-slate-600">
        The page you are looking for does not exist or might have moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-storm bg-storm px-4 py-3 text-sm font-semibold text-[#fff6e4] shadow-[0_16px_36px_-22px_rgba(17,20,26,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39a5f] focus-visible:ring-offset-2 focus-visible:ring-offset-veil"
      >
        Back to landing
      </Link>
    </main>
  );
}
