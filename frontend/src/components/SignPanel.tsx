"use client";

import { useEffect, useState } from "react";
import { Dual } from "@/components/Dual";
import { textToSign, videoUrl } from "@/lib/api";

export function SignPanel({
  termAr,
  termEn,
  mode,
}: {
  termAr: string;
  termEn?: string;
  mode: "lexicon" | "fingerspell" | "none";
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function play() {
      if (mode === "none") return;
      setLoading(true);
      setNote(null);
      setSrc(null);
      try {
        const sentence = mode === "fingerspell" ? Array.from(termAr).join(" ") : termAr;
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
  }, [termAr, mode]);

  return (
    <div className="panel sign-panel">
      <Dual as="p" className="term-display" ar={termAr} en={termEn ?? termAr} />
      {mode === "fingerspell" ? (
        <Dual ar="هذه الكلمة تُهجّى حرفاً حرفاً." en="This word is fingerspelled letter by letter." as="p" className="hint" />
      ) : null}
      {loading ? <Dual ar="جارٍ عرض الإشارة…" en="Showing the sign…" as="p" className="hint" /> : null}
      {src ? (
        <video
          className="sign-video"
          src={src}
          controls
          autoPlay
          loop
          muted
          playsInline
          aria-label={`${termAr} ${termEn ?? ""}`}
        />
      ) : null}
      {note ? (
        <Dual ar="اقرأ الكلمة على الشاشة إن لم يظهر الفيديو." en={note} as="p" className="hint" />
      ) : null}
    </div>
  );
}
