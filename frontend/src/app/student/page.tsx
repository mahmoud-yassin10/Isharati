"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, FlaskConical, Languages, PlayCircle, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { ProgressBadge } from "@/components/ProgressBadge";
import { ForwardIcon, LoadingBlock, ProgressBar } from "@/components/ui";
import { lessonStats, type LessonStats } from "@/lib/gamification";
import { lessonProgress, listLessons } from "@/lib/api";
import { useUser } from "@/lib/useUser";
import type { Lesson } from "@/lib/types";

export default function StudentHome() {
  const router = useRouter();
  const { user, ready } = useUser();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [stats, setStats] = useState<Record<string, LessonStats>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "student") {
      router.replace("/login?role=student");
      return;
    }
    listLessons()
      .then(async (loaded) => {
        setLessons(loaded);
        const entries = await Promise.all(
          loaded.map(async (lesson) => {
            try {
              return [lesson.id, lessonStats(lesson, await lessonProgress(lesson.id))] as const;
            } catch {
              return [lesson.id, lessonStats(lesson, [])] as const;
            }
          }),
        );
        setStats(Object.fromEntries(entries));
      })
      .catch(() => setError(true));
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <AppShell user={null}>
        <div className="wrap page">
          <LoadingBlock rows={2} />
        </div>
      </AppShell>
    );
  }

  const next = lessons?.find((lesson) => (stats[lesson.id]?.state ?? "new") !== "complete") ?? null;
  const nextStats = next ? stats[next.id] : undefined;
  const firstName = user.name.trim().split(" ")[0];

  return (
    <AppShell user={user}>
      <div className="wrap page">
        <div className="greeting">
          <h1>
            <Dual ar={`أهلاً ${firstName}`} en={`Hello ${firstName}`} />
          </h1>
          <Dual
            as="p"
            className="muted"
            ar="أكمل من حيث توقفت. الإشارة تعمل وحدها في كل خطوة."
            en="Continue where you stopped. The sign plays by itself on every step."
          />
        </div>

        {error ? (
          <p className="feedback error" role="status">
            <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="تعذّر تحميل دروسك. حدّث الصفحة." en="Could not load your lessons. Refresh the page." />
          </p>
        ) : null}

        {next && nextStats ? (
          <section className="continue-card" aria-labelledby="continue-title">
            <div className="lesson-thumb" aria-hidden="true">
              <PlayCircle size={56} strokeWidth={1.25} color="var(--primary)" />
            </div>
            <div className="body">
              <div className="stack-sm">
                <p className="chip primary" style={{ justifySelf: "start" }}>
                  <Dual
                    ar={nextStats.state === "new" ? "درس جديد" : "أكمل الدرس"}
                    en={nextStats.state === "new" ? "New lesson" : "Continue"}
                  />
                </p>
                <h2 id="continue-title">
                  <Dual ar={next.title_ar} en={next.title_en ?? next.title_ar} />
                </h2>
              </div>
              <ProgressBar value={nextStats.done} total={nextStats.total} />
              <p>
                <a className="btn large" href={`/student/lessons/${next.id}`}>
                  <Dual
                    ar={nextStats.state === "new" ? "ابدأ الدرس" : "أكمل الدرس"}
                    en={nextStats.state === "new" ? "Start the lesson" : "Continue the lesson"}
                  />
                  <ForwardIcon size={22} />
                </a>
              </p>
            </div>
          </section>
        ) : null}

        <div className="section-head">
          <h2>
            <Dual ar="كل دروسي" en="All my lessons" />
          </h2>
          {lessons ? (
            <Dual
              as="p"
              className="small"
              ar={`${lessons.length} درس معيّن`}
              en={`${lessons.length} assigned lesson${lessons.length === 1 ? "" : "s"}`}
            />
          ) : null}
        </div>

        {lessons === null && !error ? <LoadingBlock rows={2} height={120} /> : null}

        {lessons?.length === 0 ? (
          <div className="empty">
            <BookOpen size={40} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="لا يوجد درس معيّن لك بعد." en="No lesson has been assigned to you yet." />
            <Dual as="p" className="small" ar="اطلب من معلمك أن يعيّن درساً." en="Ask your teacher to assign one." />
          </div>
        ) : null}

        <ul className="lesson-list">
          {lessons?.map((lesson) => {
            const stat = stats[lesson.id];
            return (
              <li className="lesson-item" key={lesson.id}>
                <div className="lesson-thumb" aria-hidden="true">
                  {lesson.subject === "language" ? (
                    <Languages size={40} strokeWidth={1.5} color="var(--primary)" />
                  ) : (
                    <FlaskConical size={40} strokeWidth={1.5} color="var(--primary)" />
                  )}
                </div>
                <div className="meta">
                  <h3>
                    <Dual ar={lesson.title_ar} en={lesson.title_en ?? lesson.title_ar} />
                  </h3>
                  <div className="chips">
                    <span className="chip">
                      <Dual
                        ar={lesson.subject === "language" ? "لغة" : "فيزياء"}
                        en={lesson.subject === "language" ? "Language" : "Physics"}
                      />
                    </span>
                    {stat?.state === "complete" ? (
                      <span className="chip ok">
                        <Check size={16} strokeWidth={2.5} className="icon" aria-hidden="true" />
                        <Dual ar="مكتمل" en="Complete" />
                      </span>
                    ) : (
                      <span className="chip">
                        <Dual
                          ar={stat?.state === "learning" ? "قيد التعلّم" : "لم يبدأ"}
                          en={stat?.state === "learning" ? "In progress" : "Not started"}
                        />
                      </span>
                    )}
                    {stat?.badge ? <ProgressBadge badge={stat.badge} /> : null}
                  </div>
                  {stat ? <ProgressBar value={stat.done} total={stat.total} /> : null}
                </div>
                <a className="btn secondary" href={`/student/lessons/${lesson.id}`}>
                  <Dual
                    ar={stat && stat.done > 0 ? "أكمل" : "ابدأ"}
                    en={stat && stat.done > 0 ? "Continue" : "Start"}
                  />
                  <ForwardIcon />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
