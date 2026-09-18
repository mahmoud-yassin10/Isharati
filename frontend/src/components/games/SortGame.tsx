"use client";

import { useState } from "react";
import { Check, Shapes, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { CardFace, GameShell, SignButton, Visual, shuffle, starsFor, type GameProps, type GameResult } from "@/components/games/shared";
import { useLang } from "@/lib/lang";
import type { SortGame as SortGameData } from "@/lib/types";

/** One card at a time: drop it into the right group. */
export function SortGame({ game, glossary, onComplete }: GameProps<SortGameData>) {
  const { lang } = useLang();
  const [queue] = useState(() => shuffle(game.items));
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [mistakes, setMistakes] = useState(0);
  const [miss, setMiss] = useState<string | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [signId, setSignId] = useState<string | null>(null);

  const current = queue[index];

  function drop(bucketId: string) {
    if (!current || result) return;
    if (current.bucket !== bucketId) {
      setMistakes((value) => value + 1);
      setMiss(bucketId);
      return;
    }
    setMiss(null);
    setPlaced((prev) => ({ ...prev, [bucketId]: [...(prev[bucketId] ?? []), current.id] }));
    const next = index + 1;
    setIndex(next);
    if (next === queue.length) {
      const done = { stars: starsFor(mistakes, queue.length), mistakes };
      setResult(done);
      onComplete(done);
    }
  }

  return (
    <GameShell
      kind={{ ar: "لعبة التصنيف", en: "Sorting game", icon: <Shapes size={16} strokeWidth={2} className="icon" /> }}
      prompt={{ ar: game.prompt_ar, en: game.prompt_en }}
      progress={{ done: index, total: queue.length }}
      mistakes={mistakes}
      result={result}
      glossary={glossary}
      signId={signId}
      onCloseSign={() => setSignId(null)}
    >
      {current ? (
        <div className="sort-current">
          <div className="card-wrap">
            <div className="game-card big" aria-live="polite">
              <CardFace card={current} size="lg" />
            </div>
            {current.sign && glossary[current.sign] ? (
              <SignButton label={lang === "en" ? current.en : current.ar} onClick={() => setSignId(current.sign ?? null)} />
            ) : null}
          </div>
          <Dual as="p" className="small muted" ar="إلى أي مجموعة تنتمي؟" en="Which group does it belong to?" />
        </div>
      ) : null}

      <div className="sort-buckets" style={{ ["--cols" as string]: String(game.buckets.length) }}>
        {game.buckets.map((bucket) => (
          <div key={bucket.id} className={`bucket${miss === bucket.id ? " bad" : ""}`}>
            <button type="button" className="bucket-btn" onClick={() => drop(bucket.id)} disabled={!current}>
              {bucket.visual ? <Visual visual={bucket.visual} size="sm" /> : null}
              <Dual ar={bucket.ar} en={bucket.en} />
              {miss === bucket.id ? <X size={20} strokeWidth={3} className="icon" aria-hidden="true" /> : null}
            </button>
            <ul className="bucket-items">
              {(placed[bucket.id] ?? []).map((id) => {
                const item = game.items.find((candidate) => candidate.id === id);
                if (!item) return null;
                return (
                  <li key={id} className="chip ok">
                    <Check size={14} strokeWidth={3} className="icon" aria-hidden="true" />
                    <Dual ar={item.ar} en={item.en} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {miss ? (
        <p className="feedback error" role="status">
          <X size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual ar="ليست هذه المجموعة. جرّب الأخرى." en="Not this group. Try the other one." />
        </p>
      ) : null}
    </GameShell>
  );
}
