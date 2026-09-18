import { Atom, Calculator, Globe2, Hand, Leaf, type LucideIcon } from "lucide-react";
import type { Subject } from "@/lib/types";

export type SubjectMeta = {
  id: Subject;
  ar: string;
  en: string;
  icon: LucideIcon;
};

/** Display order on the student and teacher pages. */
export const SUBJECTS: SubjectMeta[] = [
  { id: "physics", ar: "الفيزياء", en: "Physics", icon: Atom },
  { id: "science", ar: "العلوم", en: "Science", icon: Leaf },
  { id: "math", ar: "الرياضيات", en: "Math", icon: Calculator },
  { id: "language", ar: "لغة الإشارة", en: "Sign language", icon: Hand },
  { id: "social", ar: "الدراسات الاجتماعية", en: "Social studies", icon: Globe2 },
];

export function subjectMeta(id: string): SubjectMeta {
  return SUBJECTS.find((subject) => subject.id === id) ?? SUBJECTS[0];
}

export function SubjectIcon({ subject, size = 24 }: { subject: string; size?: number }) {
  const Icon = subjectMeta(subject).icon;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}
