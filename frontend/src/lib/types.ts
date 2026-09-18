export type Role = "teacher" | "student";

export type Subject = "physics" | "science" | "math" | "language" | "social";

export type StepType =
  | "esl_term"
  | "explain"
  | "simulate"
  | "challenge"
  | "sign_check"
  | "quiz"
  | "match"
  | "sort"
  | "order"
  | "diagram"
  | "table"
  | "truefalse";

export type SimulationKind = "newton_2nd";

export type GlossaryEntry = {
  term_ar: string;
  term_en: string;
  esl_mode: "lexicon" | "fingerspell" | "none";
  lexicon_token?: string;
};

export type QuizOption = {
  id: string;
  label_ar: string;
  label_en: string;
};

export type Quiz = {
  prompt_ar: string;
  prompt_en: string;
  correct_id: string;
  options: QuizOption[];
};

/**
 * How a game card is drawn. Text is always shown too, so the picture is never
 * the only cue.
 *   color: a swatch filled with `value` (any CSS color)
 *   dots:  `value` dots, for counting
 *   symbol: `value` drawn large in the mono face (F, m, a, 3 + 4 ...)
 */
export type CardVisual = { kind: "color" | "dots" | "symbol"; value: string };

export type GameCard = {
  id: string;
  ar: string;
  en: string;
  visual?: CardVisual;
  /** Glossary id: shows a small sign button on the card. */
  sign?: string;
};

export type MatchGame = {
  prompt_ar: string;
  prompt_en: string;
  /** Each pair: `a` goes in the first column, `b` in the second. */
  pairs: { id: string; a: GameCard; b: GameCard }[];
};

export type SortGame = {
  prompt_ar: string;
  prompt_en: string;
  buckets: GameCard[];
  items: (GameCard & { bucket: string })[];
};

export type OrderGame = {
  prompt_ar: string;
  prompt_en: string;
  /** Listed in the correct order; the game shuffles them. */
  items: GameCard[];
};

export type DiagramNode = GameCard & {
  /** Short fact shown when the node is opened. */
  note_ar?: string;
  note_en?: string;
};

export type DiagramGame = {
  kind: "compass" | "flow" | "number_line" | "cycle";
  mode: "explore" | "find";
  prompt_ar: string;
  prompt_en: string;
  nodes: DiagramNode[];
  /** For mode "find": the node ids to ask for, in order. */
  targets?: string[];
};

export type TableCell =
  | { value: string }
  | { answer: number; tolerance?: number; choices?: number[] };

export type TableGame = {
  prompt_ar: string;
  prompt_en: string;
  columns: { ar: string; en: string; unit?: string; tone?: "force" | "mass" | "accel" }[];
  rows: TableCell[][];
  note_ar?: string;
  note_en?: string;
};

export type TrueFalseGame = {
  prompt_ar: string;
  prompt_en: string;
  statements: { id: string; ar: string; en: string; answer: boolean; why_ar?: string; why_en?: string }[];
};

export type LessonStep = {
  id: string;
  type: StepType;
  title_ar: string;
  title_en?: string;
  body_ar?: string;
  body_en?: string;
  glossary_ids?: string[];
  simulation?: {
    kind: SimulationKind;
    params: Record<string, number>;
    goal?: { key: string; value: number; tolerance: number };
  };
  sign_target?: string;
  quiz?: Quiz;
  match?: MatchGame;
  sort?: SortGame;
  order?: OrderGame;
  diagram?: DiagramGame;
  table?: TableGame;
  truefalse?: TrueFalseGame;
};

export type Lesson = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string;
  subject: Subject;
  status: "draft" | "published";
  /** One-line summary for the lesson card. */
  summary_ar?: string;
  summary_en?: string;
  minutes?: number;
  glossary: Record<string, GlossaryEntry>;
  steps: LessonStep[];
};

export type User = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

export type StepSnapshot = {
  F?: number;
  m?: number;
  a?: number;
  /** Game result: 1 to 3 stars. */
  stars?: number;
  mistakes?: number;
};

export type ProgressItem = {
  student_id: string;
  student_name: string;
  step_id: string;
  status: string;
  sim_snapshot: StepSnapshot | null;
  predicted_sign: string | null;
  updated_at: string | null;
};

export type TeacherStudent = {
  id: string;
  name: string;
  email: string;
  assigned_count: number;
  completed_count: number;
  last_activity: string | null;
};

export type TeacherStudentDetail = {
  id: string;
  name: string;
  email: string;
  lesson_ids: string[];
};
