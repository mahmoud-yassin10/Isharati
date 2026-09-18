"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, Hand, MousePointerClick, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { CardFace, GameShell, starsFor, type GameProps, type GameResult } from "@/components/games/shared";
import type { DiagramGame as DiagramGameData, DiagramNode } from "@/lib/types";

/**
 * A labelled diagram the student taps. "explore" opens every part once;
 * "find" names a part and the student taps where it is.
 */
export function DiagramGame({ game, glossary, onComplete }: GameProps<DiagramGameData>) {
  const targets = game.mode === "find" ? (game.targets ?? game.nodes.map((node) => node.id)) : [];
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [signId, setSignId] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const total = game.mode === "find" ? targets.length : game.nodes.length;
  const done = game.mode === "find" ? round : opened.size;
  const target = game.nodes.find((node) => node.id === targets[round]);

  function finish(misses: number) {
    const final = { stars: starsFor(misses, total), mistakes: misses };
    setResult(final);
    onComplete(final);
  }

  function tap(node: DiagramNode) {
    if (game.mode === "explore") {
      setActive(node.id);
      if (opened.has(node.id)) return;
      const next = new Set(opened).add(node.id);
      setOpened(next);
      if (next.size === game.nodes.length && !result) finish(0);
      return;
    }
    if (result || !target) return;
    if (node.id !== target.id) {
      setMistakes((value) => value + 1);
      setWrong(node.id);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setWrong(null), 900);
      return;
    }
    setWrong(null);
    setActive(node.id);
    setOpened((prev) => new Set(prev).add(node.id));
    const next = round + 1;
    setRound(next);
    if (next === targets.length) finish(mistakes);
  }

  function nodeButton(node: DiagramNode, className = "") {
    const isOpen = opened.has(node.id);
    const state = wrong === node.id ? "bad" : isOpen ? "ok" : "";
    return (
      <button
        key={node.id}
        type="button"
        className={`dnode ${state} ${className}`}
        aria-pressed={active === node.id}
        onClick={() => tap(node)}
      >
        {game.mode === "find" && !isOpen ? (
          <span className="dnode-hidden">?</span>
        ) : (
          <CardFace card={node} size="sm" />
        )}
        <span className="card-mark" aria-hidden="true">
          {isOpen ? <Check size={18} strokeWidth={3} /> : wrong === node.id ? <X size={18} strokeWidth={3} /> : null}
        </span>
      </button>
    );
  }

  const activeNode = game.nodes.find((node) => node.id === active);

  return (
    <GameShell
      kind={{
        ar: game.mode === "find" ? "ابحث في الرسم" : "استكشف الرسم",
        en: game.mode === "find" ? "Find on the diagram" : "Explore the diagram",
        icon: <MousePointerClick size={16} strokeWidth={2} className="icon" />,
      }}
      prompt={{ ar: game.prompt_ar, en: game.prompt_en }}
      progress={{ done, total }}
      mistakes={mistakes}
      result={result}
      glossary={glossary}
      signId={signId}
      onCloseSign={() => setSignId(null)}
    >
      {game.mode === "find" && target && !result ? (
        <div className="find-target" aria-live="polite">
          <Dual ar="اضغط على:" en="Tap:" />
          <strong>
            <Dual ar={target.ar} en={target.en} />
          </strong>
          {target.sign && glossary[target.sign] ? (
            <button type="button" className="btn sign" onClick={() => setSignId(target.sign ?? null)}>
              <Hand size={18} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual ar="شاهد الإشارة" en="Watch the sign" />
            </button>
          ) : null}
        </div>
      ) : null}

      {game.kind === "compass" ? (
        <div className="diagram compass">
          <div className="compass-n">{game.nodes[0] ? nodeButton(game.nodes[0]) : null}</div>
          <div className="compass-w">{game.nodes[3] ? nodeButton(game.nodes[3]) : null}</div>
          <svg className="compass-rose" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" />
            <circle cx="60" cy="60" r="4" className="hub" />
            <path d="M60 10 L70 60 L60 52 L50 60 Z" className="needle-n" />
            <path d="M60 110 L50 60 L60 68 L70 60 Z" className="needle-s" />
            <path d="M10 60 L60 55 L60 65 Z" className="needle-side" />
            <path d="M110 60 L60 65 L60 55 Z" className="needle-side" />
          </svg>
          <div className="compass-e">{game.nodes[1] ? nodeButton(game.nodes[1]) : null}</div>
          <div className="compass-s">{game.nodes[2] ? nodeButton(game.nodes[2]) : null}</div>
        </div>
      ) : null}

      {game.kind === "flow" ? (
        <ol className="diagram flow">
          {game.nodes.map((node, i) => (
            <li key={node.id}>
              {nodeButton(node)}
              {i < game.nodes.length - 1 ? (
                <ArrowDown size={22} strokeWidth={2} className="flow-arrow" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}

      {game.kind === "cycle" ? (
        <div className="diagram cycle" style={{ ["--n" as string]: String(game.nodes.length) }}>
          <svg className="cycle-ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <marker id="cycle-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 Z" />
              </marker>
            </defs>
            {game.nodes.map((_, i) => {
              const n = game.nodes.length;
              const a0 = (-90 + (360 / n) * i + 18) * (Math.PI / 180);
              const a1 = (-90 + (360 / n) * (i + 1) - 18) * (Math.PI / 180);
              const r = 78;
              return (
                <path
                  key={i}
                  d={`M${100 + r * Math.cos(a0)} ${100 + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${100 + r * Math.cos(a1)} ${100 + r * Math.sin(a1)}`}
                  markerEnd="url(#cycle-head)"
                />
              );
            })}
          </svg>
          {game.nodes.map((node, i) => {
            const angle = -90 + (360 / game.nodes.length) * i;
            const rad = (angle * Math.PI) / 180;
            return (
              <div
                key={node.id}
                className="cycle-slot"
                style={{ left: `${50 + 39 * Math.cos(rad)}%`, top: `${50 + 39 * Math.sin(rad)}%` }}
              >
                {nodeButton(node)}
              </div>
            );
          })}
        </div>
      ) : null}

      {game.kind === "number_line" ? (
        <div className="diagram number-line">
          <div className="nl-track" aria-hidden="true" />
          <ol className="nl-nodes">
            {game.nodes.map((node) => (
              <li key={node.id}>
                {nodeButton(node, "nl")}
                <span className="nl-tick" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {activeNode && (game.mode === "explore" || opened.has(activeNode.id)) ? (
        <div className="diagram-note" aria-live="polite">
          <div>
            <strong>
              <Dual ar={activeNode.ar} en={activeNode.en} />
            </strong>
            {activeNode.note_ar ? (
              <p className="muted">
                <Dual ar={activeNode.note_ar} en={activeNode.note_en ?? activeNode.note_ar} />
              </p>
            ) : null}
          </div>
          {activeNode.sign && glossary[activeNode.sign] ? (
            <button type="button" className="btn sign" onClick={() => setSignId(activeNode.sign ?? null)}>
              <Hand size={18} strokeWidth={2} className="icon" aria-hidden="true" />
              <Dual ar="شاهد الإشارة" en="Watch the sign" />
            </button>
          ) : null}
        </div>
      ) : game.mode === "explore" && !result ? (
        <p className="game-hint small muted">
          <Dual ar="اضغط كل جزء لتعرف اسمه." en="Tap every part to learn its name." />
        </p>
      ) : null}

      {wrong ? (
        <p className="feedback error" role="status">
          <X size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual ar="ليس هنا. ابحث مرة أخرى." en="Not here. Look again." />
        </p>
      ) : null}
    </GameShell>
  );
}
