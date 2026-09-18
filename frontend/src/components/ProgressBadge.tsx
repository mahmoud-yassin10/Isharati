import { Award } from "lucide-react";
import { Dual } from "@/components/Dual";
import type { Badge } from "@/lib/gamification";

export function ProgressBadge({ badge }: { badge: Badge }) {
  return (
    <span className={`chip badge-chip badge-${badge.tier}`}>
      <Award size={16} strokeWidth={2} className="icon" aria-hidden="true" />
      <Dual ar={badge.label_ar} en={badge.label_en} />
    </span>
  );
}
