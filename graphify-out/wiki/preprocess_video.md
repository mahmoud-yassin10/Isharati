# preprocess_video()

> God node · 12 connections · `backend/services/video_processor.py`

**Community:** [Sign Video Processing](Sign_Video_Processing.md)

## Connections by Relation

### calls
- [make_10A_features_from_64_raw()](make_10A_features_from_64_raw.md) `EXTRACTED`
- [predict_full_sentence_video()](predict_full_sentence_video.md) `EXTRACTED`
- sign_to_text() `EXTRACTED`
- Path `EXTRACTED`
- resolve_input_to_npz() `EXTRACTED`
- load_raw_keypoints_npz() `EXTRACTED`
- build_windows() `EXTRACTED`
- mirror_raw_wholebody() `EXTRACTED`

### contains
- video_processor.py `EXTRACTED`

### imports
- full_sentence_video_service.py `EXTRACTED`
- sign_to_text.py `EXTRACTED`

### rationale_for
- FastAPI-friendly preprocessing function. Input: video path or existing .npz… `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*