"use client";

import { DiagramGame } from "@/components/games/DiagramGame";
import { MatchGame } from "@/components/games/MatchGame";
import { OrderGame } from "@/components/games/OrderGame";
import { SortGame } from "@/components/games/SortGame";
import { TableGame } from "@/components/games/TableGame";
import { TrueFalseGame } from "@/components/games/TrueFalseGame";
import type { GameResult } from "@/components/games/shared";
import type { GlossaryEntry, LessonStep, StepType } from "@/lib/types";

export const GAME_TYPES: StepType[] = ["match", "sort", "order", "diagram", "table", "truefalse"];

export function isGameStep(step: LessonStep) {
  return GAME_TYPES.includes(step.type);
}

/** A reference table (no blanks) never blocks the Next button. */
export function stepNeedsResult(step: LessonStep) {
  if (step.type === "table") {
    return Boolean(step.table?.rows.some((row) => row.some((cell) => "answer" in cell)));
  }
  return isGameStep(step);
}

export function GameStep({
  step,
  glossary,
  onComplete,
}: {
  step: LessonStep;
  glossary: Record<string, GlossaryEntry>;
  onComplete: (result: GameResult) => void;
}) {
  const props = { glossary, onComplete };
  if (step.type === "match" && step.match) return <MatchGame game={step.match} {...props} />;
  if (step.type === "sort" && step.sort) return <SortGame game={step.sort} {...props} />;
  if (step.type === "order" && step.order) return <OrderGame game={step.order} {...props} />;
  if (step.type === "diagram" && step.diagram) return <DiagramGame game={step.diagram} {...props} />;
  if (step.type === "table" && step.table) return <TableGame game={step.table} {...props} />;
  if (step.type === "truefalse" && step.truefalse) return <TrueFalseGame game={step.truefalse} {...props} />;
  return null;
}
