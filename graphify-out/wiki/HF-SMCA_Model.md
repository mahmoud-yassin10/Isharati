# HF-SMCA Model

> 44 nodes

## Key Concepts

- **.__init__()** (19 connections) — `backend/services/model_architecture.py`
- **model_architecture.py** (15 connections) — `backend/services/model_architecture.py`
- **sign_predictor.py** (13 connections) — `backend/services/sign_predictor.py`
- **MaskedAttentionPooling** (7 connections) — `backend/services/model_architecture.py`
- **GraphFrameEncoder** (5 connections) — `backend/services/model_architecture.py`
- **HFSMCAHybridModel** (5 connections) — `backend/services/model_architecture.py`
- **MultiScaleTCNBlock** (5 connections) — `backend/services/model_architecture.py`
- **TemporalTransformerEncoder** (5 connections) — `backend/services/model_architecture.py`
- **.__init__()** (5 connections) — `backend/services/model_architecture.py`
- **.__init__()** (5 connections) — `backend/services/model_architecture.py`
- **predict_features()** (5 connections) — `backend/services/sign_predictor.py`
- **AuxReliabilityBranch** (4 connections) — `backend/services/model_architecture.py`
- **FourWayGatedFusion** (4 connections) — `backend/services/model_architecture.py`
- **GraphConvLayer** (4 connections) — `backend/services/model_architecture.py`
- **HandBodyCrossAttentionBranch** (4 connections) — `backend/services/model_architecture.py`
- **MultiScaleTemporalMotionBranch** (4 connections) — `backend/services/model_architecture.py`
- **PositionalEncoding** (4 connections) — `backend/services/model_architecture.py`
- **StaticHandshapeTransformerBranch** (4 connections) — `backend/services/model_architecture.py`
- **.__init__()** (4 connections) — `backend/services/model_architecture.py`
- **.__init__()** (4 connections) — `backend/services/model_architecture.py`
- **load_model()** (4 connections) — `backend/services/sign_predictor.py`
- **.__init__()** (3 connections) — `backend/services/model_architecture.py`
- **.__init__()** (3 connections) — `backend/services/model_architecture.py`
- **load_labels()** (3 connections) — `backend/services/sign_predictor.py`
- **features_to_torch_batch()** (3 connections) — `backend/services/video_processor.py`
- *... and 19 more nodes in this community*

## Relationships

- [Sign-to-Text API](Sign-to-Text_API.md) (6 shared connections)
- [Sign Video Processing](Sign_Video_Processing.md) (3 shared connections)
- [App Config](App_Config.md) (2 shared connections)

## Source Files

- `backend/services/model_architecture.py`
- `backend/services/sign_predictor.py`
- `backend/services/video_processor.py`

## Audit Trail

- EXTRACTED: 88 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*