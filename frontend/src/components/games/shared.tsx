"use client";

import { useState } from "react";
import { Hand, Star, Trophy, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { SignPanel } from "@/components/SignPanel";
import { pick, useLang } from "@/lib/lang";
import type { CardVisual, GameCard, GlossaryEntry } from "@/lib/types";

export type GameResult = { stars: number; mistakes: number };

export type GameProps<T> = {
  game: T;
  glossary: Record<string, GlossaryEntry>;
  onComplete: (result: GameResult) => void;
};

/** 0 mistakes: 3 stars. Up to a quarter of the rounds wrong: 2. Otherwise 1. */
export function starsFor(mistakes: number, rounds: number) {
  if (mistakes === 0) return 3;
  if (mistakes <= Math.max(1, Math.round(rounds * 0.25))) return 2;
  return 1;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  // Never hand back the answer already in order.
  if (copy.length > 1 && copy.every((item, i) => item === items[i])) {
    [copy[0], copy[1]] = [copy[1], copy[0]];
  }
  return copy;
}

export function Visual({ visual, size = "md" }: { visual: CardVisual; size?: "sm" | "md" | "lg" }) {
  if (visual.kind === "color") {
    return <span className={`card-swatch ${size}`} style={{ background: visual.value }} aria-hidden="true" />;
  }
  if (visual.kind === "dots") {
    const count = Math.max(0, Math.min(20, Number(visual.value) || 0));
    return (
      <span className={`card-dots ${size}`} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} />
        ))}
      </span>
    );
  }
  return (
    <span className={`card-symbol ${size}`} aria-hidden="true">
      {visual.value}
    </span>
  );
}

export function CardFace({ card, size = "md" }: { card: GameCard; size?: "sm" | "md" | "lg" }) {
  return (
    <>
      {card.visual ? <Visual visual={card.visual} size={size} /> : null}
      <span className="card-text">
        <Dual ar={card.ar} en={card.en} />
      </span>
    </>
  );
}

export function StarRow({ stars, total = 3 }: { stars: number; total?: number }) {
  const { lang } = useLang();
  return (
    <span className="star-row" role="img" aria-label={pick(lang, `${stars} من ${total} نجوم`, `${stars} of ${total} stars`)}>
      {Array.from({ length: total }, (_, i) => (
        <Star
          key={i}
          size={28}
          strokeWidth={1.75}
          className={i < stars ? "star on" : "star"}
          style={{ animationDelay: `${i * 120}ms` }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/**
 * Frame shared by every game: the instruction, a live score strip, an optional
 * sign viewer for any card's word, and the win panel.
 */
export function GameShell({
  kind,
  prompt,
  progress,
  mistakes,
  result,
  glossary,
  signId,
  onCloseSign,
  concealTerm = false,
  children,
}: {
  kind: { ar: string; en: string; icon: React.ReactNode };
  prompt: { ar: string; en: string };
  progress: { done: number; total: number };
  mistakes: number;
  result: GameResult | null;
  glossary: Record<string, GlossaryEntry>;
  signId: string | null;
  onCloseSign: () => void;
  concealTerm?: boolean;
  children: React.ReactNode;
}) {
  const { lang } = useLang();
  const entry = signId ? glossary[signId] : undefined;
  return (
    <section className="game" aria-label={pick(lang, kind.ar, kind.en)}>
      <header className="game-head">
        <span className="chip sign">
          {kind.icon}
          <Dual ar={kind.ar} en={kind.en} />
        </span>
        <div className="game-score" aria-live="polite">
          <span className="chip">
            <Dual ar={`${progress.done} / ${progress.total}`} en={`${progress.done} / ${progress.total}`} />
          </span>
          <span className={mistakes > 0 ? "chip miss" : "chip"}>
            <X size={14} strokeWidth={2.5} className="icon" aria-hidden="true" />
            <Dual ar={`أخطاء ${mistakes}`} en={`Mistakes ${mistakes}`} />
          </span>
        </div>
      </header>

      <p className="game-prompt">
        <Dual ar={prompt.ar} en={prompt.en} />
      </p>

      {entry ? (
        <div className="game-sign">
          <SignPanel
            termAr={entry.term_ar}
            termEn={entry.term_en}
            playAr={entry.lexicon_token ?? entry.term_ar}
            mode={entry.esl_mode}
            concealTerm={concealTerm}
          />
          <button type="button" className="btn quiet" onClick={onCloseSign}>
            <X size={18} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="أغلق الإشارة" en="Close the sign" />
          </button>
        </div>
      ) : null}

      {children}

      {result ? (
        <div className="game-win" role="status">
          <Trophy size={36} strokeWidth={1.5} className="icon trophy" aria-hidden="true" />
          <div className="stack-sm">
            <p className="win-title">
              <Dual
                ar={result.stars === 3 ? "ممتاز! بدون أخطاء." : result.stars === 2 ? "أحسنت!" : "أنهيت اللعبة!"}
                en={result.stars === 3 ? "Perfect! No mistakes." : result.stars === 2 ? "Well done!" : "You finished the game!"}
              />
            </p>
            <StarRow stars={result.stars} />
            <p className="small muted">
              <Dual
                ar={`+${10 + result.stars * 10} نقطة · اضغط «التالي» لتكمل.`}
                en={`+${10 + result.stars * 10} points · press “Next” to continue.`}
              />
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** Small button that opens a card's sign in the game frame. */
export function SignButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { lang } = useLang();
  return (
    <button
      type="button"
      className="sign-mini"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={pick(lang, `شاهد إشارة ${label}`, `Watch the sign for ${label}`)}
      title={pick(lang, "شاهد الإشارة", "Watch the sign")}
    >
      <Hand size={18} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
