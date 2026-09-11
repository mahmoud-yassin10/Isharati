# make_10A_features_from_64_raw()

> God node · 16 connections · `backend/services/video_processor.py`

**Community:** [Sign Video Processing](Sign_Video_Processing.md)

## Connections by Relation

### calls
- [preprocess_video()](preprocess_video.md) `EXTRACTED`
- [compute_robust_center_scale_angle()](compute_robust_center_scale_angle.md) `EXTRACTED`
- sanitize_numeric() `EXTRACTED`
- build_motion_aux() `EXTRACTED`
- build_aux_v3() `EXTRACTED`
- standardize_aux() `EXTRACTED`
- extract_or_create_masks() `EXTRACTED`
- body_normalize_keypoints() `EXTRACTED`
- hand_local_normalize_raw() `EXTRACTED`
- compute_velocity() `EXTRACTED`
- extract_upper49() `EXTRACTED`
- extract_lr_hands_from_body_norm() `EXTRACTED`
- compute_motion_score() `EXTRACTED`
- decide_dominant_hand() `EXTRACTED`
- build_dominant_hand_view() `EXTRACTED`

### contains
- video_processor.py `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*