"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FlaskConical, Minus, Plus, RotateCcw, Target } from "lucide-react";
import { Dual } from "@/components/Dual";
import { useA11y } from "@/lib/a11y";
import { pick, useLang } from "@/lib/lang";
import { newtonAccel, withinGoal } from "@/lib/physics";

type Snapshot = { F: number; m: number; a: number };

type NewtonLabProps = {
  initialForce?: number;
  initialMass?: number;
  challenge?: { value: number; tolerance: number };
  /** Hides the graph. Used where the lab is a preview next to other content. */
  compact?: boolean;
  onSnapshot?: (snapshot: Snapshot) => void;
  onChallengeMet?: (snapshot: Snapshot) => void;
};

const MAX_F = 20;
const MIN_F = 1;
const MAX_M = 10;
const MIN_M = 0.5;
const MAX_A = 12;

/* graph plot area */
const GX0 = 44;
const GX1 = 288;
const GY0 = 172;
const GY1 = 22;
const gx = (f: number) => GX0 + (Math.min(f, MAX_F) / MAX_F) * (GX1 - GX0);
const gy = (a: number) => GY0 - (Math.min(a, MAX_A) / MAX_A) * (GY0 - GY1);

export function NewtonLab({
  initialForce = 10,
  initialMass = 2,
  challenge,
  compact = false,
  onSnapshot,
  onChallengeMet,
}: NewtonLabProps) {
  const { lang } = useLang();
  const { reduceMotion: preferStill } = useA11y();
  const [force, setForce] = useState(initialForce);
  const [mass, setMass] = useState(initialMass);
  const [reduced, setReduced] = useState(false);
  const [met, setMet] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ x: 16, v: 0, F: initialForce, m: initialMass });
  const lastRef = useRef<number | null>(null);
  const metOnce = useRef(false);
  const onSnapshotRef = useRef(onSnapshot);
  const onChallengeMetRef = useRef(onChallengeMet);
  onSnapshotRef.current = onSnapshot;
  onChallengeMetRef.current = onChallengeMet;

  const accel = newtonAccel(force, mass);
  const goalValue = challenge?.value;
  const goalTolerance = challenge?.tolerance;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches || preferStill);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [preferStill]);

  useEffect(() => {
    stateRef.current.F = force;
    stateRef.current.m = mass;
    const snapshot: Snapshot = { F: force, m: mass, a: accel };
    onSnapshotRef.current?.(snapshot);
    if (goalValue != null && goalTolerance != null) {
      if (withinGoal(accel, goalValue, goalTolerance)) {
        if (!metOnce.current) {
          metOnce.current = true;
          setMet(true);
          onChallengeMetRef.current?.(snapshot);
        }
      } else {
        metOnce.current = false;
        setMet(false);
      }
    }
  }, [force, mass, accel, goalValue, goalTolerance]);

  useEffect(() => {
    if (reduced) return;

    let frame = 0;
    const tick = (now: number) => {
      const last = lastRef.current ?? now;
      const dt = Math.min((now - last) / 1000, 0.05);
      lastRef.current = now;
      const track = trackRef.current;
      const cart = cartRef.current;
      if (track && cart) {
        const max = Math.max(track.clientWidth - cart.offsetWidth - 8, 8);
        const a = newtonAccel(stateRef.current.F, stateRef.current.m);
        stateRef.current.v += a * dt;
        stateRef.current.x += stateRef.current.v * dt * 28;
        if (stateRef.current.x < 8) {
          stateRef.current.x = 8;
          stateRef.current.v = 0;
        }
        if (stateRef.current.x > max) {
          stateRef.current.x = max;
          stateRef.current.v = 0;
        }
        cart.style.transform = `translateX(${stateRef.current.x}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  function resetMotion() {
    stateRef.current.x = 16;
    stateRef.current.v = 0;
    lastRef.current = null;
    if (cartRef.current) cartRef.current.style.transform = "translateX(16px)";
  }

  const clampF = (value: number) => Math.min(MAX_F, Math.max(MIN_F, Math.round(value * 10) / 10));
  const clampM = (value: number) => Math.min(MAX_M, Math.max(MIN_M, Math.round(value * 10) / 10));

  const arrowWidth = 20 + (force / MAX_F) * 70;
  const boxWidth = 52 + (mass / MAX_M) * 40;
  const boxHeight = 40 + (mass / MAX_M) * 30;
  const accelWidth = 18 + (Math.min(accel, MAX_A) / MAX_A) * 54;

  return (
    <section className="lab" aria-label={pick(lang, "مختبر نيوتن", "Newton lab")}>
      <div className="lab-head">
        <div className="lab-title">
          <h3>
            <FlaskConical size={22} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual ar="المختبر" en="The lab" />
          </h3>
          <Dual as="p" className="lab-sub" ar="قانون نيوتن الثاني" en="Newton's second law" />
        </div>
        {challenge ? (
          <p className={met ? "chip goal-chip met" : "chip goal-chip"}>
            {met ? (
              <Check size={16} strokeWidth={2.5} className="icon" aria-hidden="true" />
            ) : (
              <Target size={16} strokeWidth={2} className="icon" aria-hidden="true" />
            )}
            <Dual
              ar={met ? `وصلت: a ≈ ${challenge.value}` : `الهدف: a ≈ ${challenge.value}`}
              en={met ? `Reached: a ≈ ${challenge.value}` : `Goal: a ≈ ${challenge.value}`}
            />
          </p>
        ) : null}
      </div>

      <ul className="lab-legend">
        <li>
          <span className="rel-swatch force" aria-hidden="true" />
          <Dual as="strong" ar="قوة F" en="Force F" />
          <Dual as="span" ar="تدفع الصندوق" en="pushes the box" />
        </li>
        <li>
          <span className="rel-swatch mass" aria-hidden="true" />
          <Dual as="strong" ar="كتلة m" en="Mass m" />
          <Dual as="span" ar="تقاوم الحركة" en="resists motion" />
        </li>
        <li>
          <span className="rel-swatch accel" aria-hidden="true" />
          <Dual as="strong" ar="تسارع a" en="Acceleration a" />
          <Dual as="span" ar="النتيجة" en="the result" />
        </li>
      </ul>

      <div className="readout" aria-live="polite">
        <div className="readout-cell force">
          <span className="label">
            <Dual ar="قوة F" en="Force F" />
          </span>
          <span className="value">{force.toFixed(1)} N</span>
        </div>
        <div className="readout-cell mass">
          <span className="label">
            <Dual ar="كتلة m" en="Mass m" />
          </span>
          <span className="value">{mass.toFixed(1)} kg</span>
        </div>
        <div className="readout-cell accel">
          <span className="label">
            <Dual ar="تسارع a" en="Acceleration a" />
          </span>
          <span className="value">{accel.toFixed(2)} m/s²</span>
        </div>
      </div>

      <p className="formula">
        <b>a</b> = <b>F</b> ÷ <b>m</b> = {force.toFixed(1)} ÷ {mass.toFixed(1)} = {accel.toFixed(2)}
      </p>

      <div className="track" ref={trackRef}>
        {reduced ? (
          <span className="speed-tag">
            <Dual ar="الحركة موقوفة" en="Motion is off" />
          </span>
        ) : null}
        <div
          ref={cartRef}
          className="cart"
          style={reduced ? { transform: "translateX(16px)" } : undefined}
        >
          <span className="cart-label">
            {pick(lang, "قوة", "Force")} F = {force.toFixed(1)} N
          </span>
          <div className="push-arrow" style={{ width: `${arrowWidth}px` }} />
          <div className="mass-box" style={{ width: `${boxWidth}px`, height: `${boxHeight}px` }}>
            <Dual ar="كتلة" en="Mass" />
            <strong>{mass.toFixed(1)} kg</strong>
          </div>
          <span className="accel-arrow" style={{ width: `${accelWidth}px` }} aria-hidden="true" />
        </div>
      </div>

      <div className="lab-controls">
        <div className="slider force">
          <label className="slider-top" htmlFor="lab-force">
            <span>
              <span className="swatch" style={{ background: "var(--force)" }} aria-hidden="true" />
              <Dual ar="القوة F" en="Force F" />
            </span>
            <span className="val">{force.toFixed(1)} N</span>
          </label>
          <div className="slider-row">
            <button
              type="button"
              className="step-btn"
              onClick={() => setForce((v) => clampF(v - 1))}
              aria-label={pick(lang, "أنقص القوة", "Decrease force")}
            >
              <Minus size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <input
              id="lab-force"
              type="range"
              min={MIN_F}
              max={MAX_F}
              step={0.1}
              value={force}
              onChange={(event) => setForce(Number(event.target.value))}
              aria-valuetext={`${force.toFixed(1)} ${pick(lang, "نيوتن", "newtons")}`}
              style={{ ["--fill" as string]: `${((force - MIN_F) / (MAX_F - MIN_F)) * 100}%` }}
            />
            <button
              type="button"
              className="step-btn"
              onClick={() => setForce((v) => clampF(v + 1))}
              aria-label={pick(lang, "زد القوة", "Increase force")}
            >
              <Plus size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="slider mass">
          <label className="slider-top" htmlFor="lab-mass">
            <span>
              <span className="swatch" style={{ background: "var(--mass)" }} aria-hidden="true" />
              <Dual ar="الكتلة m" en="Mass m" />
            </span>
            <span className="val">{mass.toFixed(1)} kg</span>
          </label>
          <div className="slider-row">
            <button
              type="button"
              className="step-btn"
              onClick={() => setMass((v) => clampM(v - 0.5))}
              aria-label={pick(lang, "أنقص الكتلة", "Decrease mass")}
            >
              <Minus size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <input
              id="lab-mass"
              type="range"
              min={MIN_M}
              max={MAX_M}
              step={0.1}
              value={mass}
              onChange={(event) => setMass(Number(event.target.value))}
              aria-valuetext={`${mass.toFixed(1)} ${pick(lang, "كيلوغرام", "kilograms")}`}
              style={{ ["--fill" as string]: `${((mass - MIN_M) / (MAX_M - MIN_M)) * 100}%` }}
            />
            <button
              type="button"
              className="step-btn"
              onClick={() => setMass((v) => clampM(v + 0.5))}
              aria-label={pick(lang, "زد الكتلة", "Increase mass")}
            >
              <Plus size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="lab-foot">
        {!compact ? (
          <figure className="graph">
            <Dual
              as="figcaption"
              ar="كل زيادة في القوة ترفع التسارع. الكتلة الأكبر تخفض الميل."
              en="More force raises acceleration. More mass lowers the slope."
            />
            <svg
              viewBox="0 0 300 200"
              role="img"
              aria-label={pick(
                lang,
                `رسم القوة والتسارع. التسارع الحالي ${accel.toFixed(2)} متر لكل ثانية مربعة`,
                `Force against acceleration. Current a is ${accel.toFixed(2)} meters per second squared`,
              )}
            >
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <line key={f} className="grid-line" x1={GX0} y1={GY0 - f * (GY0 - GY1)} x2={GX1} y2={GY0 - f * (GY0 - GY1)} />
              ))}
              <line className="axis" x1={GX0} y1={GY0} x2={GX1} y2={GY0} />
              <line className="axis" x1={GX0} y1={GY0} x2={GX0} y2={GY1} />
              <text x={GX0 - 8} y={GY0 + 5} textAnchor="end">
                0
              </text>
              <text x={GX0 - 8} y={GY1 + 10} textAnchor="end">
                {MAX_A}
              </text>
              <text x={GX1} y={GY0 + 18} textAnchor="end">
                {MAX_F} N
              </text>
              <text className="axis-label" x={GX1} y={GY1 + 2} textAnchor="end">
                {pick(lang, "القوة F ←", "Force F →")}
              </text>
              <text className="axis-label" x={GX0 - 8} y={GY1 - 8} textAnchor="start">
                a
              </text>
              {goalValue != null ? (
                <>
                  <line className="goal-line" x1={GX0} y1={gy(goalValue)} x2={GX1} y2={gy(goalValue)} />
                  <text x={GX1 - 2} y={gy(goalValue) - 6} textAnchor="end" fill="var(--accel-ink)">
                    {pick(lang, "الهدف", "Goal")} {goalValue}
                  </text>
                </>
              ) : null}
              <line className="trend" x1={GX0} y1={GY0} x2={gx(MAX_F)} y2={gy(newtonAccel(MAX_F, mass))} />
              <circle className="now" cx={gx(force)} cy={gy(accel)} r="7" />
            </svg>
          </figure>
        ) : (
          <p className="muted small">
            <Dual
              ar="حرّك القوة أو الكتلة وراقب الصندوق."
              en="Move force or mass and watch the box."
            />
          </p>
        )}
        <button type="button" className="btn secondary" onClick={resetMotion}>
          <RotateCcw size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
          <Dual ar="أعد الصندوق" en="Reset the box" />
        </button>
      </div>
    </section>
  );
}
