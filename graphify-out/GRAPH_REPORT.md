# Graph Report - Isharati  (2026-09-18)

## Corpus Check
- 202 files · ~98,457 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1473 nodes · 3097 edges · 79 communities (66 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10fc2186`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- video_processor.py
- .__init__
- predict_full_sentence_video
- Isharati FastAPI Backend
- dependencies
- arabic_normalizer.py
- POST /text-to-sign
- Text/Speech to Sign
- frontend/src/lib/api.ts
- lessons.py
- pose-anonymization
- File map
- frontend/package.json
- compilerOptions
- POST /sign-to-text
- Website Frontend
- Backend
- Product
- Isharati Website
- Design
- Google Speech Recognition
- next-env.d.ts
- cn
- sidebar.tsx
- raqeeb-learn-arabic/package.json
- utils.ts
- frontend/src/lib/types.ts
- routeTree.gen.ts
- compilerOptions
- server.ts
- components.json
- navigation-menu.tsx
- command.tsx
- devDependencies
- menubar.tsx
- raqeeb-learn-arabic/src/lib/api.ts
- form.tsx
- useRaqeeb
- carousel.tsx
- __root.tsx
- chart.tsx
- breadcrumb.tsx
- lessons.$lessonId.tsx
- build
- lessons/page.tsx
- class-variance-authority
- Raqeeb static tutoring website
- useLang
- teacher/lessons/[id]/page.tsx
- EUI GenAI Hackathon Sprint — Imkan/Raqeeb Implementation Plan
- raqeeb-context.tsx
- Hackathon completeness
- Raqeeb: Clear Lessons
- lang.tsx
- Routes
- AppShell.tsx
- roadmap.md
- gamification.ts
- components/NewtonLab.tsx
- context-menu.tsx
- text_to_sign.py
- avatar.tsx
- OverflowMenu
- Speech_to_text.py
- config.py
- sign_to_text.py
- Raqeeb / Imkan — Pitch Deck Copy Draft
- ArabicNormalizer
- login.tsx
- raqeeb-learn-arabic/vercel.json
- tabs.tsx
- vite-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 220 edges
2. `useLang()` - 46 edges
3. `pick()` - 37 edges
4. `useRaqeeb()` - 31 edges
5. `Dual()` - 28 edges
6. `compilerOptions` - 22 edges
7. `parseJson()` - 20 edges
8. `useUser()` - 20 edges
9. `useUser()` - 18 edges
10. `TeacherLessonPage()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Video Processor` --calls--> `RTMPose`  [AMBIGUOUS]
  backend/README.md → docs/architecture.md
- `POST /sign-to-text` --conceptually_related_to--> `POST /sign-to-text`  [INFERRED]
  backend/README.md → docs/architecture.md
- `pose.enc Lexicon` --shares_data_with--> `poses.json`  [AMBIGUOUS]
  docs/architecture.md → backend/README.md
- `Deep Learning Sign Recognition` --implements--> `HF-SMCA Model`  [AMBIGUOUS]
  backend/README.md → docs/architecture.md
- `mediapipe` --conceptually_related_to--> `RTMPose`  [AMBIGUOUS]
  backend/requirements.txt → docs/architecture.md

## Import Cycles
- None detected.

## Communities (79 total, 6 thin omitted)

### Community 0 - "video_processor.py"
Cohesion: 0.08
Nodes (48): body_normalize_keypoints(), build_aux_v3(), build_dominant_hand_view(), build_motion_aux(), build_rtmpose_inferencer(), build_windows(), choose_best_person_instance(), compute_hand_center_and_scale() (+40 more)

### Community 1 - ".__init__"
Cohesion: 0.06
Nodes (27): lesson_vocabulary(), main(), normalize(), Measure real sign-model accuracy on the words actually used in the seeded…, Every distinct sign word actually used across the seeded lessons., AuxReliabilityBranch, FourWayGatedFusion, GraphConvLayer (+19 more)

### Community 2 - "predict_full_sentence_video"
Cohesion: 0.23
Nodes (14): build_words_from_segments(), cut_video_segment(), extract_prediction_summary(), get_video_info(), make_compact_segments(), predict_full_sentence_video(), Any, Path (+6 more)

### Community 3 - "Isharati FastAPI Backend"
Cohesion: 0.12
Nodes (18): Arabic NLP, best_model.pt, Computer Vision, Egyptian Arabic, POST /sign-to-text/full-sentence-video, POST /sign-to-text, Isharati FastAPI Backend, Full Sentence Video Service (+10 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (53): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @hookform/resolvers, input-otp (+45 more)

### Community 5 - "arabic_normalizer.py"
Cohesion: 0.15
Nodes (14): PoseLoader, all_tokens_are_single_letters(), clean_text(), DatasetMatcher, has_english_letters(), is_number_token(), is_single_arabic_letter(), normalize_for_compare() (+6 more)

### Community 6 - "POST /text-to-sign"
Cohesion: 0.18
Nodes (15): POST /text-to-sign, Curriculum Label-Map Words, Learn, POST /text-to-sign, Translate, GET /video/{request_id}, Backend API :8000, Learn Feature (+7 more)

### Community 7 - "Text/Speech to Sign"
Cohesion: 0.13
Nodes (17): Animation Generator, Arabic Normalizer, Cloudinary, cloudinary_config, POST /speech-to-text, GET /video/{request_id}, imageio-ffmpeg, .pose File (+9 more)

### Community 8 - "frontend/src/lib/api.ts"
Cohesion: 0.10
Nodes (43): StudentPlayer(), TeacherLessonPage(), onAddStep(), onAssign(), onDelete(), onDuplicate(), onMoveStep(), onPublish() (+35 more)

### Community 9 - "lessons.py"
Cohesion: 0.10
Nodes (52): login(), LoginBody, me(), BaseModel, get, post, user_payload(), assign_lesson() (+44 more)

### Community 11 - "File map"
Cohesion: 0.06
Nodes (32): Architecture, Auth and data, Lesson JSON (canonical), Locked decisions, Newton 2nd simulation contract, Out of scope until later, Personas, Problem (+24 more)

### Community 12 - "frontend/package.json"
Cohesion: 0.07
Nodes (25): nextConfig, dependencies, lucide-react, next, react, react-dom, devDependencies, @types/node (+17 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 14 - "POST /sign-to-text"
Cohesion: 0.21
Nodes (12): POST /sign-to-text/full-sentence-video, Practice, POST /sign-to-text, Tutor Loop, Practice Feature, Practice, raw_words[0], signToText (+4 more)

### Community 15 - "Website Frontend"
Cohesion: 0.22
Nodes (11): Architecture Documentation, GPT-4o-mini, OpenRouter, Cloudinary, Egyptian Arabic, FastAPI Backend, Website Frontend, GET /health (+3 more)

### Community 16 - "Backend"
Cohesion: 0.22
Nodes (10): Backend, RTMPose, Sign Recognition Model (502 Classes), Sign Video to Arabic Text API, Text/Speech to Sign Animation API, Deep Learning Sign Recognition, mediapipe, HF-SMCA Model (+2 more)

### Community 17 - "Product"
Cohesion: 0.22
Nodes (8): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Product, Product Purpose, Register, Users

### Community 18 - "Isharati Website"
Cohesion: 0.29
Nodes (8): CORS for localhost:3000, FastAPI, Frontend, Isharati, Tutor Website, Next.js, Next.js App Router, Isharati Website

### Community 19 - "Design"
Cohesion: 0.15
Nodes (12): Color, Components, Design, Focus mode, Icons, Motion, Principle, Shape (+4 more)

### Community 20 - "Google Speech Recognition"
Cohesion: 0.40
Nodes (5): Speech to Text Service, SpeechRecognition, Google Speech Recognition, POST /speech-to-text, speechToSign

### Community 23 - "cn"
Cohesion: 0.05
Nodes (61): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+53 more)

### Community 24 - "sidebar.tsx"
Cohesion: 0.05
Nodes (42): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+34 more)

### Community 25 - "raqeeb-learn-arabic/package.json"
Cohesion: 0.04
Nodes (43): lucide-react, react, react-dom, @types/node, @types/react, @types/react-dom, typescript, name (+35 more)

### Community 26 - "utils.ts"
Cohesion: 0.05
Nodes (26): AccordionContent, AccordionItem, AccordionTrigger, Checkbox, HoverCardContent, PopoverContent, RadioGroup, RadioGroupItem (+18 more)

### Community 27 - "frontend/src/lib/types.ts"
Cohesion: 0.10
Nodes (36): DiagramGame(), finish(), nodeButton(), tap(), MatchGame(), choose(), column(), Side (+28 more)

### Community 28 - "routeTree.gen.ts"
Cohesion: 0.08
Nodes (34): getRouter(), Route, Route, Route, Route, Route, Route, Route (+26 more)

### Community 29 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowImportingTsExtensions, exactOptionalPropertyTypes, jsx, lib, module, moduleResolution, noEmit (+15 more)

### Community 30 - "server.ts"
Cohesion: 0.15
Nodes (14): consumeLastCapturedError(), describeError(), describeStatus(), originalConsoleError, safeStringify(), renderErrorPage(), fetch(), getServerEntry() (+6 more)

### Community 31 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 32 - "navigation-menu.tsx"
Cohesion: 0.25
Nodes (8): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport, @radix-ui/react-navigation-menu

### Community 33 - "command.tsx"
Cohesion: 0.12
Nodes (16): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+8 more)

### Community 34 - "devDependencies"
Cohesion: 0.06
Nodes (27): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+19 more)

### Community 35 - "menubar.tsx"
Cohesion: 0.11
Nodes (12): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+4 more)

### Community 36 - "raqeeb-learn-arabic/src/lib/api.ts"
Cohesion: 0.14
Nodes (26): links, SiteHeader(), assignLesson(), authHeaders(), FullSentenceResponse, fullSentenceVideo(), getLesson(), getToken() (+18 more)

### Community 37 - "form.tsx"
Cohesion: 0.17
Nodes (14): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+6 more)

### Community 38 - "useRaqeeb"
Cohesion: 0.20
Nodes (22): LessonRow(), Metric(), PageIntro(), SignModule(), StatusChip(), Button, Progress, listLessons() (+14 more)

### Community 39 - "carousel.tsx"
Cohesion: 0.17
Nodes (14): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+6 more)

### Community 40 - "__root.tsx"
Cohesion: 0.24
Nodes (5): LovableErrorOptions, LovableEvents, reportLovableError(), Window, ErrorComponent()

### Community 41 - "chart.tsx"
Cohesion: 0.23
Nodes (10): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES (+2 more)

### Community 42 - "breadcrumb.tsx"
Cohesion: 0.22
Nodes (8): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator(), @radix-ui/react-slot

### Community 43 - "lessons.$lessonId.tsx"
Cohesion: 0.12
Nodes (22): Dual(), DualProps, QuizPanel(), normalize(), SignCheck(), startRecord(), submitFile(), SignPanel() (+14 more)

### Community 44 - "build"
Cohesion: 0.50
Nodes (3): build, env, NEXT_PUBLIC_API_URL

### Community 45 - "lessons/page.tsx"
Cohesion: 0.16
Nodes (23): SettingsPage(), StatusFilter, TeacherReportsPage(), relativeTime(), TeacherStudentsPage(), CreateLessonButton(), Dual(), DualProps (+15 more)

### Community 46 - "class-variance-authority"
Cohesion: 0.14
Nodes (15): Alert, AlertDescription, AlertTitle, alertVariants, Badge(), BadgeProps, badgeVariants, ToggleGroup (+7 more)

### Community 47 - "Raqeeb static tutoring website"
Cohesion: 0.29
Nodes (6): Build, Lesson experience, Quality checks, Raqeeb static tutoring website, Technical details, Visual system

### Community 48 - "useLang"
Cohesion: 0.13
Nodes (24): TeacherHome(), AppearanceSettings(), LanguageSettings(), LearningSettings(), MotionSettings(), SignSettings(), SPEEDS, TEXT_SIZES (+16 more)

### Community 49 - "teacher/lessons/[id]/page.tsx"
Cohesion: 0.11
Nodes (24): RAIL_ICON, STEP_META, AUTHORABLE_TYPES, buildStep(), newStepId(), Note, STEP_ICON, GameStep() (+16 more)

### Community 50 - "EUI GenAI Hackathon Sprint — Imkan/Raqeeb Implementation Plan"
Cohesion: 0.09
Nodes (21): EUI GenAI Hackathon Sprint — Imkan/Raqeeb Implementation Plan, Global Constraints, Self-review notes, Sequencing across the 4 days, Task A1: Design tokens pass on `globals.css`, Task A2: Newton lab visual polish, Task A3: Gamification layer, Task A4: Teacher dashboard visual pass (+13 more)

### Community 51 - "raqeeb-context.tsx"
Cohesion: 0.17
Nodes (12): NewtonLab(), NewtonLabProps, Snapshot, newtonAccel(), withinGoal(), Lang, RaqeebContext, RaqeebProvider() (+4 more)

### Community 52 - "Hackathon completeness"
Cohesion: 0.33
Nodes (5): Done in this pass, Exists, Fill now, Hackathon completeness, Honest skip

### Community 53 - "Raqeeb: Clear Lessons"
Cohesion: 0.50
Nodes (3): Build with Lovable, Development, Raqeeb: Clear Lessons

### Community 54 - "lang.tsx"
Cohesion: 0.10
Nodes (21): metadata, viewport, HomePage(), SignPanel(), useSignVideo(), play(), A11yContext, A11yProvider() (+13 more)

### Community 56 - "AppShell.tsx"
Cohesion: 0.14
Nodes (18): DEMOS, LoginForm(), onSubmit(), A11yControls(), AppShell(), onLogout(), icon(), LAB_LINK (+10 more)

### Community 58 - "gamification.ts"
Cohesion: 0.21
Nodes (14): gameCount(), StudentHome(), onReset(), badgeForLesson(), BadgeTier, computeMastery(), doneStepIds(), lessonStats (+6 more)

### Community 59 - "components/NewtonLab.tsx"
Cohesion: 0.32
Nodes (10): clampRange(), gx(), gy(), NewtonLab(), centerCart(), resetMotion(), NewtonLabProps, Snapshot (+2 more)

### Community 60 - "context-menu.tsx"
Cohesion: 0.18
Nodes (10): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+2 more)

### Community 62 - "text_to_sign.py"
Cohesion: 0.18
Nodes (10): get_normalizer(), Path, post, save_pose(), text_to_sign(), BaseModel, TextInput, encode_pose_url() (+2 more)

### Community 63 - "avatar.tsx"
Cohesion: 0.40
Nodes (4): Avatar, AvatarFallback, AvatarImage, @radix-ui/react-avatar

### Community 67 - "Speech_to_text.py"
Cohesion: 0.16
Nodes (7): post, UploadFile, speech_to_text(), get_video(), get, AnimationGenerator, SpeechToTextSR

### Community 68 - "config.py"
Cohesion: 0.20
Nodes (7): first_existing(), Path, Return first existing path; if none exists, return the first candidate., health(), lifespan(), get, FastAPI

### Community 69 - "sign_to_text.py"
Cohesion: 0.23
Nodes (11): full_sentence_video_endpoint(), Path, post, UploadFile, save_full_sentence_upload(), Path, post, UploadFile (+3 more)

### Community 70 - "Raqeeb / Imkan — Pitch Deck Copy Draft"
Cohesion: 0.17
Nodes (11): Raqeeb / Imkan — Pitch Deck Copy Draft, Slide 10 — Close, Slide 1 — Raqeeb / Imkan, Slide 2 — The problem, Slide 3 — The solution, Slide 4 — Live demo: one learning loop, Slide 5 — Accessibility is product behavior, not a setting buried in a menu, Slide 6 — Sign-model evaluation (+3 more)

### Community 71 - "ArabicNormalizer"
Cohesion: 0.33
Nodes (5): ArabicNormalizer, fix_mixed_arabic_letters(), Split the dataset into categories so the LLM can reason about each type…, Fix rare LLM mistakes like: Bنك مصر -> بنك مصر, Fixed logic: - No full sentence fuzzy. - No fuzzy for single letters. - No…

### Community 72 - "login.tsx"
Cohesion: 0.38
Nodes (6): login(), setToken(), DEMOS, LoginPage(), onSubmit(), Route

### Community 74 - "raqeeb-learn-arabic/vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, framework, outputDirectory, rewrites, $schema

### Community 75 - "tabs.tsx"
Cohesion: 0.40
Nodes (4): TabsContent, TabsList, TabsTrigger, @radix-ui/react-tabs

## Ambiguous Edges - Review These
- `pose.enc Lexicon` → `poses.json`  [AMBIGUOUS]
  docs/architecture.md · relation: shares_data_with
- `Deep Learning Sign Recognition` → `HF-SMCA Model`  [AMBIGUOUS]
  docs/architecture.md · relation: implements
- `mediapipe` → `RTMPose`  [AMBIGUOUS]
  backend/requirements.txt · relation: conceptually_related_to
- `RTMPose` → `Video Processor`  [AMBIGUOUS]
  docs/architecture.md · relation: calls
- `Tutor Website` → `Isharati Website`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **408 isolated node(s):** `nextConfig`, `name`, `private`, `dev`, `build` (+403 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 538 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `pose.enc Lexicon` and `poses.json`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Deep Learning Sign Recognition` and `HF-SMCA Model`?**
  _Edge tagged AMBIGUOUS (relation: implements) - confidence is low._
- **What is the exact relationship between `mediapipe` and `RTMPose`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `RTMPose` and `Video Processor`?**
  _Edge tagged AMBIGUOUS (relation: calls) - confidence is low._
- **What is the exact relationship between `Tutor Website` and `Isharati Website`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `cn` to `navigation-menu.tsx`, `command.tsx`, `menubar.tsx`, `form.tsx`, `useRaqeeb`, `carousel.tsx`, `chart.tsx`, `breadcrumb.tsx`, `tabs.tsx`, `class-variance-authority`, `sidebar.tsx`, `raqeeb-learn-arabic/package.json`, `utils.ts`, `context-menu.tsx`, `avatar.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Website Frontend` connect `Website Frontend` to `frontend/src/lib/api.ts`, `Isharati Website`, `POST /text-to-sign`, `POST /sign-to-text`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._