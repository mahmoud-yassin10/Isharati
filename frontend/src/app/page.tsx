"use client";

import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { NewtonLab } from "@/components/NewtonLab";
import { SignPanel } from "@/components/SignPanel";
import { ForwardIcon } from "@/components/ui";
import { useLang } from "@/lib/lang";

/**
 * The path a hand travels between the interpreter and the word it spells.
 * Drawn left to right; mirrored for Arabic so it always leaves the video.
 */
function GesturePath() {
  return (
    <svg className="gesture-path flip-rtl" viewBox="0 0 120 64" aria-hidden="true" focusable="false">
      <path d="M4 46 C 30 46, 38 12, 64 14 S 100 34, 114 30" />
      <circle cx="4" cy="46" r="3.5" className="gp-start" />
      <circle cx="114" cy="30" r="3.5" className="gp-end" />
    </svg>
  );
}

export default function HomePage() {
  const { lang } = useLang();

  return (
    <AppShell user={null}>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">
              <Dual ar="تعلّم الفيزياء" en="Learn physics" />
              <br />
              <Dual as="span" className="hero-title-2" ar="بلغة الإشارة المصرية" en="in Egyptian Sign Language" />
            </h1>
            <Dual
              as="p"
              className="hero-lead"
              ar="كل مصطلح يظهر بإشارته أولاً، ثم تجرّبه في مختبر صغير تحرّكه بيدك. لا تحتاج إلى صوت، ولا إلى قراءة طويلة."
              en="Every term comes with its sign first, then you try it in a small lab you move yourself. No sound, and no long reading."
            />
            <div className="hero-actions">
              <a className="btn" href="/login?role=student">
                <Dual ar="ابدأ كطالب" en="Start as a student" />
                <ForwardIcon size={18} />
              </a>
              <a className="text-link" href="/login?role=teacher">
                <Dual ar="أنا معلم" en="I'm a teacher" />
              </a>
            </div>
          </div>

          <figure className="specimen" aria-label={lang === "en" ? "The word force, signed" : "كلمة قوة بلغة الإشارة"}>
            <SignPanel variant="specimen" termAr="قوة" termEn="force" mode="fingerspell" />
            <GesturePath />
            <figcaption className="specimen-word">
              <span className="specimen-ar" lang="ar">
                قوة
              </span>
              <span className="specimen-gloss">
                <span lang="en">force</span>
                <span className="sym force" lang="en">
                  F
                </span>
              </span>
              <span className="specimen-note">
                <Dual ar="تُهجّى بالأصابع:" en="Fingerspelled:" />{" "}
                <bdi lang="ar" dir="rtl">
                  ق · و · ة
                </bdi>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="method" aria-labelledby="method-title">
        <div className="wrap">
          <h2 id="method-title" className="section-title">
            <Dual ar="كل درس يسير بنفس الترتيب" en="Every lesson follows the same order" />
          </h2>
          <ol className="sequence">
            <li>
              <span className="seq-n" aria-hidden="true">
                1
              </span>
              <Dual as="h3" ar="شاهد الإشارة" en="Watch the sign" />
              <Dual as="p" ar="إشارة الكلمة تأتي أولاً. أعِدها أو أبطئها كما تحتاج." en="The word's sign comes first. Replay it or slow it down." />
            </li>
            <li>
              <span className="seq-n" aria-hidden="true">
                2
              </span>
              <Dual as="h3" ar="حرّك التجربة" en="Move the experiment" />
              <Dual as="p" ar="غيّر القوة أو الكتلة، وشاهد النتيجة تتحرك أمامك." en="Change the force or the mass, and watch the result move." />
            </li>
            <li>
              <span className="seq-n" aria-hidden="true">
                3
              </span>
              <Dual as="h3" ar="العب وتأكّد" en="Play and check" />
              <Dual as="p" ar="لعبة قصيرة أو سؤال بعد كل فكرة، ونجوم على قدر دقّتك." en="A short game or question after each idea, with stars for accuracy." />
            </li>
          </ol>
        </div>
      </section>

      <section className="lab-section" id="lab" aria-labelledby="lab-title">
        <div className="wrap">
          <header className="lab-section-head">
            <h2 id="lab-title" className="section-title">
              <Dual ar="غيّر القوة، وشاهد الصندوق" en="Change the force, watch the box" />
            </h2>
            <Dual
              as="p"
              className="section-lead"
              ar="القوة تدفع، والكتلة تقاوم، والتسارع هو ما يحدث للصندوق. جرّب قبل أن تقرأ المعادلة."
              en="Force pushes, mass resists, and acceleration is what happens to the box. Try it before you read the equation."
            />
          </header>
          <NewtonLab />
        </div>
      </section>

      <section className="roles" aria-label={lang === "en" ? "Accounts" : "الحسابات"}>
        <div className="wrap roles-grid">
          <div className="role">
            <Dual as="h2" ar="للطالب" en="For students" />
            <Dual
              as="p"
              ar="دروسك مرتبة حسب المادة: فيزياء، علوم، رياضيات، لغة إشارة، ودراسات. كل خطوة تحفظ مكانك، وكل لعبة تعطيك نجوماً."
              en="Your lessons are grouped by subject: physics, science, math, sign language, and social studies. Every step keeps your place, and every game gives you stars."
            />
            <a className="text-link" href="/login?role=student">
              <Dual ar="ادخل كطالب" en="Enter as a student" />
              <ForwardIcon size={16} />
            </a>
          </div>
          <div className="role">
            <Dual as="h2" ar="للمعلم" en="For teachers" />
            <Dual
              as="p"
              ar="عاين أي خطوة كما يراها الطالب، انشر الدرس وعيّنه، ثم تابع من أنهى ماذا."
              en="Preview any step as the student sees it, publish and assign the lesson, then see who finished what."
            />
            <a className="text-link" href="/login?role=teacher">
              <Dual ar="ادخل كمعلم" en="Enter as a teacher" />
              <ForwardIcon size={16} />
            </a>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
