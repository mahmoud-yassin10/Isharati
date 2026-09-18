"use client";

import {
  Accessibility,
  Check,
  Contrast,
  FlaskConical,
  GraduationCap,
  Hand,
  Pause,
  SlidersHorizontal,
  Type,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dual } from "@/components/Dual";
import { NewtonLab } from "@/components/NewtonLab";
import { ForwardIcon } from "@/components/ui";

export default function HomePage() {
  return (
    <AppShell user={null}>
      <div className="wrap hero">
        <div className="hero-copy">
          <h1>
            <Dual
              ar="الفيزياء بلغة الإشارة المصرية، وبمختبر تجرّبه بيدك"
              en="Physics in Egyptian Sign Language, with a lab you move yourself"
            />
          </h1>
          <Dual
            as="p"
            className="lead"
            ar="كل كلمة لها إشارة. كل قانون له تجربة تتحرك أمامك. لا يحتاج الدرس إلى صوت ولا إلى قراءة طويلة."
            en="Every word has a sign. Every law has an experiment that moves in front of you. No sound, no long reading."
          />
          <div className="btn-row">
            <a className="btn large" href="/login?role=student">
              <GraduationCap size={24} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="ابدأ كطالب" en="Start as a student" />
              <ForwardIcon size={22} />
            </a>
            <a className="btn secondary large" href="/login?role=teacher">
              <Users size={24} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="ادخل كمعلم" en="Enter as a teacher" />
            </a>
          </div>
          <ul className="hero-facts">
            <li>
              <Check size={18} strokeWidth={2.5} className="icon" aria-hidden="true" />
              <Dual ar="إشارة لكل مصطلح" en="A sign for every term" />
            </li>
            <li>
              <Check size={18} strokeWidth={2.5} className="icon" aria-hidden="true" />
              <Dual ar="بدون أي صوت" en="No sound at all" />
            </li>
            <li>
              <Check size={18} strokeWidth={2.5} className="icon" aria-hidden="true" />
              <Dual ar="منهج الصف الأول الثانوي" en="Secondary school curriculum" />
            </li>
          </ul>
        </div>
        <NewtonLab compact />
      </div>

      <section className="band">
        <div className="wrap">
          <div className="section-head">
            <h2>
              <Dual ar="الدرس ثلاث خطوات" en="A lesson is three steps" />
            </h2>
            <Dual
              as="p"
              ar="نفس الترتيب في كل درس، حتى يعرف الطالب أين ينظر."
              en="The same order in every lesson, so the student knows where to look."
            />
          </div>
          <ol className="how-steps">
            <li>
              <div className="how-visual sign">
                <Hand size={52} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="how-title">
                <span className="how-num" aria-hidden="true">
                  1
                </span>
                <Dual ar="شاهد الإشارة" en="Watch the sign" />
              </h3>
              <Dual
                as="p"
                className="muted"
                ar="تظهر إشارة الكلمة أولاً: قوة، كتلة، تسارع. تستطيع إعادتها أو إبطاءها."
                en="The sign for the word comes first: force, mass, acceleration. Replay it or slow it down."
              />
            </li>
            <li>
              <div className="how-visual lab">
                <SlidersHorizontal size={52} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="how-title">
                <span className="how-num" aria-hidden="true">
                  2
                </span>
                <Dual ar="حرّك المختبر" en="Move the lab" />
              </h3>
              <Dual
                as="p"
                className="muted"
                ar="زد القوة فيسرع الصندوق. زد الكتلة فيبطؤ. القانون يظهر في الحركة لا في جملة."
                en="Raise the force and the box speeds up. Raise the mass and it slows. The law shows in the motion."
              />
            </li>
            <li>
              <div className="how-visual check">
                <Check size={52} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="how-title">
                <span className="how-num" aria-hidden="true">
                  3
                </span>
                <Dual ar="تحقّق من فهمك" en="Check what you understood" />
              </h3>
              <Dual
                as="p"
                className="muted"
                ar="اضبط التسارع على هدف، أجب عن سؤال قصير، أو أشِر الكلمة أمام الكاميرا."
                en="Hit a target acceleration, answer a short question, or sign the word to the camera."
              />
            </li>
          </ol>
        </div>
      </section>

      <div className="wrap split">
        <div className="stack-sm">
          <h2>
            <Dual ar="مبني للطالب الأصم" en="Built for the deaf student" />
          </h2>
          <Dual
            as="p"
            className="muted prose"
            ar="الإتاحة ليست إضافة في القائمة. كل إعداد هنا يعمل في كل صفحة، ويُحفظ على جهازك."
            en="Accessibility is not an extra menu item. Every setting here works on every page and is saved on your device."
          />
          <p>
            <a className="btn secondary" href="/accessibility">
              <Accessibility size={22} strokeWidth={1.75} className="icon" aria-hidden="true" />
              <Dual ar="افتح إعدادات الإتاحة" en="Open accessibility settings" />
            </a>
          </p>
        </div>
        <ul className="feature-list">
          <li>
            <span className="feature-icon" aria-hidden="true">
              <Hand size={22} strokeWidth={1.75} />
            </span>
            <div>
              <Dual as="strong" ar="الإشارة تعمل وحدها" en="Signs play by themselves" />
              <Dual
                as="p"
                ar="تبدأ إشارة كل مصطلح تلقائياً، وتستطيع إبطاءها إلى 0.6 من السرعة."
                en="Each term's sign starts automatically, and you can slow it to 0.6 speed."
              />
            </div>
          </li>
          <li>
            <span className="feature-icon" aria-hidden="true">
              <Type size={22} strokeWidth={1.75} />
            </span>
            <div>
              <Dual as="strong" ar="ثلاثة أحجام للخط" en="Three text sizes" />
              <Dual as="p" ar="كبّر النص لكل الموقع بضغطة واحدة." en="Enlarge the text across the site with one press." />
            </div>
          </li>
          <li>
            <span className="feature-icon" aria-hidden="true">
              <Contrast size={22} strokeWidth={1.75} />
            </span>
            <div>
              <Dual as="strong" ar="تباين عالي" en="High contrast" />
              <Dual as="p" ar="أسود على أبيض بحدود واضحة، للشاشات تحت ضوء الفصل." en="Black on white with strong borders, for classroom glare." />
            </div>
          </li>
          <li>
            <span className="feature-icon" aria-hidden="true">
              <Pause size={22} strokeWidth={1.75} />
            </span>
            <div>
              <Dual as="strong" ar="تهدئة الحركة" en="Still motion" />
              <Dual as="p" ar="يتوقف الصندوق عن الحركة، وتبقى الأرقام والمؤشرات تعمل." en="The box stops moving while the numbers keep working." />
            </div>
          </li>
        </ul>
      </div>

      <div className="wrap roles">
        <div className="panel role-card">
          <span className="feature-icon" aria-hidden="true">
            <GraduationCap size={28} strokeWidth={1.75} />
          </span>
          <h2>
            <Dual ar="للطالب" en="For the student" />
          </h2>
          <Dual
            as="p"
            className="muted"
            ar="دروسك المعيّنة، وتقدّمك في كل خطوة، وشارات تجمعها حين تكمل درساً."
            en="Your assigned lessons, your progress step by step, and badges you collect when you finish."
          />
          <a className="btn" href="/login?role=student">
            <Dual ar="ادخل كطالب" en="Enter as a student" />
            <ForwardIcon />
          </a>
        </div>
        <div className="panel role-card">
          <span className="feature-icon" aria-hidden="true">
            <FlaskConical size={28} strokeWidth={1.75} />
          </span>
          <h2>
            <Dual ar="للمعلم" en="For the teacher" />
          </h2>
          <Dual
            as="p"
            className="muted"
            ar="عاين الدرس والمختبر، انشره، عيّنه لطلابك، وتابع من أكمل أي خطوة."
            en="Preview the lesson and the lab, publish it, assign it, and see who finished which step."
          />
          <a className="btn secondary" href="/login?role=teacher">
            <Dual ar="ادخل كمعلم" en="Enter as a teacher" />
            <ForwardIcon />
          </a>
        </div>
      </div>
    </AppShell>
  );
}
