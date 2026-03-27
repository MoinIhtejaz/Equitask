import { LandingActions } from "@/components/landing/LandingActions";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    title: "Story Point Voting",
    description:
      "Estimate effort together before assignment so every task has transparent team consensus."
  },
  {
    title: "Fairness Intelligence",
    description:
      "Track balance of workload, completion, overdue tasks, and overload risk with one clear score."
  },
  {
    title: "Availability-Aware Assignment",
    description:
      "Recommend assignees based on weekly availability windows and current active story-point load."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10">
      <section className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-card sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr,1fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Equitask for University Teams
            </p>
            <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Build great group projects without unfair workload chaos.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              Equitask goes beyond chat tools by turning effort voting, availability, fairness, and
              accountability into a real operating system for assignment teams.
            </p>

            <div className="mt-6">
              <LandingActions />
            </div>
          </div>

          <div className="space-y-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-l-4 border-l-moss">
                <h2 className="text-lg font-semibold text-ink">{feature.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
