---
type: community
cohesion: 0.08
members: 50
---

# Sign Video Processing

**Cohesion:** 0.08 - loosely connected
**Members:** 50 nodes

## Members
- [[FastAPI-friendly preprocessing function. Input video path or existing .npz…]] - rationale - backend/services/video_processor.py
- [[Path_4]] - code
- [[Uniformly sample or pad any sequence to TARGET_FRAMES. Important for long…]] - rationale - backend/services/video_processor.py
- [[body_normalize_keypoints()]] - code - backend/services/video_processor.py
- [[build_aux_v3()]] - code - backend/services/video_processor.py
- [[build_dominant_hand_view()]] - code - backend/services/video_processor.py
- [[build_motion_aux()]] - code - backend/services/video_processor.py
- [[build_rtmpose_inferencer()]] - code - backend/services/video_processor.py
- [[build_windows()]] - code - backend/services/video_processor.py
- [[choose_best_person_instance()]] - code - backend/services/video_processor.py
- [[compute_hand_center_and_scale()]] - code - backend/services/video_processor.py
- [[compute_motion_score()]] - code - backend/services/video_processor.py
- [[compute_robust_center_scale_angle()]] - code - backend/services/video_processor.py
- [[compute_velocity()]] - code - backend/services/video_processor.py
- [[decide_dominant_hand()]] - code - backend/services/video_processor.py
- [[ensure_64_frames()]] - code - backend/services/video_processor.py
- [[extract_lr_hands_from_body_norm()]] - code - backend/services/video_processor.py
- [[extract_or_create_masks()]] - code - backend/services/video_processor.py
- [[extract_rtmpose_keypoints_from_video()]] - code - backend/services/video_processor.py
- [[extract_upper49()]] - code - backend/services/video_processor.py
- [[extract_wholebody_from_frame()]] - code - backend/services/video_processor.py
- [[fill_invalid_scalar()]] - code - backend/services/video_processor.py
- [[fill_invalid_vector()]] - code - backend/services/video_processor.py
- [[get_instance_score()]] - code - backend/services/video_processor.py
- [[get_rtmpose_inferencer()]] - code - backend/services/video_processor.py
- [[get_video_info()_1]] - code - backend/services/video_processor.py
- [[hand_local_normalize_raw()]] - code - backend/services/video_processor.py
- [[load_aux_stats()]] - code - backend/services/video_processor.py
- [[load_raw_keypoints_npz()]] - code - backend/services/video_processor.py
- [[make_10A_features_from_64_raw()]] - code - backend/services/video_processor.py
- [[make_adjacency()]] - code - backend/services/video_processor.py
- [[make_landmark_mask()]] - code - backend/services/video_processor.py
- [[max_speed_per_frame()]] - code - backend/services/video_processor.py
- [[mean_speed_per_frame()]] - code - backend/services/video_processor.py
- [[mirror_raw_wholebody()]] - code - backend/services/video_processor.py
- [[ndarray]] - code
- [[normalize_angle()]] - code - backend/services/video_processor.py
- [[point_speed_per_frame()]] - code - backend/services/video_processor.py
- [[preprocess_video()]] - code - backend/services/video_processor.py
- [[resolve_input_to_npz()]] - code - backend/services/video_processor.py
- [[rotation_matrix()]] - code - backend/services/video_processor.py
- [[safe_bbox_scale()]] - code - backend/services/video_processor.py
- [[safe_center()]] - code - backend/services/video_processor.py
- [[safe_distance()]] - code - backend/services/video_processor.py
- [[safe_open_video()]] - code - backend/services/video_processor.py
- [[sanitize_numeric()]] - code - backend/services/video_processor.py
- [[speed_from_velocity()]] - code - backend/services/video_processor.py
- [[standardize_aux()]] - code - backend/services/video_processor.py
- [[valid_point()]] - code - backend/services/video_processor.py
- [[video_processor.py]] - code - backend/services/video_processor.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Sign_Video_Processing
SORT file.name ASC
```

## Connections to other communities
- 6 edges to [[_COMMUNITY_Sign-to-Text API]]
- 3 edges to [[_COMMUNITY_HF-SMCA Model]]
- 1 edge to [[_COMMUNITY_App Config]]

## Top bridge nodes
- [[video_processor.py]] - degree 51, connects to 3 communities
- [[preprocess_video()]] - degree 12, connects to 1 community