export type Role = "teacher" | "student";

export type StepType = "esl_term" | "explain" | "simulate" | "challenge" | "sign_check" | "quiz";

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
};

export type Lesson = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string;
  subject: "physics" | "language";
  status: "draft" | "published";
  glossary: Record<string, GlossaryEntry>;
  steps: LessonStep[];
};

export type User = {
  id: string;
  email: string;
  role: Role;
  name: string;
};

export type ProgressItem = {
  student_id: string;
  student_name: string;
  step_id: string;
  status: string;
  sim_snapshot: { F?: number; m?: number; a?: number } | null;
  predicted_sign: string | null;
  updated_at: string | null;
};
