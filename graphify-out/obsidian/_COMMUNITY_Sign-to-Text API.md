---
type: community
cohesion: 0.10
members: 33
---

# Sign-to-Text API

**Cohesion:** 0.10 - loosely connected
**Members:** 33 nodes

## Members
- [[Any]] - code
- [[Approximate full-sentence video pipeline. Input One video containing multiple…]] - rationale - backend/services/full_sentence_video_service.py
- [[Choose best prediction across windows and mirrororiginal candidates.]] - rationale - backend/services/sign_predictor.py
- [[Cut a short video segment using OpenCV.]] - rationale - backend/services/full_sentence_video_service.py
- [[Extract the real wordconfidencemargin from predict_sign(). Important Your…]] - rationale - backend/services/full_sentence_video_service.py
- [[Path]] - code
- [[Path_1]] - code
- [[Path_3]] - code
- [[Read basic video metadata.]] - rationale - backend/services/full_sentence_video_service.py
- [[Reduce repeated words from overlapping segments. Idea - Ignore weak…]] - rationale - backend/services/full_sentence_video_service.py
- [[Return small response objects instead of huge nested prediction JSON.]] - rationale - backend/services/full_sentence_video_service.py
- [[UploadFile_1]] - code
- [[UploadFile_2]] - code
- [[_word_from_top1()]] - code - backend/services/sign_predictor.py
- [[build_words_from_segments()]] - code - backend/services/full_sentence_video_service.py
- [[cut_video_segment()]] - code - backend/services/full_sentence_video_service.py
- [[extract_prediction_summary()]] - code - backend/services/full_sentence_video_service.py
- [[full_sentence_video.py]] - code - backend/api/routes/full_sentence_video.py
- [[full_sentence_video_endpoint()]] - code - backend/api/routes/full_sentence_video.py
- [[full_sentence_video_service.py]] - code - backend/services/full_sentence_video_service.py
- [[get_video_info()]] - code - backend/services/full_sentence_video_service.py
- [[make_compact_segments()]] - code - backend/services/full_sentence_video_service.py
- [[nlp_refiner.py]] - code - backend/services/nlp_refiner.py
- [[post_1]] - code
- [[post_2]] - code
- [[predict_full_sentence_video()]] - code - backend/services/full_sentence_video_service.py
- [[predict_sign()]] - code - backend/services/sign_predictor.py
- [[refine_to_egyptian()]] - code - backend/services/nlp_refiner.py
- [[save_full_sentence_upload()]] - code - backend/api/routes/full_sentence_video.py
- [[save_upload_file()]] - code - backend/api/routes/sign_to_text.py
- [[selection_score()]] - code - backend/services/sign_predictor.py
- [[sign_to_text()]] - code - backend/api/routes/sign_to_text.py
- [[sign_to_text.py]] - code - backend/api/routes/sign_to_text.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Sign-to-Text_API
SORT file.name ASC
```

## Connections to other communities
- 6 edges to [[_COMMUNITY_Sign Video Processing]]
- 6 edges to [[_COMMUNITY_HF-SMCA Model]]
- 2 edges to [[_COMMUNITY_App Config]]

## Top bridge nodes
- [[sign_to_text.py]] - degree 9, connects to 3 communities
- [[full_sentence_video_service.py]] - degree 11, connects to 2 communities
- [[predict_full_sentence_video()]] - degree 13, connects to 1 community
- [[predict_sign()]] - degree 9, connects to 1 community
- [[full_sentence_video.py]] - degree 7, connects to 1 community