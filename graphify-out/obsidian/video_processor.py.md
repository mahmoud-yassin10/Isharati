---
source_file: "backend/services/video_processor.py"
type: "code"
community: "Sign Video Processing"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Sign_Video_Processing
---

# video_processor.py

## Connections
- [[body_normalize_keypoints()]] - `contains` [EXTRACTED]
- [[build_aux_v3()]] - `contains` [EXTRACTED]
- [[build_dominant_hand_view()]] - `contains` [EXTRACTED]
- [[build_motion_aux()]] - `contains` [EXTRACTED]
- [[build_rtmpose_inferencer()]] - `contains` [EXTRACTED]
- [[build_windows()]] - `contains` [EXTRACTED]
- [[choose_best_person_instance()]] - `contains` [EXTRACTED]
- [[compute_hand_center_and_scale()]] - `contains` [EXTRACTED]
- [[compute_motion_score()]] - `contains` [EXTRACTED]
- [[compute_robust_center_scale_angle()]] - `contains` [EXTRACTED]
- [[compute_velocity()]] - `contains` [EXTRACTED]
- [[config.py]] - `imports_from` [EXTRACTED]
- [[decide_dominant_hand()]] - `contains` [EXTRACTED]
- [[ensure_64_frames()]] - `contains` [EXTRACTED]
- [[extract_lr_hands_from_body_norm()]] - `contains` [EXTRACTED]
- [[extract_or_create_masks()]] - `contains` [EXTRACTED]
- [[extract_rtmpose_keypoints_from_video()]] - `contains` [EXTRACTED]
- [[extract_upper49()]] - `contains` [EXTRACTED]
- [[extract_wholebody_from_frame()]] - `contains` [EXTRACTED]
- [[features_to_torch_batch()]] - `contains` [EXTRACTED]
- [[fill_invalid_scalar()]] - `contains` [EXTRACTED]
- [[fill_invalid_vector()]] - `contains` [EXTRACTED]
- [[full_sentence_video_service.py]] - `imports_from` [EXTRACTED]
- [[get_instance_score()]] - `contains` [EXTRACTED]
- [[get_rtmpose_inferencer()]] - `contains` [EXTRACTED]
- [[get_video_info()_1]] - `contains` [EXTRACTED]
- [[hand_local_normalize_raw()]] - `contains` [EXTRACTED]
- [[load_aux_stats()]] - `contains` [EXTRACTED]
- [[load_raw_keypoints_npz()]] - `contains` [EXTRACTED]
- [[make_10A_features_from_64_raw()]] - `contains` [EXTRACTED]
- [[make_adjacency()]] - `contains` [EXTRACTED]
- [[make_landmark_mask()]] - `contains` [EXTRACTED]
- [[max_speed_per_frame()]] - `contains` [EXTRACTED]
- [[mean_speed_per_frame()]] - `contains` [EXTRACTED]
- [[mirror_raw_wholebody()]] - `contains` [EXTRACTED]
- [[model_architecture.py]] - `imports_from` [EXTRACTED]
- [[normalize_angle()]] - `contains` [EXTRACTED]
- [[point_speed_per_frame()]] - `contains` [EXTRACTED]
- [[preprocess_video()]] - `contains` [EXTRACTED]
- [[resolve_input_to_npz()]] - `contains` [EXTRACTED]
- [[rotation_matrix()]] - `contains` [EXTRACTED]
- [[safe_bbox_scale()]] - `contains` [EXTRACTED]
- [[safe_center()]] - `contains` [EXTRACTED]
- [[safe_distance()]] - `contains` [EXTRACTED]
- [[safe_open_video()]] - `contains` [EXTRACTED]
- [[sanitize_numeric()]] - `contains` [EXTRACTED]
- [[sign_predictor.py]] - `imports_from` [EXTRACTED]
- [[sign_to_text.py]] - `imports_from` [EXTRACTED]
- [[speed_from_velocity()]] - `contains` [EXTRACTED]
- [[standardize_aux()]] - `contains` [EXTRACTED]
- [[valid_point()]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Sign_Video_Processing