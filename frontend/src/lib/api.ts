import type { Lesson, ProgressItem, StepSnapshot, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "raqeeb_token";

export type TextToSignResponse = {
  success: boolean;
  request_id?: string;
  pose_URL?: string;
  tokens?: string[];
  message?: string;
};

export type SpeechToSignResponse = TextToSignResponse & {
  sentence?: string;
};

export type SignPrediction = {
  order: number;
  filename: string;
  word: string;
  confidence_tier: "high" | "low";
};

export type SignToTextResponse = {
  req_id: string;
  status: string;
  raw_words: string[];
  raw_sentence: string;
  final_sentence: string;
  predictions?: SignPrediction[];
};

export type FullSentenceResponse = SignToTextResponse & {
  mode: string;
  filename: string;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getToken();
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function health(): Promise<{
  status: string;
  service?: string;
  pose_count?: number;
  routes?: Record<string, boolean>;
}> {
  const response = await fetch(`${API_URL}/health`);
  return parseJson(response);
}

export async function textToSign(sentence: string, requestId?: string) {
  const response = await fetch(`${API_URL}/text-to-sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentence, request_id: requestId }),
  });
  return parseJson<TextToSignResponse>(response);
}

export async function speechToSign(audio: File, requestId?: string) {
  const body = new FormData();
  body.append("audio", audio);
  if (requestId) body.append("request_id", requestId);
  const response = await fetch(`${API_URL}/speech-to-text`, {
    method: "POST",
    body,
  });
  return parseJson<SpeechToSignResponse>(response);
}

export function videoUrl(requestId: string) {
  return `${API_URL}/video/${requestId}`;
}

export async function signToText(files: File[], useNlp = true) {
  const body = new FormData();
  for (const file of files) body.append("files", file);
  body.append("use_nlp", String(useNlp));
  const response = await fetch(`${API_URL}/sign-to-text`, {
    method: "POST",
    body,
  });
  return parseJson<SignToTextResponse>(response);
}

export async function fullSentenceVideo(file: File, useNlp = true) {
  const body = new FormData();
  body.append("file", file);
  body.append("use_nlp", String(useNlp));
  const response = await fetch(`${API_URL}/sign-to-text/full-sentence-video`, {
    method: "POST",
    body,
  });
  return parseJson<FullSentenceResponse>(response);
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<{ token: string; user: User }>(response);
  setToken(data.token);
  return data.user;
}

export async function me() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  });
  return parseJson<User>(response);
}

export async function listLessons() {
  const response = await fetch(`${API_URL}/lessons`, {
    headers: authHeaders(),
  });
  return parseJson<Lesson[]>(response);
}

export async function getLesson(id: string) {
  const response = await fetch(`${API_URL}/lessons/${id}`, {
    headers: authHeaders(),
  });
  return parseJson<Lesson>(response);
}

export async function publishLesson(id: string) {
  const response = await fetch(`${API_URL}/lessons/${id}/publish`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseJson<Lesson>(response);
}

export async function assignLesson(id: string) {
  const response = await fetch(`${API_URL}/lessons/${id}/assign`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseJson<{ ok: boolean; student_id: string; student_name: string }>(response);
}

export async function lessonProgress(id: string) {
  const response = await fetch(`${API_URL}/lessons/${id}/progress`, {
    headers: authHeaders(),
  });
  return parseJson<ProgressItem[]>(response);
}

export async function saveProgress(payload: {
  lesson_id: string;
  step_id: string;
  status: string;
  sim_snapshot?: StepSnapshot;
  predicted_sign?: string;
}) {
  const response = await fetch(`${API_URL}/progress`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return parseJson<{ ok: boolean }>(response);
}

/** Deletes every progress row for the signed-in student. */
export async function resetProgress() {
  const response = await fetch(`${API_URL}/progress`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseJson<{ ok: boolean; deleted: number }>(response);
}

export function logout() {
  setToken(null);
}
