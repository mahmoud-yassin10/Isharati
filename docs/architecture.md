# Isharati architecture

Isharati is an AI tutor for people who communicate in Arabic / Egyptian sign language. The product has two apps in one repo: a Python inference API, and a website that will teach through that API.

## System

```text
                    website (frontend)
           learn · practice · translate
                          │
                          │  HTTP
                          ▼
                 FastAPI (backend)
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
   HF-SMCA model    pose.enc lexicon   OpenRouter
   502 sign classes  Cloudinary poses  Egyptian Arabic
          │
          ▼
       RTMPose
   (video keypoints)
```

The backend already translates in both directions. The website does not exist yet. The tutor product is a UI and lesson layer on top of these APIs, not a new model.

## Repo layout

```text
Isharati/
├── backend/                         run from this folder
│   ├── main.py                      FastAPI app + CORS
│   ├── api/routes/                  HTTP endpoints
│   ├── services/                    model, NLP, pose, video
│   ├── models/                      best_model.pt + label map
│   ├── pose.enc                     encrypted token → pose URL map
│   └── static/                      generated sample media
│
├── frontend/                        Next.js website (to be built)
│   └── src/
│       ├── lib/api.ts               typed client for the backend
│       └── features/
│           ├── learn/               lessons and curriculum
│           ├── practice/            student signs, tutor feedback
│           └── translate/           free-form translator
│
└── docs/architecture.md
```

Keep inference in `backend/`. Keep UI, accounts, and lessons in `frontend/`. Do not put React code inside the FastAPI tree, and do not load the `.pt` model in the browser.

## Backend (exists)

| Route | Used by | Flow |
|---|---|---|
| `POST /text-to-sign` | translate, learn | Arabic text → tokens → stitch poses → Cloudinary `.pose` URL |
| `POST /speech-to-text` | translate | Egyptian speech → text → same pose path |
| `GET /video/{request_id}` | translate, learn | `.pose` → H.264 MP4 stream |
| `POST /sign-to-text` | practice | clip(s) → RTMPose → HF-SMCA word(s) → optional Arabic sentence |
| `POST /sign-to-text/full-sentence-video` | practice | one continuous video, sliding windows |
| `GET /health` | website startup | API is up |

External services the API already depends on:

- **Cloudinary** — store generated `.pose` files
- **Google Speech Recognition** — `ar-EG` transcription
- **OpenRouter** — glosses → natural Egyptian Arabic
- **RTMPose / MMPose** — 133 whole-body keypoints from sign video

The website should treat these as backend details. The browser only talks to FastAPI.

## Frontend (to build)

Suggested stack: **Next.js + TypeScript + Tailwind**, Arabic RTL.

Three product surfaces, already stubbed as folders:

1. **Learn** — tutor shows a sign (`/text-to-sign` + `/video/{id}`), explains the word, next card.
2. **Practice** — webcam or upload, student signs, API returns the predicted word, compare to the target.
3. **Translate** — free-form text, speech, or sign in either direction.

Later, not in the API today: users, lesson progress, scoring history, live webcam WebSocket. First version can stay request/response (upload or short recorded clip).

## Tutor loop

```text
Learn                         Practice
─────                         ────────
pick a word                   show the target word
text-to-sign → play video     student records a clip
student watches               sign-to-text → predicted word
                              match? next word : retry
```

That is the whole v1 tutor. Curriculum data can start as a JSON list of label-map words in the frontend. No new training job is required.

## What stays out of v1

- Loading `best_model.pt` in the browser
- A second backend
- Real-time streaming recognition (the current API is upload-based)
- Replacing the skeleton animation with a 3D avatar (listed as future work in the original API)
