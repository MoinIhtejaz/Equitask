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
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">Voting Breakdown</h3>
        <Badge>{votes.length}/{members.length}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-500">Official effort</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{task.officialStoryPoints ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Disagreement</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{insight.disagreement}</p>
        </div>
      </div>

      {insight.isStrongDisagreement ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Meaningful spread between votes — keep breakdown visible while aligning.
        </p>
      ) : null}

      <ul className="divide-y divide-slate-100 text-sm">
        {members.map((member) => {
          const memberVote = votes.find((vote) => vote.memberId === member.id);
          return (
            <li key={member.id} className="flex items-center justify-between py-2">
              <span className="text-slate-700">{member.name}</span>
              <span className="font-medium text-ink">{memberVote?.value ?? "—"}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
