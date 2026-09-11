# predict_sign()

> God node · 9 connections · `backend/services/sign_predictor.py`

**Community:** [Sign-to-Text API](Sign-to-Text_API.md)

## Connections by Relation

### calls
- [predict_full_sentence_video()](predict_full_sentence_video.md) `EXTRACTED`
- sign_to_text() `EXTRACTED`
- predict_features() `EXTRACTED`
- selection_score() `EXTRACTED`
- _word_from_top1() `EXTRACTED`

### contains
- sign_predictor.py `EXTRACTED`

### imports
- full_sentence_video_service.py `EXTRACTED`
- sign_to_text.py `EXTRACTED`

### rationale_for
- Choose best prediction across windows and mirror/original candidates. `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*