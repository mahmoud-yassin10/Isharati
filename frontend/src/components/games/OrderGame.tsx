"use client";

import { useEffect, useRef, useState } from "react";
import { ListOrdered, RotateCcw, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { CardFace, GameShell, SignButton, shuffle, starsFor, type GameProps, type GameResult } from "@/components/games/shared";
import { useLang } from "@/lib/lang";
import type { OrderGame as OrderGameData } from "@/lib/types";

/** Tap the cards in the right order to build the sequence. */
export function OrderGame({ game, glossary, onComplete }: GameProps<OrderGameData>) {
  const { lang } = useLang();
  const [pool] = useState(() => shuffle(game.items));
  const [built, setBuilt] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [signId, setSignId] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function take(id: string) {
    if (result || built.includes(id)) return;
    const expected = game.items[built.length]?.id;
    if (id !== expected) {
      setMistakes((value) => value + 1);
      setWrong(id);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setWrong(null), 900);
      return;
    }
    setWrong(null);
    const next = [...built, id];
    setBuilt(next);
    if (next.length === game.items.length) {
      const done = { stars: starsFor(mistakes, game.items.length), mistakes };
      setResult(done);
      onComplete(done);
    }
  }

  return (
    <GameShell
      kind={{ ar: "لعبة الترتيب", en: "Ordering game", icon: <ListOrdered size={16} strokeWidth={2} className="icon" /> }}
      prompt={{ ar: game.prompt_ar, en: game.prompt_en }}
      progress={{ done: built.length, total: game.items.length }}
      mistakes={mistakes}
      result={result}
      glossary={glossary}
      signId={signId}
      onCloseSign={() => setSignId(null)}
    >
      <ol className="order-slots">
        {game.items.map((item, i) => {
          const filled = i < built.length;
          return (
            <li key={item.id} className={filled ? "slot filled" : i === built.length ? "slot next" : "slot"}>
              <span className="slot-n" aria-hidden="true">
                {i + 1}
              </span>
              {filled ? <CardFace card={item} size="sm" /> : <span className="slot-empty">…</span>}
            </li>
          );
        })}
      </ol>

      <Dual
        as="p"
        className="game-hint small muted"
        ar={result ? "اكتمل الترتيب." : `اختر رقم ${built.length + 1}:`}
        en={result ? "The order is complete." : `Pick number ${built.length + 1}:`}
      />

      <ul className="order-pool">
        {pool.map((item) => {
          const used = built.includes(item.id);
          return (
            <li key={item.id} className="card-wrap">
              <button
                type="button"
                className={`game-card${wrong === item.id ? " bad" : ""}${used ? " used" : ""}`}
                disabled={used || Boolean(result)}
                onClick={() => take(item.id)}
              >
                <CardFace card={item} />
                <span className="card-mark" aria-hidden="true">
                  {wrong === item.id ? <X size={22} strokeWidth={3} /> : null}
                </span>
              </button>
              {item.sign && glossary[item.sign] ? (
                <SignButton label={lang === "en" ? item.en : item.ar} onClick={() => setSignId(item.sign ?? null)} />
              ) : null}
            </li>
          );
        })}
      </ul>

      {wrong ? (
        <p className="feedback error" role="status">
          <RotateCcw size={22} strokeWidth={2} className="icon" aria-hidden="true" />
          <Dual ar="ليس هذا الدور. فكّر: ما الذي يأتي الآن؟" en="Not its turn. Think: what comes now?" />
        </p>
      ) : null}
    </GameShell>
  );
}
