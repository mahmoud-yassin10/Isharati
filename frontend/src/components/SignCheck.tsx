"use client";

import { useRef, useState } from "react";
import { Dual } from "@/components/Dual";
import { signToText } from "@/lib/api";

function normalize(text: string) {
  return text.replace(/[\u064B-\u065F\u0670]/g, "").replace(/\s+/g, "").trim();
}

export function SignCheck({
  target,
  onResult,
}: {
  target: string;
  onResult: (predicted: string, matched: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [predicted, setPredicted] = useState<string | null>(null);
  const [matched, setMatched] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      setPredicted(word || "لا توجد كلمة");
      setMatched(ok);
      onResult(word, ok);
    } catch {
      setError("تعذر قراءة الفيديو. يمكنك المتابعة بعد المحاولة.");
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
      setError("لا يمكن فتح الكاميرا. ارفع ملفاً بدل ذلك.");
    }
  }

  function stopRecord() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="panel">
      <p>
        <Dual ar={`الهدف: ${target}`} en={`Target: ${target}`} />
      </p>
      <div className="role-actions">
        {recording ? (
          <button type="button" className="btn accent" onClick={stopRecord}>
            <Dual ar="أوقف التسجيل" en="Stop recording" />
          </button>
        ) : (
          <button type="button" className="btn" onClick={startRecord} disabled={busy}>
            <Dual ar="سجّل من الكاميرا" en="Record from camera" />
          </button>
        )}
        <label className="btn ghost">
          <Dual ar="ارفع فيديو" en="Upload video" />
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void submitFile(file);
            }}
          />
        </label>
      </div>
      {busy ? <Dual as="p" className="hint" ar="جارٍ التحليل…" en="Analyzing…" /> : null}
      {predicted ? (
        <p>
          <Dual ar="المقروء:" en="Read as:" /> <strong>{predicted}</strong>
          {matched ? (
            <Dual ar=" · مطابق" en=" · match" />
          ) : (
            <Dual ar=" · غير مطابق" en=" · not a match" />
          )}
        </p>
      ) : null}
      {error ? (
        <Dual
          as="p"
          className="error"
          ar={error}
          en={
            error.includes("الكاميرا")
              ? "Camera is not available. Upload a file instead."
              : "Could not read the video. You can continue after trying."
          }
        />
      ) : null}
    </div>
  );
}
