import { LandingActions } from "@/components/landing/LandingActions";

const FEATURES = [
  {
    title: "Story Point Voting",
    description:
      "Estimate effort together before assignment so every task has transparent team consensus."
  },
  {
    title: "Fairness Intelligence",
    description:
      "Track workload balance, completion, overdue work, and overload risk in one score."
  },
  {
    title: "Availability-Aware Assignment",
    description:
      "Recommend assignees based on weekly availability and current story-point load."
  }
];

export default function LandingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Equitask for University Teams
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
        Build group projects without unfair workload chaos.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-600">
        Effort voting, availability, fairness, and accountability as an operating system for
        assignment teams.
      </p>

      <div className="mt-6">
        <LandingActions />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">{feature.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
