---
type: community
cohesion: 0.18
members: 13
---

# App Config

**Cohesion:** 0.18 - loosely connected
**Members:** 13 nodes

## Members
- [[dot-__init__()]] - code - backend/pose_loader.py
- [[dot-get()]] - code - backend/pose_loader.py
- [[Path_2]] - code
- [[PoseLoader]] - code - backend/pose_loader.py
- [[Return first existing path; if none exists, return the first candidate.]] - rationale - backend/config.py
- [[config.py]] - code - backend/config.py
- [[first_existing()]] - code - backend/config.py
- [[get_1]] - code
- [[health()]] - code - backend/main.py
- [[load_training_config()]] - code - backend/config.py
- [[main.py]] - code - backend/main.py
- [[pose_loader.py]] - code - backend/pose_loader.py
- [[state.py]] - code - backend/state.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/App_Config
SORT file.name ASC
```

## Connections to other communities
- 4 edges to [[_COMMUNITY_Arabic NLP]]
- 2 edges to [[_COMMUNITY_Sign-to-Text API]]
- 2 edges to [[_COMMUNITY_HF-SMCA Model]]
- 1 edge to [[_COMMUNITY_Sign Video Processing]]
- 1 edge to [[_COMMUNITY_Text-to-Sign API]]

## Top bridge nodes
- [[config.py]] - degree 9, connects to 3 communities
- [[PoseLoader]] - degree 7, connects to 1 community
- [[pose_loader.py]] - degree 4, connects to 1 community
- [[state.py]] - degree 2, connects to 1 community