"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Dual } from "@/components/Dual";
import { useA11y } from "@/lib/a11y";
import { textToSign, videoUrl } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";
import type { GlossaryEntry } from "@/lib/types";

/** Fetches the rendered sign video for a word and tracks its loading state. */
function useSignVideo(playback: string, mode: "lexicon" | "fingerspell" | "none") {
  const { autoSign } = useA11y();
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(autoSign);

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
        if (result.success && result.request_id) setSrc(videoUrl(result.request_id));
        else setFailed(true);
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

  function replay() {
    setRequested(false);
    window.setTimeout(() => setRequested(true), 0);
  }

  return { src, failed, loading, requested, show: () => setRequested(true), replay };
}

function SignVideo({ src, termAr }: { src: string; termAr: string }) {
  const { signSpeed, reduceMotion } = useA11y();
  const { lang } = useLang();
  return (
    <video
      key={src}
      src={src}
      // With motion reduced the sign never autoplays, so hand the student the player controls.
      controls={reduceMotion}
      autoPlay={!reduceMotion}
      loop={!reduceMotion}
      muted
      playsInline
      onLoadedMetadata={(event) => {
        event.currentTarget.playbackRate = signSpeed;
      }}
      onClick={(event) => {
        const video = event.currentTarget;
        if (video.paused) void video.play();
        else video.pause();
      }}
      aria-label={`${pick(lang, "إشارة", "Sign for")} ${termAr}`}
    />
  );
}

export function SignPanel({
  termAr,
  termEn,
  mode,
  playAr,
  variant = "card",
}: {
  termAr: string;
  termEn?: string;
  mode: "lexicon" | "fingerspell" | "none";
  playAr?: string;
  /** "specimen": the bare interpreter, used where the word is set beside it. */
  variant?: "card" | "specimen";
}) {
  const video = useSignVideo(playAr ?? termAr, mode);
  const fingerspelled = mode === "fingerspell";

  const stage = (
    <div className="sign-stage">
      {video.src ? (
        <SignVideo src={video.src} termAr={termAr} />
      ) : (
        <div className="sign-placeholder">
          <span className="word" lang="ar">
            {termAr}
          </span>
          <span className="small">
            {video.loading ? (
              <Dual ar="جارٍ تحضير الإشارة…" en="Preparing the sign…" />
            ) : video.failed ? (
              <Dual ar="الفيديو غير متاح الآن." en="Video unavailable right now." />
            ) : null}
          </span>
        </div>
      )}
    </div>
  );

  const action = video.src ? (
    <button type="button" className="link-btn" onClick={video.replay}>
      <RotateCcw size={15} strokeWidth={2} aria-hidden="true" />
      <Dual ar="أعد الإشارة" en="Replay" />
    </button>
  ) : !video.loading ? (
    <button type="button" className="link-btn" onClick={video.show}>
      <Play size={15} strokeWidth={2} className="flip-rtl" aria-hidden="true" />
      <Dual ar="اعرض الإشارة" en="Show the sign" />
    </button>
  ) : null;

  if (variant === "specimen") {
    return (
      <figure className="sign-specimen">
        {stage}
        <figcaption>{action}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="sign-card">
      {stage}
      <figcaption className="sign-caption">
        <span className="term" lang="ar">
          {termAr}
        </span>
        <span className="sign-meta">
          {termEn ? <span lang="en">{termEn}</span> : null}
          <Dual
            ar={fingerspelled ? "تُهجّى حرفاً حرفاً" : "إشارة من المعجم"}
            en={fingerspelled ? "fingerspelled" : "dictionary sign"}
          />
        </span>
        {action}
      </figcaption>
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
