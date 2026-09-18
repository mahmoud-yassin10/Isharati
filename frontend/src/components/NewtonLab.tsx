"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Minus, Plus, RotateCcw, Target } from "lucide-react";
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

/** Force is bidirectional: a push to the left is as valid as a push to the right. */
const MAX_F = 20;
const MIN_F = -MAX_F;
const MAX_M = 10;
const MIN_M = 0.5;
const MAX_A = 12;

const clampRange = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* graph plot area: origin (F=0, a=0) sits at the center so both directions show */
const GX0 = 30;
const GX1 = 288;
const GY0 = 176;
const GY1 = 16;
const GOX = (GX0 + GX1) / 2;
const GOY = (GY0 + GY1) / 2;
const gx = (f: number) => GOX + (clampRange(f, -MAX_F, MAX_F) / MAX_F) * ((GX1 - GX0) / 2);
const gy = (a: number) => GOY - (clampRange(a, -MAX_A, MAX_A) / MAX_A) * ((GY0 - GY1) / 2);

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
  const uid = useId().replace(/:/g, "");
  const trackRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ x: 0, v: 0, F: initialForce, m: initialMass, centered: false });
  const lastRef = useRef<number | null>(null);
  const metOnce = useRef(false);
  const onSnapshotRef = useRef(onSnapshot);
  const onChallengeMetRef = useRef(onChallengeMet);
  onSnapshotRef.current = onSnapshot;
  onChallengeMetRef.current = onChallengeMet;

  const accel = newtonAccel(force, mass);
  const goalValue = challenge?.value;
  const goalTolerance = challenge?.tolerance;
  /** Mass stays positive, so acceleration always shares the sign of force. */
  const reversed = force < 0;

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

  /** Centers the box on the track. Called once at mount and again on reset. */
  function centerCart() {
    const track = trackRef.current;
    const cart = cartRef.current;
    if (!track || !cart) return;
    const x = Math.max((track.clientWidth - cart.offsetWidth) / 2, 8);
    stateRef.current.x = x;
    stateRef.current.v = 0;
    stateRef.current.centered = true;
    cart.style.transform = `translateX(${x}px)`;
  }

  useEffect(() => {
    centerCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reduced) return;
    if (!stateRef.current.centered) centerCart();

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
    lastRef.current = null;
    centerCart();
  }

  const clampF = (value: number) => Math.round(clampRange(value, MIN_F, MAX_F) * 10) / 10;
  const clampM = (value: number) => Math.round(clampRange(value, MIN_M, MAX_M) * 10) / 10;

  const arrowWidth = 20 + (Math.abs(force) / MAX_F) * 70;
  const boxWidth = 52 + (mass / MAX_M) * 40;
  const boxHeight = 40 + (mass / MAX_M) * 30;
  const accelWidth = 18 + (Math.min(Math.abs(accel), MAX_A) / MAX_A) * 54;

  const slider = (
    kind: "force" | "mass",
    value: number,
    setValue: (fn: (v: number) => number) => void,
    set: (v: number) => void,
  ) => {
    const isForce = kind === "force";
    const min = isForce ? MIN_F : MIN_M;
    const max = isForce ? MAX_F : MAX_M;
    const stepBy = isForce ? 1 : 0.5;
    const clamp = isForce ? clampF : clampM;
    const id = `lab-${kind}-${uid}`;
    /** Force fills outward from zero in either direction; mass fills from its floor, as before. */
    const zero = isForce ? 0 : min;
    const zeroPct = ((zero - min) / (max - min)) * 100;
    const valPct = ((value - min) / (max - min)) * 100;
    const fillLo = Math.min(zeroPct, valPct);
    const fillHi = Math.max(zeroPct, valPct);
    return (
      <div className={`lab-control ${kind}`}>
        <label className="lab-control-label" htmlFor={id}>
          <span className="sym" lang="en">
            {isForce ? "F" : "m"}
          </span>
          <Dual ar={isForce ? "القوة" : "الكتلة"} en={isForce ? "Force" : "Mass"} />
          <output className="lab-control-value mono" htmlFor={id} lang="en">
            {value.toFixed(1)} {isForce ? "N" : "kg"}
          </output>
        </label>
        <div className="lab-control-row">
          <button
            type="button"
            className="step-btn"
            onClick={() => setValue((v) => clamp(v - stepBy))}
            aria-label={pick(lang, isForce ? "أنقص القوة" : "أنقص الكتلة", isForce ? "Decrease force" : "Decrease mass")}
          >
            <Minus size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={0.1}
            value={value}
            onChange={(event) => set(Number(event.target.value))}
            aria-valuetext={`${value.toFixed(1)} ${pick(lang, isForce ? "نيوتن" : "كيلوغرام", isForce ? "newtons" : "kilograms")}`}
            style={{
              ["--fill" as string]: `${valPct}%`,
              ["--fill-lo" as string]: `${fillLo}%`,
              ["--fill-hi" as string]: `${fillHi}%`,
            }}
          />
          <button
            type="button"
            className="step-btn"
            onClick={() => setValue((v) => clamp(v + stepBy))}
            aria-label={pick(lang, isForce ? "زد القوة" : "زد الكتلة", isForce ? "Increase force" : "Increase mass")}
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className={compact ? "lab compact" : "lab"} aria-label={pick(lang, "مختبر قانون نيوتن الثاني", "Newton's second law lab")}>
      <div className="lab-body">
      <div className="lab-main">
        <div className="equation" aria-live="polite">
          <p className="sr-only">
            {pick(
              lang,
              `التسارع ${accel.toFixed(2)} يساوي القوة ${force.toFixed(1)} مقسومة على الكتلة ${mass.toFixed(1)}`,
              `Acceleration ${accel.toFixed(2)} equals force ${force.toFixed(1)} divided by mass ${mass.toFixed(1)}`,
            )}
          </p>
          <div className="eq-row" aria-hidden="true">
            <span className="eq-term accel">
              <span className="eq-sym">a</span>
              <span className="eq-val mono">{accel.toFixed(2)}</span>
              <span className="eq-unit">m/s²</span>
              <Dual as="span" className="eq-name" ar="التسارع" en="acceleration" />
            </span>
            <span className="eq-op">=</span>
            <span className="eq-term force">
              <span className="eq-sym">F</span>
              <span className="eq-val mono">{force.toFixed(1)}</span>
              <span className="eq-unit">N</span>
              <Dual as="span" className="eq-name" ar="القوة" en="force" />
            </span>
            <span className="eq-op">÷</span>
            <span className="eq-term mass">
              <span className="eq-sym">m</span>
              <span className="eq-val mono">{mass.toFixed(1)}</span>
              <span className="eq-unit">kg</span>
              <Dual as="span" className="eq-name" ar="الكتلة" en="mass" />
            </span>
          </div>
          {challenge ? (
            <p className={met ? "lab-goal met" : "lab-goal"}>
              {met ? (
                <Check size={16} strokeWidth={2.5} className="icon" aria-hidden="true" />
              ) : (
                <Target size={16} strokeWidth={2} className="icon" aria-hidden="true" />
              )}
              <Dual
                ar={met ? `وصلت إلى الهدف: a ≈ ${challenge.value}` : `الهدف: اجعل a ≈ ${challenge.value}`}
                en={met ? `Goal reached: a ≈ ${challenge.value}` : `Goal: make a ≈ ${challenge.value}`}
              />
            </p>
          ) : null}
        </div>

        <div className="track" ref={trackRef}>
          {reduced ? (
            <span className="speed-tag">
              <Dual ar="الحركة متوقفة. الأرقام تعمل." en="Motion is off. The numbers still work." />
            </span>
          ) : null}
          <div ref={cartRef} className={reversed ? "cart reversed" : "cart"}>
            <span className={reversed ? "push-arrow mirrored" : "push-arrow"} style={{ width: `${arrowWidth}px` }} aria-hidden="true">
              <span className="arrow-tag">F</span>
            </span>
            <span className="mass-box" style={{ width: `${boxWidth}px`, height: `${boxHeight}px` }}>
              <span className="mono">m</span>
            </span>
            <span className={reversed ? "accel-arrow mirrored" : "accel-arrow"} style={{ width: `${accelWidth}px` }} aria-hidden="true">
              <span className="arrow-tag">a</span>
            </span>
          </div>
        </div>

        <div className="lab-controls">
          {slider("force", force, setForce, setForce)}
          {slider("mass", mass, setMass, setMass)}
        </div>
      </div>

      <div className="lab-side">
        {!compact ? (
          <figure className="graph">
            <Dual
              as="figcaption"
              ar="غيّر اتجاه القوة لترى الصندوق يتحرك يميناً أو يساراً."
              en="Change the force's direction to see the box move right or left."
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
              {[0.5, 1].map((f) => (
                <g key={f}>
                  <line className="grid-line" x1={GX0} y1={GOY - f * (GOY - GY1)} x2={GX1} y2={GOY - f * (GOY - GY1)} />
                  <line className="grid-line" x1={GX0} y1={GOY + f * (GY0 - GOY)} x2={GX1} y2={GOY + f * (GY0 - GOY)} />
                </g>
              ))}
              <line className="axis" x1={GX0} y1={GOY} x2={GX1} y2={GOY} />
              <line className="axis" x1={GOX} y1={GY0} x2={GOX} y2={GY1} />
              <text x={GOX} y={GOY + 14} textAnchor="middle">
                0
              </text>
              <text x={GX0 - 4} y={GOY + 4} textAnchor="start">
                −{MAX_F}
              </text>
              <text x={GX1} y={GOY + 18} textAnchor="end">
                {MAX_F} N
              </text>
              <text className="axis-label force" x={GX1} y={GOY - 8} textAnchor="end">
                F
              </text>
              <text className="axis-label accel" x={GOX + 8} y={GY1 + 4} textAnchor="start">
                a
              </text>
              {goalValue != null ? (
                <>
                  <line className="goal-line" x1={GX0} y1={gy(goalValue)} x2={GX1} y2={gy(goalValue)} />
                  <text x={GX1 - 2} y={gy(goalValue) - 6} textAnchor="end" className="goal-text">
                    {pick(lang, "الهدف", "goal")} {goalValue}
                  </text>
                </>
              ) : null}
              <line className="trend" x1={gx(-MAX_F)} y1={gy(newtonAccel(-MAX_F, mass))} x2={gx(MAX_F)} y2={gy(newtonAccel(MAX_F, mass))} />
              <circle className="now" cx={gx(force)} cy={gy(accel)} r="6" />
            </svg>
          </figure>
        ) : null}
        <button type="button" className="link-btn" onClick={resetMotion}>
          <RotateCcw size={15} strokeWidth={2} aria-hidden="true" />
          <Dual ar="أعد الصندوق إلى المنتصف" en="Put the box back in the middle" />
        </button>
      </div>
      </div>
    </section>
  );
}
