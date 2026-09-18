"use client";

import {
  ArrowDown,
  Award,
  BookOpen,
  Check,
  Contrast,
  Eye,
  GraduationCap,
  Hand,
  Pause,
  Play,
  Send,
  Settings,
  SlidersHorizontal,
  Target,
  Type,
  UserPlus,
  Users,
} from "lucide-react";
import { A11yControls } from "@/components/A11yControls";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { NewtonLab } from "@/components/NewtonLab";
import { SignPanel } from "@/components/SignPanel";
import { ForwardIcon } from "@/components/ui";

/** Small gold arc used as a section marker and to link the hero steps. */
function MotionArc({ className = "" }: { className?: string }) {
  return (
    <svg className={`motion-arc ${className}`.trim()} viewBox="0 0 80 28" aria-hidden="true" focusable="false">
      <path d="M2 24C18 24 24 4 40 4s22 20 38 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="4" r="3.4" fill="currentColor" />
    </svg>
  );
}

function Eyebrow({ ar, en }: { ar: string; en: string }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-line" aria-hidden="true" />
      <Dual ar={ar} en={en} />
    </p>
  );
}

export default function HomePage() {
  return (
    <AppShell user={null}>
      {/* ------------------------------------------------------------- hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <Eyebrow ar="منصة مصرية · لغة الإشارة المصرية" en="An Egyptian platform · Egyptian Sign Language" />
            <h1 className="hero-title">
              <span>
                <Dual as="span" ar="الفيزياء" en="Physics" />
              </span>{" "}
              <span className="hero-title-accent">
                <Dual as="span" ar="بلغة الإشارة المصرية" en="in Egyptian Sign Language" />
              </span>
            </h1>
            <Dual
              as="p"
              className="hero-lead"
              ar="كل كلمة لها إشارة، وكل قانون له تجربة تتحرك أمامك. تعلّم بالعين واليد: بدون صوت، وبدون قراءة طويلة."
              en="Every word has a sign, every law has an experiment that moves in front of you. Learn with your eyes and hands: no sound, no long reading."
            />
            <div className="btn-row hero-actions">
              <a className="btn primary large" href="/login?role=student">
                <GraduationCap size={23} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="ابدأ كطالب" en="Start as a student" />
                <ForwardIcon size={21} />
              </a>
              <a className="btn secondary large" href="/login?role=teacher">
                <Users size={23} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="ادخل كمعلم" en="Enter as a teacher" />
              </a>
            </div>
            <ul className="hero-facts">
              <li>
                <Check size={17} strokeWidth={2.6} className="icon" aria-hidden="true" />
                <Dual ar="إشارة لكل مصطلح" en="A sign for every term" />
              </li>
              <li>
                <Check size={17} strokeWidth={2.6} className="icon" aria-hidden="true" />
                <Dual ar="بدون أي صوت" en="No sound at all" />
              </li>
              <li>
                <Check size={17} strokeWidth={2.6} className="icon" aria-hidden="true" />
                <Dual ar="منهج الصف الأول الثانوي" en="Secondary school curriculum" />
              </li>
            </ul>
          </div>

          <div className="hero-visual">
            <div className="workbench">
              <div className="workbench-head">
                <span className="stage-pill sign">
                  <Hand size={15} strokeWidth={2} aria-hidden="true" />
                  <Dual ar="إشارة" en="Sign" />
                </span>
                <MotionArc className="stage-link" />
                <span className="stage-pill lab">
                  <SlidersHorizontal size={15} strokeWidth={2} aria-hidden="true" />
                  <Dual ar="تجربة" en="Experiment" />
                </span>
                <MotionArc className="stage-link" />
                <span className="stage-pill think">
                  <Check size={15} strokeWidth={2.6} aria-hidden="true" />
                  <Dual ar="فهم" en="Understanding" />
                </span>
              </div>

              <div className="hero-sign">
                <SignPanel termAr="قوة" termEn="force" mode="lexicon" playAr="قوة" />
              </div>

              <div className="workbench-rule" aria-hidden="true">
                <span />
                <ArrowDown size={18} strokeWidth={2} />
                <span />
              </div>

              <NewtonLab compact />

              <p className="workbench-foot">
                <a className="back-link" href="#flow">
                  <Dual ar="كيف يعمل الدرس؟" en="How a lesson works" />
                  <ArrowDown size={17} strokeWidth={2} className="icon" aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- flow */}
      <section className="flow-band" id="flow">
        <div className="wrap">
          <header className="section-head">
            <Eyebrow ar="الطريقة" en="The method" />
            <h2 className="section-title">
              <Dual ar="الدرس ثلاث خطوات" en="A lesson is three steps" />
            </h2>
            <Dual
              as="p"
              className="section-lead"
              ar="نفس الترتيب في كل درس، حتى يعرف الطالب أين ينظر."
              en="The same order in every lesson, so the student knows where to look."
            />
          </header>

          <ol className="flow">
            <li className="flow-step">
              <span className="flow-num" aria-hidden="true">
                01
              </span>
              <span className="flow-icon" aria-hidden="true">
                <Hand size={22} strokeWidth={1.75} />
              </span>
              <h3 className="flow-title">
                <Dual ar="شاهد الإشارة" en="Watch the sign" />
              </h3>
              <Dual
                as="p"
                className="flow-text"
                ar="إشارة الكلمة تأتي أولاً: قوة، كتلة، تسارع. أعِدها أو أبطئها كما تحتاج."
                en="The word's sign comes first: force, mass, acceleration. Replay it or slow it down."
              />
            </li>
            <li className="flow-step">
              <span className="flow-num" aria-hidden="true">
                02
              </span>
              <span className="flow-icon" aria-hidden="true">
                <SlidersHorizontal size={22} strokeWidth={1.75} />
              </span>
              <h3 className="flow-title">
                <Dual ar="جرّب بنفسك" en="Try it yourself" />
              </h3>
              <Dual
                as="p"
                className="flow-text"
                ar="زد القوة فيسرع الصندوق، وزد الكتلة فيبطؤ. القانون يظهر في الحركة، لا في جملة."
                en="Raise the force and the box speeds up; raise the mass and it slows. The law shows in the motion, not a sentence."
              />
            </li>
            <li className="flow-step">
              <span className="flow-num" aria-hidden="true">
                03
              </span>
              <span className="flow-icon" aria-hidden="true">
                <Check size={22} strokeWidth={2.4} />
              </span>
              <h3 className="flow-title">
                <Dual ar="تأكد من فهمك" en="Check your understanding" />
              </h3>
              <Dual
                as="p"
                className="flow-text"
                ar="اضبط التسارع على هدف، أجب عن سؤال قصير، أو أشِر الكلمة أمام الكاميرا."
                en="Hit a target acceleration, answer a short question, or sign the word to the camera."
              />
            </li>
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------------- lab */}
      <section className="lab-band" id="lab">
        <div className="wrap lab-grid">
          <div className="lab-intro">
            <Eyebrow ar="المختبر" en="The lab" />
            <h2 className="section-title">
              <Dual ar="شوف العلاقة قبل المعادلة" en="See the relation before the equation" />
            </h2>
            <Dual
              as="p"
              className="section-lead"
              ar="ثلاث كميات فقط: القوة تدفع، والكتلة تقاوم، والتسارع هو النتيجة. حرّك الشريطين وراقب الصندوق."
              en="Only three quantities: force pushes, mass resists, acceleration is the result. Move the two sliders and watch the box."
            />
            <ul className="relation-list">
              <li>
                <span className="rel-swatch force" aria-hidden="true" />
                <span>
                  <Dual as="strong" ar="القوة F" en="Force F" />
                  <Dual as="span" ar="دفعة تزيد سرعة الصندوق." en="A push that speeds the box up." />
                </span>
              </li>
              <li>
                <span className="rel-swatch mass" aria-hidden="true" />
                <span>
                  <Dual as="strong" ar="الكتلة m" en="Mass m" />
                  <Dual as="span" ar="مقاومة للحركة: كلما زادت قلّ التسارع." en="Resistance to motion: more mass, less acceleration." />
                </span>
              </li>
              <li>
                <span className="rel-swatch accel" aria-hidden="true" />
                <span>
                  <Dual as="strong" ar="التسارع a" en="Acceleration a" />
                  <Dual as="span" ar="النتيجة: تحرّك الصندوق يزيد كل ثانية." en="The result: how much the box's motion grows each second." />
                </span>
              </li>
            </ul>
            <p className="relation-formula">
              <span className="sr-only">
                <Dual ar="التسارع يساوي القوة مقسومة على الكتلة" en="Acceleration equals force divided by mass" />
              </span>
              <span aria-hidden="true">
                a = <b>F</b> ÷ <b>m</b>
              </span>
            </p>
          </div>

          <div className="lab-panel">
            <NewtonLab />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- settings */}
      <section className="a11y-band" id="settings">
        <div className="wrap a11y-grid">
          <div className="a11y-copy">
            <Eyebrow ar="تجربتك" en="Your experience" />
            <h2 className="section-title">
              <Dual ar="الإعدادات ليست إضافة — هي هيكل المنتج" en="Settings are not an add-on — they are the product's structure" />
            </h2>
            <Dual
              as="p"
              className="section-lead"
              ar="هي طريقة عمل إشارتي: كل إعداد هنا يعمل في كل صفحة، ويُحفظ على هذا الجهاز وحده."
              en="It is how Isharati works: every setting here applies on every page and is saved on this device only."
            />
            <ul className="a11y-points">
              <li>
                <Hand size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="إشارة كل مصطلح تبدأ وحدها، وبسرعة تختارها." en="Each term's sign starts by itself, at a speed you choose." />
              </li>
              <li>
                <Type size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="ثلاثة أحجام للخط في كل الموقع." en="Three text sizes across the whole site." />
              </li>
              <li>
                <Contrast size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="تباين عالٍ للشاشات تحت ضوء الفصل." en="High contrast for classroom glare." />
              </li>
              <li>
                <Pause size={19} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="تهدئة الحركة: يتوقف الصندوق وتبقى الأرقام تعمل." en="Still motion: the box freezes and the numbers keep working." />
              </li>
            </ul>
            <p>
              <a className="btn secondary" href="/settings">
                <Settings size={21} strokeWidth={1.75} className="icon" aria-hidden="true" />
                <Dual ar="كل الإعدادات" en="All settings" />
              </a>
            </p>
          </div>

          <div className="console">
            <header className="console-head">
              <span className="console-dot" aria-hidden="true" />
              <Dual as="h3" ar="لوحة الإعدادات" en="Settings console" />
              <span className="console-live">
                <Dual ar="تعمل الآن" en="Live" />
              </span>
            </header>
            <A11yControls />
            <p className="console-foot">
              <Dual
                ar="جرّبها هنا مباشرة: اختيار المظهر يغيّر الموقع كله في هذه اللحظة."
                en="Try it right here: picking a theme re-skins the whole site in this very moment."
              />
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ roles */}
      <section className="roles-band" id="roles">
        <div className="wrap">
          <header className="section-head">
            <Eyebrow ar="حسابان" en="Two accounts" />
            <h2 className="section-title">
              <Dual ar="طالب يتعلّم، ومعلم يتابع" en="A student who learns, a teacher who follows" />
            </h2>
          </header>

          <div className="roles-grid">
            <article className="role-panel">
              <span className="role-badge" aria-hidden="true">
                <GraduationCap size={24} strokeWidth={1.75} />
              </span>
              <h3 className="role-title">
                <Dual ar="للطالب" en="For the student" />
              </h3>
              <Dual
                as="p"
                className="role-text"
                ar="دروسك المعيّنة، وتقدّمك في كل خطوة، وشارات تجمعها حين تكمل درساً."
                en="Your assigned lessons, your progress step by step, and badges you collect when you finish."
              />
              <ul className="role-list">
                <li>
                  <BookOpen size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                  <Dual ar="دروس مرتّبة حسب المادة" en="Lessons grouped by subject" />
                </li>
                <li>
                  <Target size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                  <Dual ar="لعبة قصيرة بعد كل فكرة" en="A short game after each idea" />
                </li>
                <li>
                  <Award size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                  <Dual ar="نجوم ومستويات وشارات" en="Stars, levels, and badges" />
                </li>
              </ul>
              <a className="btn primary" href="/login?role=student">
                <Dual ar="ادخل كطالب" en="Enter as a student" />
                <ForwardIcon />
              </a>
            </article>

            <article className="role-panel role-panel-teacher">
              <span className="role-badge" aria-hidden="true">
                <Users size={24} strokeWidth={1.75} />
              </span>
              <h3 className="role-title">
                <Dual ar="للمعلم" en="For the teacher" />
              </h3>
              <Dual
                as="p"
                className="role-text"
                ar="أربع خطوات بترتيبها: عاين الدرس والمختبر، انشره، عيّنه لطلابك، وتابع من أكمل أي خطوة."
                en="Four steps in order: preview the lesson and the lab, publish it, assign it, and see who finished which step."
              />
              <ol className="step-chips">
                <li>
                  <span className="role-step-n" aria-hidden="true">
                    1
                  </span>
                  <Eye size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                  <Dual ar="عاين" en="Preview" />
                </li>
                <li>
                  <span className="role-step-n" aria-hidden="true">
                    2
                  </span>
                  <Send size={18} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
                  <Dual ar="انشر" en="Publish" />
                </li>
                <li>
                  <span className="role-step-n" aria-hidden="true">
                    3
                  </span>
                  <UserPlus size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
                  <Dual ar="عيّن" en="Assign" />
                </li>
                <li>
                  <span className="role-step-n" aria-hidden="true">
                    4
                  </span>
                  <Check size={18} strokeWidth={2.4} className="icon" aria-hidden="true" />
                  <Dual ar="تابع" en="Track" />
                </li>
              </ol>
              <a className="btn secondary" href="/login?role=teacher">
                <Dual ar="ادخل كمعلم" en="Enter as a teacher" />
                <ForwardIcon />
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- CTA */}
      <section className="cta-band">
        <div className="wrap cta-inner">
          <div>
            <h2 className="cta-title">
              <Dual ar="الدرس الأول جاهز: قانون نيوتن الثاني" en="The first lesson is ready: Newton's second law" />
            </h2>
            <Dual
              as="p"
              className="cta-text"
              ar="افتحه بحساب الطالب، أو عاينه بحساب المعلم. حساب التجربة جاهز في صفحة الدخول."
              en="Open it with the student account, or preview it as the teacher. A demo account is ready on the login page."
            />
          </div>
          <div className="btn-row">
            <a className="btn primary large" href="/login?role=student">
              <Play size={22} strokeWidth={2} className="icon flip-rtl" aria-hidden="true" />
              <Dual ar="ابدأ كطالب" en="Start as a student" />
            </a>
            <a className="btn secondary large" href="/login?role=teacher">
              <Dual ar="ادخل كمعلم" en="Enter as a teacher" />
              <ForwardIcon size={21} />
            </a>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
