# Graph Report - Isharati  (2026-09-11)

## Corpus Check
- Corpus is ~13,069 words - fits in a single context window. You may not need a graph.

## Summary
- 311 nodes · 549 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 8% INFERRED · 1% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Sign Video Processing
- HF-SMCA Model
- Sign-to-Text API
- Platform Concepts
- Text-to-Sign API
- Arabic NLP
- Tutor Surfaces
- Pose Animation
- Website Frontend
- App Config
- Pose Anonymization

## God Nodes (most connected - your core abstractions)
1. `make_10A_features_from_64_raw()` - 16 edges
2. `predict_full_sentence_video()` - 13 edges
3. `clean_text()` - 12 edges
4. `preprocess_video()` - 12 edges
5. `Isharati FastAPI Backend` - 11 edges
6. `Text/Speech to Sign` - 11 edges
7. `ArabicNormalizer` - 10 edges
8. `predict_sign()` - 9 edges
9. `compute_robust_center_scale_angle()` - 9 edges
10. `Website Frontend` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Deep Learning Sign Recognition` --implements--> `HF-SMCA Model`  [AMBIGUOUS]
  backend/README.md → docs/architecture.md
- `POST /sign-to-text` --conceptually_related_to--> `POST /sign-to-text`  [INFERRED]
  backend/README.md → docs/architecture.md
- `Video Processor` --calls--> `RTMPose`  [AMBIGUOUS]
  backend/README.md → docs/architecture.md
- `mediapipe` --conceptually_related_to--> `RTMPose`  [AMBIGUOUS]
  backend/requirements.txt → docs/architecture.md
- `Sign Recognition Model (502 Classes)` --conceptually_related_to--> `HF-SMCA Model`  [INFERRED]
  README.md → docs/architecture.md

## Import Cycles
- None detected.

## Communities (11 total, 1 thin omitted)

### Community 0 - "Sign Video Processing"
Cohesion: 0.08
Nodes (48): body_normalize_keypoints(), build_aux_v3(), build_dominant_hand_view(), build_motion_aux(), build_rtmpose_inferencer(), build_windows(), choose_best_person_instance(), compute_hand_center_and_scale() (+40 more)

### Community 1 - "HF-SMCA Model"
Cohesion: 0.08
Nodes (18): AuxReliabilityBranch, FourWayGatedFusion, GraphConvLayer, GraphFrameEncoder, HandBodyCrossAttentionBranch, HFSMCAHybridModel, MaskedAttentionPooling, MultiScaleTCNBlock (+10 more)

### Community 2 - "Sign-to-Text API"
Cohesion: 0.10
Nodes (29): Any, full_sentence_video_endpoint(), Path, post, UploadFile, save_full_sentence_upload(), Path, post (+21 more)

### Community 3 - "Platform Concepts"
Cohesion: 0.07
Nodes (32): Backend, RTMPose, Sign Recognition Model (502 Classes), Sign Video to Arabic Text API, Text/Speech to Sign Animation API, Arabic NLP, best_model.pt, Computer Vision (+24 more)

### Community 4 - "Text-to-Sign API"
Cohesion: 0.10
Nodes (14): post, UploadFile, speech_to_text(), post, text_to_sign(), get_video(), get, TextInput (+6 more)

### Community 5 - "Arabic NLP"
Cohesion: 0.14
Nodes (18): all_tokens_are_single_letters(), ArabicNormalizer, clean_text(), DatasetMatcher, fix_mixed_arabic_letters(), has_english_letters(), is_number_token(), is_single_arabic_letter() (+10 more)

### Community 6 - "Tutor Surfaces"
Cohesion: 0.10
Nodes (29): POST /text-to-sign, Curriculum Label-Map Words, POST /sign-to-text/full-sentence-video, Learn, Practice, POST /sign-to-text, POST /speech-to-text, POST /text-to-sign (+21 more)

### Community 7 - "Pose Animation"
Cohesion: 0.09
Nodes (27): Architecture Documentation, Animation Generator, Arabic Normalizer, Cloudinary, cloudinary_config, POST /speech-to-text, GET /video/{request_id}, imageio-ffmpeg (+19 more)

### Community 8 - "Website Frontend"
Cohesion: 0.14
Nodes (18): CORS for localhost:3000, FastAPI, Frontend, Isharati, Tutor Website, Next.js, Next.js App Router, Isharati Website (+10 more)

### Community 9 - "App Config"
Cohesion: 0.18
Nodes (6): first_existing(), Path, Return first existing path; if none exists, return the first candidate., health(), get, PoseLoader

## Ambiguous Edges - Review These
- `Tutor Website` → `Isharati Website`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Deep Learning Sign Recognition` → `HF-SMCA Model`  [AMBIGUOUS]
  docs/architecture.md · relation: implements
- `Video Processor` → `RTMPose`  [AMBIGUOUS]
  docs/architecture.md · relation: calls
- `poses.json` → `pose.enc Lexicon`  [AMBIGUOUS]
  docs/architecture.md · relation: shares_data_with
- `mediapipe` → `RTMPose`  [AMBIGUOUS]
  backend/requirements.txt · relation: conceptually_related_to

## Knowledge Gaps
- **28 isolated node(s):** `TextToSignResponse`, `SpeechToSignResponse`, `SignToTextResponse`, `FullSentenceResponse`, `Text/Speech to Sign Animation API` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 85 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Tutor Website` and `Isharati Website`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Deep Learning Sign Recognition` and `HF-SMCA Model`?**
  _Edge tagged AMBIGUOUS (relation: implements) - confidence is low._
- **What is the exact relationship between `Video Processor` and `RTMPose`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **What is the exact relationship between `poses.json` and `pose.enc Lexicon`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `mediapipe` and `RTMPose`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Isharati FastAPI Backend` connect `Platform Concepts` to `Pose Animation`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Text/Speech to Sign` connect `Pose Animation` to `Platform Concepts`, `Tutor Surfaces`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._