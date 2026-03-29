import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Member, Task, TaskVote } from "@/types";
import { getVotingInsight } from "@/services/voteService";

export function VotingBreakdown({
  task,
  members,
  votes
}: {
  task: Task;
  members: Member[];
  votes: TaskVote[];
}) {
  const insight = getVotingInsight(
    task,
    members.map((member) => member.id),
    votes
  );

  return (
    <Card className="space-y-5 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">Vote reveal</p>
          <h3 className="mt-3 text-2xl font-semibold text-ink">Voting Breakdown</h3>
        </div>
        <Badge className="w-fit border-[#171d25] bg-[#171d25] text-white">
          {votes.length}/{members.length} votes revealed
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] border border-[#e2d6c3] bg-white/[0.65] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Official effort</p>
          <p className="mt-3 text-4xl font-semibold text-ink">{task.officialStoryPoints ?? "Pending"}</p>
        </div>
        <div className="rounded-[24px] border border-[#e2d6c3] bg-white/[0.65] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Disagreement range</p>
          <p className="mt-3 text-4xl font-semibold text-ink">{insight.disagreement}</p>
        </div>
      </div>

      <p
        className={`rounded-[24px] p-4 text-sm leading-7 ${
          insight.isStrongDisagreement ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
        }`}
      >
        {insight.isStrongDisagreement
          ? "There was meaningful spread between votes. Keep the revealed breakdown visible while the team aligns on scope."
          : "The vote reveal is reasonably aligned, so the average can stand as the official estimate without extra negotiation."}
      </p>

      <div className="space-y-3">
        {members.map((member) => {
          const memberVote = votes.find((vote) => vote.memberId === member.id);
          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-[22px] border border-[#e2d6c3] bg-white/60 px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">{member.name}</span>
              <span className="text-base font-semibold text-ink">{memberVote?.value ?? "No vote"}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
