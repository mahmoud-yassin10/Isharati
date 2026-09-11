# Sign-to-Text API

> 33 nodes

## Key Concepts

- **predict_full_sentence_video()** (13 connections) — `backend/services/full_sentence_video_service.py`
- **full_sentence_video_service.py** (11 connections) — `backend/services/full_sentence_video_service.py`
- **predict_sign()** (9 connections) — `backend/services/sign_predictor.py`
- **sign_to_text.py** (9 connections) — `backend/api/routes/sign_to_text.py`
- **sign_to_text()** (7 connections) — `backend/api/routes/sign_to_text.py`
- **full_sentence_video.py** (7 connections) — `backend/api/routes/full_sentence_video.py`
- **full_sentence_video_endpoint()** (6 connections) — `backend/api/routes/full_sentence_video.py`
- **get_video_info()** (5 connections) — `backend/services/full_sentence_video_service.py`
- **refine_to_egyptian()** (5 connections) — `backend/services/nlp_refiner.py`
- **save_full_sentence_upload()** (4 connections) — `backend/api/routes/full_sentence_video.py`
- **save_upload_file()** (4 connections) — `backend/api/routes/sign_to_text.py`
- **cut_video_segment()** (4 connections) — `backend/services/full_sentence_video_service.py`
- **extract_prediction_summary()** (4 connections) — `backend/services/full_sentence_video_service.py`
- **make_compact_segments()** (4 connections) — `backend/services/full_sentence_video_service.py`
- **Any** (4 connections)
- **build_words_from_segments()** (3 connections) — `backend/services/full_sentence_video_service.py`
- **Path** (3 connections)
- **nlp_refiner.py** (3 connections) — `backend/services/nlp_refiner.py`
- **selection_score()** (2 connections) — `backend/services/sign_predictor.py`
- **_word_from_top1()** (2 connections) — `backend/services/sign_predictor.py`
- **UploadFile** (2 connections)
- **UploadFile** (2 connections)
- **Path** (1 connections)
- **post** (1 connections)
- **Path** (1 connections)
- *... and 8 more nodes in this community*

## Relationships

- [Sign Video Processing](Sign_Video_Processing.md) (6 shared connections)
- [HF-SMCA Model](HF-SMCA_Model.md) (6 shared connections)
- [App Config](App_Config.md) (2 shared connections)

## Source Files

- `backend/api/routes/full_sentence_video.py`
- `backend/api/routes/sign_to_text.py`
- `backend/services/full_sentence_video_service.py`
- `backend/services/nlp_refiner.py`
- `backend/services/sign_predictor.py`

## Audit Trail

- EXTRACTED: 69 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*