"use client";

import { useEffect, useState } from "react";
import { Hand, Play, RotateCcw, SpellCheck2 } from "lucide-react";
import { Dual } from "@/components/Dual";
import { useA11y } from "@/lib/a11y";
import { textToSign, videoUrl } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import type { GlossaryEntry } from "@/lib/types";

export function SignPanel({
  termAr,
  termEn,
  mode,
  playAr,
}: {
  termAr: string;
  termEn?: string;
  mode: "lexicon" | "fingerspell" | "none";
  playAr?: string;
}) {
  const { autoSign, signSpeed, reduceMotion } = useA11y();
  const { lang } = useLang();
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(autoSign);
  const playback = playAr ?? termAr;

  useEffect(() => {
    setRequested(autoSign);
  }, [autoSign, playback, mode]);

  useEffect(() => {
    let cancelled = false;
    async function play() {
      if (mode === "none" || !requested) return;
      setLoading(true);
      setFailed(false);
      setSrc(null);
      try {
        const sentence = mode === "fingerspell" ? Array.from(playback).join(" ") : playback;
        const result = await textToSign(sentence);
        if (cancelled) return;
        if (result.success && result.request_id) {
          setSrc(videoUrl(result.request_id));
        } else {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void play();
    return () => {
      cancelled = true;
    };
  }, [playback, mode, requested]);

  const fingerspelled = mode === "fingerspell";

  return (
    <figure className="sign-card">
      <div className="sign-stage">
        {src ? (
          <video
            key={src}
            src={src}
            controls
            autoPlay={!reduceMotion}
            loop={!reduceMotion}
            muted
            playsInline
            onLoadedMetadata={(event) => {
              event.currentTarget.playbackRate = signSpeed;
            }}
            aria-label={`${pick(lang, "إشارة", "Sign for")} ${termAr}`}
          />
        ) : (
          <div className="sign-placeholder">
            <Hand size={40} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <span className="word" lang="ar">
              {termAr}
            </span>
            <span className="small">
              {loading ? (
                <Dual ar="جارٍ تحضير الإشارة…" en="Preparing the sign…" />
              ) : failed ? (
                <Dual ar="الفيديو غير متاح. اقرأ الكلمة." en="Video unavailable. Read the word." />
              ) : (
                <Dual ar="اضغط لعرض الإشارة." en="Press to show the sign." />
              )}
            </span>
          </div>
        )}
      </div>

      <figcaption className="sign-caption">
        <span className="term" lang="ar">
          {termAr}
          {termEn ? <span className="term-sub">{termEn}</span> : null}
        </span>
        <span className="chip sign">
          {fingerspelled ? (
            <SpellCheck2 size={16} strokeWidth={2} className="icon" aria-hidden="true" />
          ) : (
            <Hand size={16} strokeWidth={2} className="icon" aria-hidden="true" />
          )}
          <Dual
            ar={fingerspelled ? "تُهجّى حرفاً حرفاً" : "إشارة من المعجم"}
            en={fingerspelled ? "Fingerspelled" : "Lexicon sign"}
          />
        </span>
      </figcaption>

      <div className="sign-actions">
        {src ? (
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setRequested(false);
              window.setTimeout(() => setRequested(true), 0);
            }}
          >
            <RotateCcw size={18} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual ar="أعد الإشارة" en="Replay sign" />
          </button>
        ) : (
          <button type="button" className="btn sign" onClick={() => setRequested(true)} disabled={loading}>
            <Play size={18} strokeWidth={2} className="icon flip-rtl" aria-hidden="true" />
            <Dual ar="اعرض الإشارة" en="Show the sign" />
          </button>
        )}
      </div>
    </figure>
  );
}

export function SignPanels({ entries }: { entries: GlossaryEntry[] }) {
  const visible = entries.filter((entry) => entry.esl_mode !== "none");
  if (visible.length === 0) return null;
  return (
    <div className="sign-grid">
      {visible.map((entry) => (
        <SignPanel
          key={`${entry.term_ar}-${entry.lexicon_token ?? ""}`}
          termAr={entry.term_ar}
          termEn={entry.term_en}
          playAr={entry.lexicon_token ?? entry.term_ar}
          mode={entry.esl_mode}
        />
      ))}
    </div>
  );
}
