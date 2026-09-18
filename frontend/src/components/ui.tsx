"use client";

import { ArrowRight } from "lucide-react";
import { Dual } from "@/components/Dual";

export function ForwardIcon({ size = 20 }: { size?: number }) {
  return <ArrowRight size={size} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />;
}

export function BackIcon({ size = 20 }: { size?: number }) {
  return (
    <ArrowRight
      size={size}
      strokeWidth={1.75}
      className="icon flip-rtl"
      style={{ rotate: "180deg" }}
      aria-hidden="true"
    />
  );
}

export function ProgressBar({
  value,
  total,
  compact = false,
}: {
  value: number;
  total: number;
  compact?: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const complete = total > 0 && value >= total;
  return (
    <div className={`progress${complete ? " complete" : ""}`}>
      {!compact ? (
        <div className="progress-label">
          <Dual ar={`${value} من ${total} خطوات`} en={`${value} of ${total} steps`} />
          <span className="mono">{pct}%</span>
        </div>
      ) : null}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-valuetext={`${value} / ${total}`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SwitchRow({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
  title: { ar: string; en: string };
  description?: { ar: string; en: string };
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="switch-row" onClick={() => onChange(!checked)}>
      <span className="label">
        <strong>
          {icon}
          <Dual ar={title.ar} en={title.en} />
        </strong>
        {description ? <Dual ar={description.ar} en={description.en} /> : null}
      </span>
      <span className="switch" aria-hidden="true">
        <Dual ar={checked ? "تشغيل" : "إيقاف"} en={checked ? "On" : "Off"} />
        <span className="switch-track" />
      </span>
    </button>
  );
}

export function LoadingBlock({ rows = 3, height = 96 }: { rows?: number; height?: number }) {
  return (
    <div className="stack-sm" aria-busy="true">
      <span className="sr-only">
        <Dual ar="جارٍ التحميل" en="Loading" />
      </span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}
