import { Dual } from "@/components/Dual";
import type { Badge } from "@/lib/gamification";

export function ProgressBadge({ badge }: { badge: Badge }) {
  return (
    <span className={`badge-chip badge-${badge.tier}`}>
      <span className="badge-dot" aria-hidden="true" />
      <Dual ar={badge.label_ar} en={badge.label_en} />
    </span>
  );
}
