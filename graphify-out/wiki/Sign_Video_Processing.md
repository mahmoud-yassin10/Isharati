# Sign Video Processing

> 50 nodes

## Key Concepts

- **video_processor.py** (51 connections) — `backend/services/video_processor.py`
- **make_10A_features_from_64_raw()** (16 connections) — `backend/services/video_processor.py`
- **preprocess_video()** (12 connections) — `backend/services/video_processor.py`
- **compute_robust_center_scale_angle()** (9 connections) — `backend/services/video_processor.py`
- **extract_rtmpose_keypoints_from_video()** (7 connections) — `backend/services/video_processor.py`
- **build_motion_aux()** (6 connections) — `backend/services/video_processor.py`
- **sanitize_numeric()** (6 connections) — `backend/services/video_processor.py`
- **build_aux_v3()** (4 connections) — `backend/services/video_processor.py`
- **compute_hand_center_and_scale()** (4 connections) — `backend/services/video_processor.py`
- **resolve_input_to_npz()** (4 connections) — `backend/services/video_processor.py`
- **speed_from_velocity()** (4 connections) — `backend/services/video_processor.py`
- **standardize_aux()** (4 connections) — `backend/services/video_processor.py`
- **Path** (4 connections)
- **body_normalize_keypoints()** (3 connections) — `backend/services/video_processor.py`
- **build_windows()** (3 connections) — `backend/services/video_processor.py`
- **choose_best_person_instance()** (3 connections) — `backend/services/video_processor.py`
- **compute_velocity()** (3 connections) — `backend/services/video_processor.py`
- **ensure_64_frames()** (3 connections) — `backend/services/video_processor.py`
- **extract_or_create_masks()** (3 connections) — `backend/services/video_processor.py`
- **extract_wholebody_from_frame()** (3 connections) — `backend/services/video_processor.py`
- **get_rtmpose_inferencer()** (3 connections) — `backend/services/video_processor.py`
- **get_video_info()** (3 connections) — `backend/services/video_processor.py`
- **hand_local_normalize_raw()** (3 connections) — `backend/services/video_processor.py`
- **load_aux_stats()** (3 connections) — `backend/services/video_processor.py`
- **load_raw_keypoints_npz()** (3 connections) — `backend/services/video_processor.py`
- *... and 25 more nodes in this community*

## Relationships

- [Sign-to-Text API](Sign-to-Text_API.md) (6 shared connections)
- [HF-SMCA Model](HF-SMCA_Model.md) (3 shared connections)
- [App Config](App_Config.md) (1 shared connections)

## Source Files

- `backend/services/video_processor.py`

## Audit Trail

- EXTRACTED: 113 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*