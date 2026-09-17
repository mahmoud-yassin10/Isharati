"""Measure real sign-model accuracy on the words actually used in the seeded lessons.

Why: the model is trained on 502 classes, but a demo only ever tests the ~15-20
words that appear in data/lessons/*.json. Overall 502-way accuracy is the wrong
number to quote to a judge -- this script reports both, so the honest number
(accuracy restricted to lesson vocabulary) is what goes in the pitch deck.

Usage:
    1. Collect at least 5 short clips per lesson word from different signers.
       Put them under:
           backend/data/eval_clips/<word>/<anything>.mp4
       <word> must match a glossary term_ar or sign_target used in the lessons
       (run this script with no clips first -- it prints the exact word list
       you need to collect).
    2. Run:
           python scripts/eval_lesson_vocab.py
    3. Results are printed and written to data/_pose_report.txt.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

LESSONS_DIR = BASE_DIR / "data" / "lessons"
EVAL_DIR = BASE_DIR / "data" / "eval_clips"
REPORT_PATH = BASE_DIR / "data" / "_pose_report.txt"
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


def lesson_vocabulary() -> set[str]:
    """Every distinct sign word actually used across the seeded lessons."""
    words: set[str] = set()
    for path in sorted(LESSONS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for entry in data.get("glossary", {}).values():
            term = entry.get("term_ar", "").strip()
            if term:
                words.add(term)
        for step in data.get("steps", []):
            target = (step.get("sign_target") or "").strip()
            if target:
                words.add(target)
    return words


def normalize(text: str) -> str:
    return text.replace(" ", "").strip()


def main() -> None:
    vocab = lesson_vocabulary()
    print(f"Lesson vocabulary ({len(vocab)} words): {sorted(vocab)}")

    if not EVAL_DIR.exists():
        EVAL_DIR.mkdir(parents=True, exist_ok=True)
        for word in vocab:
            (EVAL_DIR / word).mkdir(parents=True, exist_ok=True)
        print(f"\nNo eval clips yet. Created empty folders under {EVAL_DIR}")
        print("Put >=5 clips per word in the matching folder, then re-run this script.")
        return

    clip_paths: dict[str, list[Path]] = defaultdict(list)
    for word_dir in EVAL_DIR.iterdir():
        if not word_dir.is_dir():
            continue
        for clip in word_dir.iterdir():
            if clip.suffix.lower() in VIDEO_EXTENSIONS:
                clip_paths[word_dir.name].append(clip)

    total_clips = sum(len(v) for v in clip_paths.values())
    if total_clips == 0:
        print(f"No clips found under {EVAL_DIR}. Add clips per word folder and re-run.")
        return

    from services.video_processor import preprocess_video
    from services.sign_predictor import predict_sign

    per_word_correct: dict[str, int] = defaultdict(int)
    per_word_total: dict[str, int] = defaultdict(int)
    overall_top1_correct = 0
    # "restricted" = would this clip's true word have won if only lesson-vocab
    # words were candidates (i.e. best-scoring lesson-vocab prediction is correct)
    restricted_correct = 0
    rows: list[str] = []

    for word, clips in sorted(clip_paths.items()):
        for clip in clips:
            try:
                preprocessed = preprocess_video(clip)
                result = predict_sign(preprocessed)
            except Exception as exc:  # noqa: BLE001 - report and continue
                rows.append(f"{word}\t{clip.name}\tERROR\t{exc!r}")
                per_word_total[word] += 1
                continue

            predicted_word = normalize(result["word"])
            true_word = normalize(word)
            top1_correct = predicted_word == true_word

            topk = result["best"]["topk"]
            restricted_candidates = [c for c in topk if normalize(c["arabic_label"]) in {normalize(w) for w in vocab}]
            restricted_pred = restricted_candidates[0]["arabic_label"] if restricted_candidates else predicted_word
            is_restricted_correct = normalize(restricted_pred) == true_word

            per_word_total[word] += 1
            if top1_correct:
                per_word_correct[word] += 1
                overall_top1_correct += 1
            if is_restricted_correct:
                restricted_correct += 1

            rows.append(
                f"{word}\t{clip.name}\ttop1={result['word']}\tconf={result['best']['top1_prob']:.2f}\t"
                f"{'OK' if top1_correct else 'MISS'}"
            )

    lines = ["# Lesson-vocabulary accuracy report", ""]
    lines.append(f"Total clips evaluated: {total_clips}")
    lines.append(f"Overall top-1 accuracy (full 502-class model): {overall_top1_correct}/{total_clips} "
                 f"({100 * overall_top1_correct / total_clips:.1f}%)")
    lines.append(f"Accuracy restricted to lesson vocabulary ({len(vocab)} words): "
                 f"{restricted_correct}/{total_clips} ({100 * restricted_correct / total_clips:.1f}%)")
    lines.append("")
    lines.append("Per-word breakdown:")
    for word in sorted(per_word_total):
        correct = per_word_correct[word]
        total = per_word_total[word]
        pct = 100 * correct / total if total else 0.0
        lines.append(f"  {word}: {correct}/{total} ({pct:.0f}%)")
    lines.append("")
    lines.append("Per-clip detail:")
    lines.extend(rows)

    report = "\n".join(lines)
    print("\n" + report)
    REPORT_PATH.write_text(report, encoding="utf-8")
    print(f"\nSaved to {REPORT_PATH}")


if __name__ == "__main__":
    main()
