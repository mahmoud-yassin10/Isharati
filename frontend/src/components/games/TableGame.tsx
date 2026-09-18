"use client";

import { useEffect, useState } from "react";
import { Check, Table2, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { GameShell, starsFor, type GameProps, type GameResult } from "@/components/games/shared";
import { pick, useLang } from "@/lib/lang";
import type { TableCell, TableGame as TableGameData } from "@/lib/types";

type Blank = Extract<TableCell, { answer: number }>;

const isBlank = (cell: TableCell): cell is Blank => "answer" in cell;
const key = (r: number, c: number) => `${r}:${c}`;

function fmt(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

/**
 * A data table. Cells with an `answer` are blanks the student fills by picking
 * a value, then checks. A table with no blanks is a reference table.
 */
export function TableGame({ game, glossary, onComplete }: GameProps<TableGameData>) {
  const { lang } = useLang();
  const blanks = game.rows.flatMap((row, r) => row.map((cell, c) => (isBlank(cell) ? key(r, c) : null))).filter(Boolean) as string[];
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [signId, setSignId] = useState<string | null>(null);
  const readOnly = blanks.length === 0;

  useEffect(() => {
    if (readOnly) onComplete({ stars: 0, mistakes: 0 });
    // Reference tables count as read on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  const correctCount = blanks.filter((k) => checked[k]).length;

  function check() {
    const next = { ...checked };
    let wrong = 0;
    game.rows.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!isBlank(cell)) return;
        const k = key(r, c);
        if (next[k]) return;
        const raw = values[k];
        const num = raw === undefined || raw === "" ? NaN : Number(raw);
        const ok = Number.isFinite(num) && Math.abs(num - cell.answer) <= (cell.tolerance ?? 0.01);
        next[k] = ok;
        if (!ok) wrong += 1;
      }),
    );
    setChecked(next);
    const misses = mistakes + wrong;
    setMistakes(misses);
    if (blanks.every((k) => next[k])) {
      const done = { stars: starsFor(misses, blanks.length), mistakes: misses };
      setResult(done);
      onComplete(done);
    }
  }

  const table = (
    <div className="table-wrap game-table">
      <table className="data-table">
        <thead>
          <tr>
            {game.columns.map((col, c) => (
              <th key={c} className={col.tone ? `tone-${col.tone}` : undefined}>
                <Dual ar={col.ar} en={col.en} />
                {col.unit ? <span className="mono unit"> ({col.unit})</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {game.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                if (!isBlank(cell)) {
                  return (
                    <td key={c} className="mono">
                      {cell.value}
                    </td>
                  );
                }
                const k = key(r, c);
                const state = checked[k] === true ? "ok" : checked[k] === false ? "bad" : "";
                const locked = checked[k] === true;
                return (
                  <td key={c} className={`blank ${state}`}>
                    {cell.choices ? (
                      <div className="cell-choices" role="group" aria-label={pick(lang, `اختر قيمة ${game.columns[c]?.ar ?? ""}`, `Choose ${game.columns[c]?.en ?? ""}`)}>
                        {cell.choices.map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            className="mono"
                            aria-pressed={values[k] === String(choice)}
                            disabled={locked}
                            onClick={() => {
                              setValues((prev) => ({ ...prev, [k]: String(choice) }));
                              setChecked((prev) => {
                                const copy = { ...prev };
                                delete copy[k];
                                return copy;
                              });
                            }}
                          >
                            {fmt(choice)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        className="mono cell-input"
                        inputMode="decimal"
                        dir="ltr"
                        value={values[k] ?? ""}
                        disabled={locked}
                        aria-label={pick(lang, `أدخل ${game.columns[c]?.ar ?? ""}`, `Enter ${game.columns[c]?.en ?? ""}`)}
                        onChange={(event) => {
                          const value = event.target.value;
                          setValues((prev) => ({ ...prev, [k]: value }));
                          setChecked((prev) => {
                            const copy = { ...prev };
                            delete copy[k];
                            return copy;
                          });
                        }}
                      />
                    )}
                    <span className="cell-mark" aria-hidden="true">
                      {state === "ok" ? <Check size={18} strokeWidth={3} /> : state === "bad" ? <X size={18} strokeWidth={3} /> : null}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (readOnly) {
    return (
      <section className="game">
        <p className="game-prompt">
          <Dual ar={game.prompt_ar} en={game.prompt_en} />
        </p>
        {table}
        {game.note_ar ? <Dual as="p" className="muted" ar={game.note_ar} en={game.note_en ?? game.note_ar} /> : null}
      </section>
    );
  }

  const anyWrong = Object.values(checked).some((ok) => ok === false);
  const allFilled = blanks.every((k) => (values[k] ?? "") !== "");

  return (
    <GameShell
      kind={{ ar: "أكمل الجدول", en: "Complete the table", icon: <Table2 size={16} strokeWidth={2} className="icon" /> }}
      prompt={{ ar: game.prompt_ar, en: game.prompt_en }}
      progress={{ done: correctCount, total: blanks.length }}
      mistakes={mistakes}
      result={result}
      glossary={glossary}
      signId={signId}
      onCloseSign={() => setSignId(null)}
    >
      {table}
      {game.note_ar ? <Dual as="p" className="small muted" ar={game.note_ar} en={game.note_en ?? game.note_ar} /> : null}
      {!result ? (
        <div className="btn-row">
          <button type="button" className="btn" onClick={check} disabled={!allFilled}>
            <Check size={20} strokeWidth={2.5} className="icon" aria-hidden="true" />
            <Dual ar="تحقّق من الجدول" en="Check the table" />
          </button>
          {!allFilled ? (
            <Dual as="p" className="small muted" ar="املأ كل الخانات الفارغة أولاً." en="Fill every empty cell first." />
          ) : null}
        </div>
      ) : null}
      {anyWrong && !result ? (
        <p className="feedback error" role="status">
          <X size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual ar="بعض الخانات خطأ. غيّرها ثم تحقّق مرة أخرى." en="Some cells are wrong. Change them and check again." />
        </p>
      ) : null}
    </GameShell>
  );
}
