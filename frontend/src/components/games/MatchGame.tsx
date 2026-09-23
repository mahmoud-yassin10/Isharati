"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { CardFace, GameShell, SignButton, shuffle, starsFor, type GameProps, type GameResult } from "@/components/games/shared";
import { useLang } from "@/lib/lang";
import type { MatchGame as MatchGameData } from "@/lib/types";

type Side = "a" | "b";

/** Pair each card in the first column with its partner in the second. */
export function MatchGame({ game, glossary, onComplete }: GameProps<MatchGameData>) {
  const { lang } = useLang();
  const [left] = useState(() => shuffle(game.pairs));
  const [right] = useState(() => shuffle(game.pairs));
  const [picked, setPicked] = useState<{ side: Side; id: string } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ a: string; b: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [signId, setSignId] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function choose(side: Side, id: string) {
    if (result || matched.has(id)) return;
    if (!picked || picked.side === side) {
      setPicked({ side, id });
      return;
    }
    const a = side === "a" ? id : picked.id;
    const b = side === "b" ? id : picked.id;
    setPicked(null);
    if (a === b) {
      const next = new Set(matched).add(a);
      setMatched(next);
      if (next.size === game.pairs.length) {
        const done = { stars: starsFor(mistakes, game.pairs.length), mistakes };
        setResult(done);
        onComplete(done);
      }
    } else {
      setMistakes((value) => value + 1);
      setWrong({ a, b });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setWrong(null), 900);
    }
  }

  function column(side: Side, list: typeof left) {
    return (
      <ul className="match-col">
        {list.map((pair) => {
          const card = side === "a" ? pair.a : pair.b;
          const isMatched = matched.has(pair.id);
          const isPicked = picked?.side === side && picked.id === pair.id;
          const isWrong = wrong?.[side] === pair.id;
          const state = isMatched ? "ok" : isWrong ? "bad" : isPicked ? "picked" : "";
          return (
            <li key={pair.id} className="card-wrap">
              <button
                type="button"
                className={`game-card ${state}`}
                aria-pressed={isPicked}
                disabled={isMatched}
                onClick={() => choose(side, pair.id)}
              >
                <CardFace card={card} />
                <span className="card-mark" aria-hidden="true">
                  {isMatched ? <Check size={22} strokeWidth={3} /> : isWrong ? <X size={22} strokeWidth={3} /> : null}
                </span>
              </button>
              {card.sign && glossary[card.sign] ? (
                <SignButton label={lang === "en" ? card.en : card.ar} onClick={() => setSignId(card.sign ?? null)} />
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <GameShell
      kind={{ ar: "لعبة التوصيل", en: "Matching game", icon: <Link2 size={16} strokeWidth={2} className="icon" /> }}
      prompt={{ ar: game.prompt_ar, en: game.prompt_en }}
      progress={{ done: matched.size, total: game.pairs.length }}
      mistakes={mistakes}
      result={result}
      glossary={glossary}
      signId={signId}
      onCloseSign={() => setSignId(null)}
      concealTerm
    >
      <p className="game-hint small muted">
        <Dual
          ar="اختر بطاقة من العمود الأول، ثم شريكتها من العمود الثاني."
          en="Pick a card in the first column, then its partner in the second."
        />
      </p>
      <div className="match-board">
        {column("a", left)}
        {column("b", right)}
      </div>
      {wrong ? (
        <p className="feedback error" role="status">
          <X size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual ar="ليستا زوجاً. جرّب مرة أخرى." en="Not a pair. Try again." />
        </p>
      ) : null}
    </GameShell>
  );
}
