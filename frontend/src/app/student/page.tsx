"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { listLessons } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import type { Lesson } from "@/lib/types";

export default function StudentHome() {
  const router = useRouter();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "student") {
      router.replace("/login?role=student");
      return;
    }
    listLessons()
      .then(setLessons)
      .catch(() => setError("تعذر تحميل الدروس المعيّنة."));
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <Dual as="p" ar="جارٍ التحميل…" en="Loading…" />
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="stack">
        <h1>
          <Dual ar="دروسي" en="My lessons" />
        </h1>
        <Dual as="p" className="hint" ar="افتح الدرس. الإشارة تعمل وحدها. ثم حرّك المختبر." en="Open the lesson. The sign plays by itself. Then use the lab." />
        {error ? <Dual as="p" className="error" ar="تعذر تحميل الدروس المعيّنة." en="Could not load assigned lessons." /> : null}
        {lessons.length === 0 && !error ? (
          <Dual as="p" ar="لا يوجد درس معيّن بعد. اطلب من المعلم التعيين." en="No lesson assigned yet. Ask the teacher to assign one." />
        ) : null}
        {lessons.map((lesson) => (
          <article className="lesson-row" key={lesson.id}>
            <div>
              <h2>
                <Dual ar={lesson.title_ar} en={lesson.title_en ?? "Physics lesson"} />
              </h2>
              <Dual
                as="p"
                className="hint"
                ar={`${lesson.steps.length} خطوات`}
                en={`${lesson.steps.length} steps`}
              />
            </div>
            <a className="btn" href={`/student/lessons/${lesson.id}`}>
              <Dual ar="ابدأ الدرس" en="Start lesson" />
            </a>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
