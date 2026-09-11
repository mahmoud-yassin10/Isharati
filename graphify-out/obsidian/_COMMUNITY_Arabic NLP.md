---
type: community
cohesion: 0.14
members: 30
---

# Arabic NLP

**Cohesion:** 0.14 - loosely connected
**Members:** 30 nodes

## Members
- [[dot-__init__()_2]] - code - backend/services/arabic_normalizer.py
- [[dot-__init__()_1]] - code - backend/services/arabic_normalizer.py
- [[dot-_build_dataset_summary()]] - code - backend/services/arabic_normalizer.py
- [[dot-can_use_fuzzy()]] - code - backend/services/arabic_normalizer.py
- [[dot-char_level()]] - code - backend/services/arabic_normalizer.py
- [[dot-exact()]] - code - backend/services/arabic_normalizer.py
- [[dot-fuzzy()]] - code - backend/services/arabic_normalizer.py
- [[dot-map_to_dataset()]] - code - backend/services/arabic_normalizer.py
- [[dot-normalize()]] - code - backend/services/arabic_normalizer.py
- [[dot-parse_llm_output()]] - code - backend/services/arabic_normalizer.py
- [[dot-tokenize()]] - code - backend/services/arabic_normalizer.py
- [[ArabicNormalizer]] - code - backend/services/arabic_normalizer.py
- [[Controlled fuzzy only. Higher threshold prevents احمد - الحمد لله.]] - rationale - backend/services/arabic_normalizer.py
- [[Convert unknown wordsnames to letters. Only keep letters that exist in dataset.]] - rationale - backend/services/arabic_normalizer.py
- [[DatasetMatcher]] - code - backend/services/arabic_normalizer.py
- [[Fix rare LLM mistakes like Bنك مصر - بنك مصر]] - rationale - backend/services/arabic_normalizer.py
- [[Fixed logic - No full sentence fuzzy. - No fuzzy for single letters. - No…]] - rationale - backend/services/arabic_normalizer.py
- [[Prevent matching ه, ش, ا, م as a fuzzy phrase.]] - rationale - backend/services/arabic_normalizer.py
- [[Split the dataset into categories so the LLM can reason about each type…]] - rationale - backend/services/arabic_normalizer.py
- [[True for one Arabic letter only ا  ب  ت  م  ه ...]] - rationale - backend/services/arabic_normalizer.py
- [[Used only for comparison, not final output. Final output should still use the…]] - rationale - backend/services/arabic_normalizer.py
- [[Very important Fuzzy matching caused احمد - الحمد لله and letters being…]] - rationale - backend/services/arabic_normalizer.py
- [[all_tokens_are_single_letters()]] - code - backend/services/arabic_normalizer.py
- [[arabic_normalizer.py]] - code - backend/services/arabic_normalizer.py
- [[clean_text()]] - code - backend/services/arabic_normalizer.py
- [[fix_mixed_arabic_letters()]] - code - backend/services/arabic_normalizer.py
- [[has_english_letters()]] - code - backend/services/arabic_normalizer.py
- [[is_number_token()]] - code - backend/services/arabic_normalizer.py
- [[is_single_arabic_letter()]] - code - backend/services/arabic_normalizer.py
- [[normalize_for_compare()]] - code - backend/services/arabic_normalizer.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Arabic_NLP
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Text-to-Sign API]]
- 4 edges to [[_COMMUNITY_App Config]]

## Top bridge nodes
- [[arabic_normalizer.py]] - degree 14, connects to 2 communities
- [[ArabicNormalizer]] - degree 10, connects to 2 communities
- [[dot-__init__()_2]] - degree 4, connects to 1 community