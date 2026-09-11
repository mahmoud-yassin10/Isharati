# Practice

Student signs the target word. The API checks what they signed.

1. Show the target word (optionally play the model sign first).
2. Record a short webcam clip or accept an upload.
3. Call `signToText([clip])` and compare `raw_words[0]` to the target.
