# App Config

> 13 nodes

## Key Concepts

- **config.py** (9 connections) — `backend/config.py`
- **PoseLoader** (7 connections) — `backend/pose_loader.py`
- **main.py** (5 connections) — `backend/main.py`
- **pose_loader.py** (4 connections) — `backend/pose_loader.py`
- **first_existing()** (3 connections) — `backend/config.py`
- **health()** (2 connections) — `backend/main.py`
- **state.py** (2 connections) — `backend/state.py`
- **load_training_config()** (1 connections) — `backend/config.py`
- **.get()** (1 connections) — `backend/pose_loader.py`
- **.__init__()** (1 connections) — `backend/pose_loader.py`
- **Path** (1 connections)
- **get** (1 connections)
- **Return first existing path; if none exists, return the first candidate.** (1 connections) — `backend/config.py`

## Relationships

- [Arabic NLP](Arabic_NLP.md) (4 shared connections)
- [Sign-to-Text API](Sign-to-Text_API.md) (2 shared connections)
- [HF-SMCA Model](HF-SMCA_Model.md) (2 shared connections)
- [Sign Video Processing](Sign_Video_Processing.md) (1 shared connections)
- [Text-to-Sign API](Text-to-Sign_API.md) (1 shared connections)

## Source Files

- `backend/config.py`
- `backend/main.py`
- `backend/pose_loader.py`
- `backend/state.py`

## Audit Trail

- EXTRACTED: 23 (96%)
- INFERRED: 1 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*