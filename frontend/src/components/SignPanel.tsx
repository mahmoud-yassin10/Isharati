"use client";

import { useEffect, useState } from "react";
import { Dual } from "@/components/Dual";
import { useA11y } from "@/lib/a11y";
import { textToSign, videoUrl } from "@/lib/api";
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
  const [src, setSrc] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
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
      setNote(null);
      setSrc(null);
      try {
        const sentence = mode === "fingerspell" ? Array.from(playback).join(" ") : playback;
        const result = await textToSign(sentence);
        if (cancelled) return;
        if (result.success && result.request_id) {
          setSrc(videoUrl(result.request_id));
        } else {
          setNote(result.message || "تعذر توليد الإشارة.");
        }
      } catch {
        if (!cancelled) {
          setNote("Sign video is not ready yet. Read the word on screen.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void play();
    return () => {
      cancelled = true;
    };
  }, [playback, mode, requested]);

  return (
    <figure className="panel sign-panel">
      <Dual as="p" className="term-display" ar={termAr} en={termEn ?? termAr} />
      <p className="sign-caption" lang="ar">
        {termAr}
        {mode === "fingerspell" ? " · تهجئة" : " · معجم"}
      </p>
      {mode === "fingerspell" ? (
        <Dual ar="هذه الكلمة تُهجّى حرفاً حرفاً." en="This word is fingerspelled letter by letter." as="p" className="hint" />
      ) : null}
      {loading ? <Dual ar="جارٍ عرض الإشارة…" en="Showing the sign…" as="p" className="hint" /> : null}
      {src ? (
        <video
          className="sign-video"
          src={src}
          controls
          autoPlay={!reduceMotion}
          loop={!reduceMotion}
          muted
          playsInline
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = signSpeed;
          }}
          aria-label={`${termAr} ${termEn ?? ""}`}
        />
      ) : null}
      {!requested && mode !== "none" ? (
        <button type="button" className="btn ghost" onClick={() => setRequested(true)}>
          <Dual ar="اعرض الإشارة" en="Show the sign" />
        </button>
      ) : null}
      {src ? (
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setRequested(false);
            window.setTimeout(() => setRequested(true), 0);
          }}
        >
          <Dual ar="أعد الإشارة" en="Replay sign" />
        </button>
      ) : null}
      {note ? (
        <Dual ar="اقرأ الكلمة على الشاشة إن لم يظهر الفيديو." en={note} as="p" className="hint" />
      ) : null}
    </figure>
  );
}

export function SignPanels({ entries }: { entries: GlossaryEntry[] }) {
  return (
    <>
      {entries
        .filter((entry) => entry.esl_mode !== "none")
        .map((entry) => (
          <SignPanel
            key={`${entry.term_ar}-${entry.lexicon_token ?? ""}`}
            termAr={entry.term_ar}
            termEn={entry.term_en}
            playAr={entry.lexicon_token ?? entry.term_ar}
            mode={entry.esl_mode}
          />
        ))}
    </>
  );
}
