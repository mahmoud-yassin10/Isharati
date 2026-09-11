# Text-to-Sign API

> 32 nodes

## Key Concepts

- **Speech_to_text.py** (12 connections) — `backend/api/routes/Speech_to_text.py`
- **text_to_sign.py** (12 connections) — `backend/api/routes/text_to_sign.py`
- **PoseRetriever** (7 connections) — `backend/services/pose_retriever.py`
- **SpeechToTextSR** (6 connections) — `backend/services/speech_to_text.py`
- **AnimationGenerator** (5 connections) — `backend/services/animation_generator.py`
- **requests.py** (5 connections) — `backend/schemas/requests.py`
- **pose_retriever.py** (5 connections) — `backend/services/pose_retriever.py`
- **TextInput** (4 connections) — `backend/schemas/requests.py`
- **PoseSmoother** (4 connections) — `backend/services/pose_smoother.py`
- **speech_to_text()** (4 connections) — `backend/api/routes/Speech_to_text.py`
- **text_to_sign()** (4 connections) — `backend/api/routes/text_to_sign.py`
- **video.py** (4 connections) — `backend/api/routes/video.py`
- **animation_generator.py** (4 connections) — `backend/services/animation_generator.py`
- **get_video()** (3 connections) — `backend/api/routes/video.py`
- **pose_smoother.py** (3 connections) — `backend/services/pose_smoother.py`
- **.generate()** (2 connections) — `backend/services/animation_generator.py`
- **.transcribe_any()** (2 connections) — `backend/services/speech_to_text.py`
- **.transcribe_file()** (2 connections) — `backend/services/speech_to_text.py`
- **cloudinary_config.py** (2 connections) — `backend/configs/cloudinary_config.py`
- **speech_to_text.py** (2 connections) — `backend/services/speech_to_text.py`
- **iterfile()** (1 connections) — `backend/api/routes/video.py`
- **.__init__()** (1 connections) — `backend/services/pose_retriever.py`
- **.retrieve()** (1 connections) — `backend/services/pose_retriever.py`
- **.smooth()** (1 connections) — `backend/services/pose_smoother.py`
- **.__init__()** (1 connections) — `backend/services/speech_to_text.py`
- *... and 7 more nodes in this community*

## Relationships

- [Arabic NLP](Arabic_NLP.md) (5 shared connections)
- [App Config](App_Config.md) (1 shared connections)

## Source Files

- `backend/api/routes/Speech_to_text.py`
- `backend/api/routes/text_to_sign.py`
- `backend/api/routes/video.py`
- `backend/configs/cloudinary_config.py`
- `backend/schemas/requests.py`
- `backend/services/animation_generator.py`
- `backend/services/pose_retriever.py`
- `backend/services/pose_smoother.py`
- `backend/services/speech_to_text.py`

## Audit Trail

- EXTRACTED: 52 (95%)
- INFERRED: 3 (5%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*