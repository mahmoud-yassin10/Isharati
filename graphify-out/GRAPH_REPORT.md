# Graph Report - Isharati  (2026-09-13)

## Corpus Check
- 61 files · ~28,939 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 527 nodes · 986 edges · 23 communities (20 shown, 2 thin omitted)
- Extraction: 93% EXTRACTED · 6% INFERRED · 1% AMBIGUOUS · INFERRED: 60 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5fe8fa42`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- video_processor.py
- .__init__
- config.py
- Isharati FastAPI Backend
- text_to_sign.py
- arabic_normalizer.py
- POST /text-to-sign
- Text/Speech to Sign
- api.ts
- lessons.py
- pose-anonymization
- File map
- package.json
- compilerOptions
- POST /sign-to-text
- Website Frontend
- Backend
- Product
- Isharati Website
- Design
- Google Speech Recognition
- next-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `make_10A_features_from_64_raw()` - 16 edges
2. `compilerOptions` - 16 edges
3. `File map` - 15 edges
4. `clean_text()` - 13 edges
5. `predict_full_sentence_video()` - 13 edges
6. `parseJson()` - 13 edges
7. `ArabicNormalizer` - 12 edges
8. `preprocess_video()` - 12 edges
9. `Dual()` - 12 edges
10. `useUser()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Video Processor` --calls--> `RTMPose`  [AMBIGUOUS]
  backend/README.md → docs/architecture.md
- `POST /sign-to-text` --conceptually_related_to--> `POST /sign-to-text`  [INFERRED]
  backend/README.md → docs/architecture.md
- `pose.enc Lexicon` --shares_data_with--> `poses.json`  [AMBIGUOUS]
  docs/architecture.md → backend/README.md
- `Deep Learning Sign Recognition` --implements--> `HF-SMCA Model`  [AMBIGUOUS]
  backend/README.md → docs/architecture.md
- `mediapipe` --conceptually_related_to--> `RTMPose`  [AMBIGUOUS]
  backend/requirements.txt → docs/architecture.md

## Import Cycles
- None detected.

## Communities (23 total, 2 thin omitted)

### Community 0 - "video_processor.py"
Cohesion: 0.08
Nodes (48): body_normalize_keypoints(), build_aux_v3(), build_dominant_hand_view(), build_motion_aux(), build_rtmpose_inferencer(), build_windows(), choose_best_person_instance(), compute_hand_center_and_scale() (+40 more)

### Community 1 - ".__init__"
Cohesion: 0.10
Nodes (12): AuxReliabilityBranch, FourWayGatedFusion, GraphConvLayer, GraphFrameEncoder, HandBodyCrossAttentionBranch, HFSMCAHybridModel, MaskedAttentionPooling, MultiScaleTCNBlock (+4 more)

### Community 2 - "config.py"
Cohesion: 0.08
Nodes (38): full_sentence_video_endpoint(), Path, post, UploadFile, save_full_sentence_upload(), Path, post, UploadFile (+30 more)

### Community 3 - "Isharati FastAPI Backend"
Cohesion: 0.12
Nodes (18): Arabic NLP, best_model.pt, Computer Vision, Egyptian Arabic, POST /sign-to-text/full-sentence-video, POST /sign-to-text, Isharati FastAPI Backend, Full Sentence Video Service (+10 more)

### Community 4 - "text_to_sign.py"
Cohesion: 0.09
Nodes (17): post, UploadFile, speech_to_text(), get_normalizer(), Path, post, save_pose(), text_to_sign() (+9 more)

### Community 5 - "arabic_normalizer.py"
Cohesion: 0.12
Nodes (19): PoseLoader, all_tokens_are_single_letters(), ArabicNormalizer, clean_text(), DatasetMatcher, fix_mixed_arabic_letters(), has_english_letters(), is_number_token() (+11 more)

### Community 6 - "POST /text-to-sign"
Cohesion: 0.18
Nodes (15): POST /text-to-sign, Curriculum Label-Map Words, Learn, POST /text-to-sign, Translate, GET /video/{request_id}, Backend API :8000, Learn Feature (+7 more)

### Community 7 - "Text/Speech to Sign"
Cohesion: 0.13
Nodes (17): Animation Generator, Arabic Normalizer, Cloudinary, cloudinary_config, POST /speech-to-text, GET /video/{request_id}, imageio-ffmpeg, .pose File (+9 more)

### Community 8 - "api.ts"
Cohesion: 0.06
Nodes (64): metadata, DEMOS, LoginForm(), onSubmit(), StudentPlayer(), StudentHome(), TeacherLessonPage(), onAssign() (+56 more)

### Community 9 - "lessons.py"
Cohesion: 0.13
Nodes (37): login(), LoginBody, me(), BaseModel, get, post, user_payload(), assign_lesson() (+29 more)

### Community 11 - "File map"
Cohesion: 0.06
Nodes (32): Architecture, Auth and data, Lesson JSON (canonical), Locked decisions, Newton 2nd simulation contract, Out of scope until later, Personas, Problem (+24 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (24): nextConfig, dependencies, lucide-react, next, react, react-dom, devDependencies, @types/node (+16 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 14 - "POST /sign-to-text"
Cohesion: 0.21
Nodes (12): POST /sign-to-text/full-sentence-video, Practice, POST /sign-to-text, Tutor Loop, Practice Feature, Practice, raw_words[0], signToText (+4 more)

### Community 15 - "Website Frontend"
Cohesion: 0.22
Nodes (11): Architecture Documentation, GPT-4o-mini, OpenRouter, Cloudinary, Egyptian Arabic, FastAPI Backend, Website Frontend, GET /health (+3 more)

### Community 16 - "Backend"
Cohesion: 0.22
Nodes (10): Backend, RTMPose, Sign Recognition Model (502 Classes), Sign Video to Arabic Text API, Text/Speech to Sign Animation API, Deep Learning Sign Recognition, mediapipe, HF-SMCA Model (+2 more)

### Community 17 - "Product"
Cohesion: 0.22
Nodes (8): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Product, Product Purpose, Register, Users

### Community 18 - "Isharati Website"
Cohesion: 0.29
Nodes (8): CORS for localhost:3000, FastAPI, Frontend, Isharati, Tutor Website, Next.js, Next.js App Router, Isharati Website

### Community 19 - "Design"
Cohesion: 0.25
Nodes (7): Color strategy, Design, Icons, Layout, Mood, Motion, Typography

### Community 20 - "Google Speech Recognition"
Cohesion: 0.40
Nodes (5): Speech to Text Service, SpeechRecognition, Google Speech Recognition, POST /speech-to-text, speechToSign

## Ambiguous Edges - Review These
- `pose.enc Lexicon` → `poses.json`  [AMBIGUOUS]
  docs/architecture.md · relation: shares_data_with
- `Deep Learning Sign Recognition` → `HF-SMCA Model`  [AMBIGUOUS]
  docs/architecture.md · relation: implements
- `mediapipe` → `RTMPose`  [AMBIGUOUS]
  backend/requirements.txt · relation: conceptually_related_to
- `RTMPose` → `Video Processor`  [AMBIGUOUS]
  docs/architecture.md · relation: calls
- `Tutor Website` → `Isharati Website`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **119 isolated node(s):** `nextConfig`, `name`, `private`, `dev`, `build` (+114 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 190 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `pose.enc Lexicon` and `poses.json`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Deep Learning Sign Recognition` and `HF-SMCA Model`?**
  _Edge tagged AMBIGUOUS (relation: implements) - confidence is low._
- **What is the exact relationship between `mediapipe` and `RTMPose`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `RTMPose` and `Video Processor`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **What is the exact relationship between `Tutor Website` and `Isharati Website`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Website Frontend` connect `Website Frontend` to `api.ts`, `Isharati Website`, `POST /text-to-sign`, `POST /sign-to-text`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `FastAPI Backend` connect `Website Frontend` to `Backend`, `Google Speech Recognition`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._