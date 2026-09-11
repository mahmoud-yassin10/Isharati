const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

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

export type SignToTextResponse = {
  req_id: string;
  status: string;
  raw_words: string[];
  raw_sentence: string;
  final_sentence: string;
};

export type FullSentenceResponse = SignToTextResponse & {
  mode: string;
  filename: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function health(): Promise<{ status: string }> {
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
