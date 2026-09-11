# Arabic NLP

> 30 nodes

## Key Concepts

- **arabic_normalizer.py** (14 connections) — `backend/services/arabic_normalizer.py`
- **clean_text()** (12 connections) — `backend/services/arabic_normalizer.py`
- **ArabicNormalizer** (10 connections) — `backend/services/arabic_normalizer.py`
- **DatasetMatcher** (7 connections) — `backend/services/arabic_normalizer.py`
- **.map_to_dataset()** (7 connections) — `backend/services/arabic_normalizer.py`
- **.can_use_fuzzy()** (7 connections) — `backend/services/arabic_normalizer.py`
- **fix_mixed_arabic_letters()** (7 connections) — `backend/services/arabic_normalizer.py`
- **is_single_arabic_letter()** (6 connections) — `backend/services/arabic_normalizer.py`
- **.char_level()** (5 connections) — `backend/services/arabic_normalizer.py`
- **.exact()** (5 connections) — `backend/services/arabic_normalizer.py`
- **.fuzzy()** (5 connections) — `backend/services/arabic_normalizer.py`
- **normalize_for_compare()** (5 connections) — `backend/services/arabic_normalizer.py`
- **all_tokens_are_single_letters()** (4 connections) — `backend/services/arabic_normalizer.py`
- **.__init__()** (4 connections) — `backend/services/arabic_normalizer.py`
- **.parse_llm_output()** (4 connections) — `backend/services/arabic_normalizer.py`
- **.tokenize()** (4 connections) — `backend/services/arabic_normalizer.py`
- **._build_dataset_summary()** (3 connections) — `backend/services/arabic_normalizer.py`
- **.normalize()** (3 connections) — `backend/services/arabic_normalizer.py`
- **.__init__()** (3 connections) — `backend/services/arabic_normalizer.py`
- **is_number_token()** (3 connections) — `backend/services/arabic_normalizer.py`
- **has_english_letters()** (2 connections) — `backend/services/arabic_normalizer.py`
- **Very important: Fuzzy matching caused: احمد -> الحمد لله and letters being…** (1 connections) — `backend/services/arabic_normalizer.py`
- **Controlled fuzzy only. Higher threshold prevents احمد -> الحمد لله.** (1 connections) — `backend/services/arabic_normalizer.py`
- **Convert unknown words/names to letters. Only keep letters that exist in dataset.** (1 connections) — `backend/services/arabic_normalizer.py`
- **Split the dataset into categories so the LLM can reason about each type…** (1 connections) — `backend/services/arabic_normalizer.py`
- *... and 5 more nodes in this community*

## Relationships

- [Text-to-Sign API](Text-to-Sign_API.md) (5 shared connections)
- [App Config](App_Config.md) (4 shared connections)

## Source Files

- `backend/services/arabic_normalizer.py`

## Audit Trail

- EXTRACTED: 68 (99%)
- INFERRED: 1 (1%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*