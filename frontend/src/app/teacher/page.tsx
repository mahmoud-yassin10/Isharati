"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { listLessons } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import type { Lesson } from "@/lib/types";

export default function TeacherHome() {
  const router = useRouter();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "teacher") {
      router.replace("/login?role=teacher");
      return;
    }
    listLessons()
      .then(setLessons)
      .catch(() => setError("تعذر تحميل الدروس."));
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
          <Dual ar="دروس الفيزياء" en="Physics lessons" />
        </h1>
        <Dual as="p" className="hint" ar="افتح الدرس لمعاينة المختبر، ثم انشره وعيّنه." en="Open the lesson, preview the lab, then publish and assign." />
        {error ? <Dual as="p" className="error" ar="تعذر تحميل الدروس." en="Could not load lessons." /> : null}
        {lessons.length === 0 && !error ? <Dual as="p" ar="لا توجد دروس بعد." en="No lessons yet." /> : null}
        {lessons.map((lesson) => (
          <article className="lesson-row" key={lesson.id}>
            <div>
              <h2>
                <Dual ar={lesson.title_ar} en={lesson.title_en ?? "Physics lesson"} />
              </h2>
              <Dual
                as="p"
                className="hint"
                ar={lesson.status === "published" ? "منشور" : "مسودة"}
                en={lesson.status === "published" ? "Published" : "Draft"}
              />
            </div>
            <a className="btn" href={`/teacher/lessons/${lesson.id}`}>
              <Dual ar="معاينة الدرس" en="Preview lesson" />
            </a>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
