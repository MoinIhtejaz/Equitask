import { Card } from "@/components/ui/Card";
import { AssignmentRecommendation } from "@/services/recommendationService";

export function RecommendationPanel({
  recommendations
}: {
  recommendations: AssignmentRecommendation[];
}) {
  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-ink">Assignment Recommendations</h3>
      <div className="space-y-3">
        {recommendations.slice(0, 3).map((recommendation) => (
          <div key={recommendation.memberId} className="rounded-[22px] border border-[#e2d6c3] bg-white/[0.65] p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-800">{recommendation.memberName}</p>
              <p className="text-sm font-semibold text-moss">{recommendation.score}/100</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">{recommendation.reason}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
