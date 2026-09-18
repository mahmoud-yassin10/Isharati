"use client";

import { useRef, useState } from "react";
import { Camera, Check, SkipForward, Square, TriangleAlert, Upload, X } from "lucide-react";
import { Dual } from "@/components/Dual";
import { signToText } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";

function normalize(text: string) {
  return text.replace(/[ً-ٰٟ]/g, "").replace(/\s+/g, "").trim();
}

export function SignCheck({
  target,
  onResult,
}: {
  target: string;
  onResult: (predicted: string, matched: boolean) => void;
}) {
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);
  const [predicted, setPredicted] = useState<string | null>(null);
  const [matched, setMatched] = useState<boolean | null>(null);
  const [unsure, setUnsure] = useState(false);
  const [error, setError] = useState<"camera" | "read" | null>(null);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function submitFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const result = await signToText([file], false);
      const word = result.raw_words[0] || result.final_sentence || "";
      const ok = normalize(word) === normalize(target) || word.includes(target);
      const tier = result.predictions?.[0]?.confidence_tier ?? "high";
      setPredicted(word || pick(lang, "لا توجد كلمة", "no word"));
      setMatched(ok);
      setUnsure(!ok && tier === "low");
      onResult(word, ok);
    } catch {
      setError("read");
      onResult("", false);
    } finally {
      setBusy(false);
    }
  }

  async function startRecord() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const file = new File([blob], "sign.webm", { type: blob.type });
        void submitFile(file);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("camera");
    }
  }

  function stopRecord() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="panel stack-sm">
      <div className={`camera-stage${recording ? " recording" : ""}`}>
        {recording ? (
          <>
            <span className="rec-dot" aria-hidden="true" />
            <Dual as="p" ar="أشِر الكلمة الآن، ثم أوقف التسجيل." en="Sign the word now, then stop recording." />
          </>
        ) : (
          <>
            <Camera size={36} strokeWidth={1.5} className="icon" aria-hidden="true" />
            <Dual as="p" ar="أشِر هذه الكلمة أمام الكاميرا:" en="Sign this word to the camera:" />
            <p className="target-word" lang="ar">
              {target}
            </p>
          </>
        )}
      </div>

      <div className="btn-row">
        {recording ? (
          <button type="button" className="btn danger" onClick={stopRecord}>
            <Square size={20} strokeWidth={2} className="icon" aria-hidden="true" />
            <Dual ar="أوقف التسجيل" en="Stop recording" />
          </button>
        ) : (
          <button type="button" className="btn" onClick={startRecord} disabled={busy}>
            <Camera size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
            <Dual ar="سجّل بالكاميرا" en="Record with camera" />
          </button>
        )}
        <label className="btn secondary file-btn">
          <Upload size={20} strokeWidth={1.75} className="icon" aria-hidden="true" />
          <Dual ar="ارفع فيديو" en="Upload a video" />
          <input
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void submitFile(file);
            }}
          />
        </label>
        <button
          type="button"
          className="btn quiet"
          onClick={() => {
            setMatched(false);
            onResult("", false);
          }}
        >
          <SkipForward size={20} strokeWidth={1.75} className="icon flip-rtl" aria-hidden="true" />
          <Dual ar="تخطَّ هذه الخطوة" en="Skip this step" />
        </button>
      </div>

      {busy ? (
        <p className="feedback info" role="status">
          <Dual ar="جارٍ قراءة الفيديو…" en="Reading the video…" />
        </p>
      ) : null}

      {predicted && matched ? (
        <p className="feedback ok" role="status">
          <Check size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual ar={`قرأنا: ${predicted} · أحسنت.`} en={`We read: ${predicted} · well done.`} />
        </p>
      ) : null}

      {predicted && !matched ? (
        <p className="feedback error" role="status">
          <X size={22} strokeWidth={2.5} className="icon" aria-hidden="true" />
          <Dual
            ar={unsure ? `قرأنا: ${predicted}. لم نتأكد، حاول مرة أخرى.` : `قرأنا: ${predicted}. حاول مرة أخرى.`}
            en={unsure ? `We read: ${predicted}. Not sure, try again.` : `We read: ${predicted}. Try again.`}
          />
        </p>
      ) : null}

      {error ? (
        <p className="feedback error" role="status">
          <TriangleAlert size={22} strokeWidth={2} className="icon" aria-hidden="true" />
          <Dual
            ar={error === "camera" ? "الكاميرا غير متاحة. ارفع فيديو بدلاً منها." : "تعذّر قراءة الفيديو. حاول مرة أخرى أو تخطَّ."}
            en={error === "camera" ? "The camera is unavailable. Upload a video instead." : "Could not read the video. Try again or skip."}
          />
        </p>
      ) : null}
    </div>
  );
}
