# ACE / Math Simplified — Running Handoff Document

Version: 1.1  
Last consolidated: 2026-09-11

## Current scope

The immediate project is a Notion-to-frontend rendering preview, not the full learning platform. The current goal is to author lessons in Notion, click a preview button/link, and see the page rendered consistently in the ACE frontend. H2 headings currently define the left-side navigation. Syncing, Supabase, accounts, persistent student data, analytics, and production publishing are future work and are out of scope for the preview phase.

## Purpose

ACE is an interactive maths-learning platform under the Math Simplified project. Its goal is to help students learn foundational mathematics through a guided, interactive reading experience.

The product should feel like:

> Read a little → think → attempt something → receive feedback → continue

It should not feel like a static textbook, a long video course, or a Notion page shown directly to students.

## Product architecture

```text
Notion authoring
        ↓
ACE preview renderer
        ↓
Consistent student-facing frontend
```

Future platform architecture may add syncing, Supabase, and production publishing later.

### Notion

Notion is the teacher-facing authoring system and source of truth for:

- lesson wording and order
- headings and hierarchy
- explanations and examples
- equations
- callouts
- activities and prompts
- solutions and reasoning
- images/GIFs
- recap, practice, and memory-check content

### Supabase — future scope

Supabase stores application and student data, including:

- authentication and user profiles
- batches/classes
- lesson progress
- answers and attempts
- practice and memory-check performance
- bookmarks
- analytics
- published lesson versions
- optionally synced lesson content

Student-specific or frequently changing data should not be stored in Notion.

### Frontend

The ACE frontend owns:

- visual design and branding
- typography and mathematical rendering
- navigation and progress
- interactions and feedback
- responsive behaviour
- animations and visualisations
- accessibility

The student should experience ACE, not Notion.

## Lesson authoring model

Each lesson is generally one Notion page. A lesson may contain multiple closely related concepts. It can be split later if it becomes too large.

The intended learning flow is:

```text
Curiosity → Intuition → Formal concept → Example → Try it yourself
→ Next concept → Application → Recap → Practice → Retrieval
```

This is a teaching flow, not a requirement that every phrase become a visible heading.

### Heading hierarchy

```text
Page title = lesson title
H2 = left-side navigation item / major rendered section
H3 = subsection
H4 = nested subsection
```

For the current preview implementation, H2 headings are the navigation contract. The renderer must preserve their order and render the content beneath each H2 in the main frontend. Lower headings remain nested content. Any future heading normalization should be an explicit compatibility feature, not an inferred behaviour.

### Standard content mapping

| Notion content | ACE rendering responsibility |
|---|---|
| Page title | Lesson title |
| H1 | Major lesson section and left-navigation item |
| H2/H3 | Nested lesson structure |
| Paragraph | Lesson prose |
| Equation | Properly rendered mathematics |
| Callout | Insight, important distinction, activity prompt, or recap depending on explicit authoring metadata |
| Toggle | Hidden solution or reasoning reveal |
| Recap/memory-check callout | Recap or memory-check summary when explicitly authored as such |
| Image/GIF | Learning visual |
| Checkbox | Completion/retrieval state only when explicitly authored for that purpose |

Do not infer a multiple-choice question, answer control, or completion state from ordinary prose alone.

## Interaction principles

“Try It Yourself” sections should appear throughout teaching, not only at the end. Useful activity types include:

- predict
- classify
- calculate
- complete a representation
- explain why
- identify the applicable formula
- reason without calculating
- make a conjecture before seeing a proof

Students should commit to an answer before seeing the solution. Answers and reasoning should usually be hidden in plain toggles or equivalent frontend disclosures.

The frontend should distinguish:

- unanswered
- selected
- submitted
- correct
- incorrect
- retry
- solution revealed
- incomplete

Feedback should use text and accessible status indicators as well as colour, so meaning is not conveyed by colour alone. Icons are visual decoration or reinforcement only; they do not determine block semantics.

## ACE lesson shell

The reusable student shell should include:

- ACE header and student controls
- left navigation generated from major headings
- lesson title at the top of the content area
- one focused learning item in the main panel
- Previous and Next controls
- section progress
- interactive-item progress
- responsive mobile navigation

Next should move to the next meaningful learning item within a section, then to the next section. It should not jump only between major headings.

Repeated section headings need deterministic internal IDs:

```text
try-it-yourself
try-it-yourself-2
```

Visible labels may change later if stable ID overrides are added to authoring metadata.

## Design direction

The visual language should be calm, precise, sophisticated, and welcoming to adult learners.

Use only the approved ACE Club green palette for chromatic brand colours. Use neutral palette colours for backgrounds, surfaces, borders, and text. Define shared tokens for:

- page background
- surface
- primary and secondary text
- border
- primary action
- active navigation
- focus
- correct, incorrect, and incomplete states

Priorities:

- readable mathematics
- generous spacing
- clear hierarchy
- long-equation support
- comfortable touch targets
- visible keyboard focus
- restrained motion
- reduced-motion support

Suitable motion includes short transitions for expanding reasoning and updating progress. Avoid decorative looping animations.

## Video and visualisation policy

The course is primarily interactive reading. Video is secondary and should be used when movement materially improves intuition, such as:

- number lines
- inequalities
- percentage change
- ratios
- graph movement
- Venn diagrams
- pairing objects for even/odd
- geometric transformations

Short animations or interactive visualisations are often preferable to long instructor videos.

## Curriculum direction

The curriculum is a complete maths-foundation series rather than a narrowly DI-only prerequisite list.

### Module 1 — Number Basics

1. Number Basics
2. Even, Odd & Consecutive Numbers
3. Number Lines & Inequalities
4. Absolute Value / Modulus

### Module 2 — Number Properties

5. Factors, Multiples & Divisibility
6. Prime & Composite Numbers
7. HCF/GCD & LCM
8. Remainders
9. Exponents & Roots

Factors, multiples, primes, HCF, and LCM may be combined into one larger lesson if the material remains short enough.

### Module 3 — Ratios, Rates & Percentages

10. Ratios & Proportions
11. Rates & Unit Conversion
12. Percentage Basics
13. Percentage Change

Unit conversion belongs in Rates & Unit Conversion. Ratio and percentage changes are applications of existing concepts, not a separate prerequisite lesson.

### Module 4 — Algebra Foundations

14. Algebraic Expressions
15. Linear Equations
16. Systems of Equations
17. Algebraic Identities & Factorisation
18. Quadratic Equations
19. Algebraic Inequalities

Algebra should be taught early as a reasoning language, not only as a collection of formulas.

### Module 5 — Applied Arithmetic / Word Problems

20. Speed, Distance & Time
21. Work & Rate
22. Mixtures & Concentrations
23. Profit, Loss & Discounts
24. Simple & Compound Interest

After foundations, the broader progression can become:

```text
Math Foundations → Core DI Skills → DI Question Types
```

## Canonical Even/Odd lesson

The first concrete lesson is “Even and Odd- testing”. Its authored content includes:

- definition of even and odd integers
- inclusion of zero and negative integers
- representations `x = 2a` and `y = 2b + 1`, where `a,b ∈ ℤ`
- why `2b + 3` is still the same odd form
- why `2b + 2` is even
- an authored useful-assumption callout
- addition and subtraction parity rules
- multiplication parity rules
- the challenge `y = x² + 3x`
- a memory-check key takeaway

The first “Try it yourself” section and the “Practise” section currently contain placeholders and must not be fabricated by the renderer.

## Implementation roadmap

1. Finalise Notion authoring conventions.
2. Define the supported Notion block-to-ACE-component mapping.
3. Build the shared ACE lesson shell and H2-based left navigation.
4. Render the Even/Odd page faithfully.
5. Connect the preview route/button to the Notion page or export.
6. Test the same renderer with additional Notion pages.
7. Test accessibility, mobile layouts, mathematical rendering, and placeholder preservation.

## Local preview workflow

```text
Edit lesson in Notion
        ↓
Open the local preview for that lesson/page ID
        ↓
Refresh or resync content
        ↓
Render through the shared ACE frontend components
```

The preview renderer will later become the website renderer. Authoring, syncing, and renderer controls should stay outside the student lesson view.

## Current roadmap and MVP criteria

### MVP objective

An author can maintain a lesson in Notion, click a preview button or link, and see that page rendered in a consistent ACE frontend. H2 headings become the left-side navigation items, and content beneath each heading is rendered in authored order.

### MVP includes

- Even and Odd testing as the reference page.
- A predictable Notion-to-frontend renderer.
- H2-based left navigation.
- Shared ACE layout, typography, spacing, colours, equations, callouts, toggles, and buttons.
- Authored solution/reasoning reveals and supported interactions.
- Responsive desktop/mobile layouts and accessibility basics.
- Loading, empty, error, and unsupported-block states.
- A Notion preview button/link opening the relevant frontend preview route.
- The same renderer working for another test page without page-specific layout code.

### MVP acceptance criteria

- H2 headings appear as left-navigation entries in the correct order.
- Selecting a navigation item displays the corresponding content.
- Content below each H2 remains in authored order and hierarchy.
- Supported Notion edits appear after reopening or refreshing the preview.
- Equations, callouts, toggles, lists, and supported media render correctly.
- Unsupported blocks do not crash the page.
- The Even/Odd page is rendered faithfully, including existing placeholders.
- No questions or interactions are invented from ordinary prose.
- The same block type receives the same ACE component styling across pages.
- The preview works on desktop and mobile, with keyboard focus and reduced-motion support.

### Active phases

#### Phase 0 — Notion-to-frontend contract

Confirm H2 as the navigation contract, define supported blocks and their components, define preview URL/button behaviour, and freeze Even/Odd as the reference page. The broad target shell is represented by the reference rendering at https://ace-even-odd-lesson.ishan-shreyash.chatgpt.site. The detailed contract is documented in `docs/ACE_PHASE_0_CONTRACT.md`; its normalized reference fixture is `docs/fixtures/even-and-odd-testing.json`.

#### Phase 1 — Consistent ACE renderer

**Status: substantially complete for the fixture-backed preview.** The implementation is in the workspace root: `index.html`, `app.js`, `styles.css`, `interaction.css`, `interaction-overrides.css`, `interaction-state.css`, `drag-interaction.js`, and `docs/fixtures/interaction-components-demo.json`.

Implemented: ACE shell and design tokens; H2 navigation with deterministic IDs; authored-order fixture rendering; placeholder preservation; loading/error states; toggle reveals; unsupported-block fallback; responsive layout; keyboard focus and reduced-motion rules; and a student interaction showcase.

Current showcase scope is intentionally limited to four interactions: Predict (single-select circular radio), Multiple Choice (multi-select square controls), Number Input, and Drag & Drop. Drag & Drop supports placement into groups and dragging an item outside a group to return it to the available options. The Even/Odd reference fixture remains unchanged.

Known Phase 1 limitations: fixture interactions use demo answer rules; list/media/recap/checkbox components are not yet fully rendered; equation rendering is styled text rather than a full math engine; and the local preview is currently file-based rather than a real `/preview/:pageId` server route.

#### Phase 2 — Notion preview connection

Read the actual Notion page or export, parse supported blocks, connect the preview route to a page reference, and add diagnostics/fallback states.

#### Phase 3 — Multi-page rendering validation

Render additional test pages, record unsupported or ambiguous cases, refine shared components, and verify that new pages do not require bespoke layouts.

### Deferred and out of scope

Notion syncing, publishing/versioning, Supabase, authentication, student progress, attempts, bookmarks, analytics, admin tools, batches, payments, curriculum migration, adaptive learning, and production scaling are intentionally deferred.

## Running handoff / next actions

Phase 0 is complete and Phase 1 is substantially complete for the fixture-backed preview. The approved warm ACE design system uses `#003B30`, `#1F6B5C`, `#FAF9F6`, `#D79A2B`, and the tokens documented in the user-provided design direction. Icons are not semantic authoring rules.

### Start here for Phase 2 in a new chat

1. Read this document and `docs/ACE_PHASE_0_CONTRACT.md`.
2. Inspect the current renderer files and the canonical fixture `docs/fixtures/even-and-odd-testing.json`.
3. Define and document the Notion authoring convention for the four current interactions: Predict, Multiple Choice, Number Input, and Drag & Drop.
4. Build a Notion/export adapter that maps source blocks into the normalized `LessonDocument` / `LessonBlock` shape without inferring interactions from prose.
5. Implement page lookup for `/preview/:pageId`, with `even-and-odd-testing` as the fixture fallback.
6. Add loading, empty, fetch-error, unsupported-block, and `?debug=1` diagnostics around the adapter.
7. Test the real “Even and Odd- testing” Notion page, preserving its existing placeholders exactly.
8. Test a second lesson through the same renderer and record any ambiguous Notion structures.

Do not add Supabase, authentication, persistence, analytics, publishing, or admin workflows in Phase 2. When continuing in another chat, update this document as decisions are made; do not create parallel project summaries unless explicitly requested.

## Source record

This documentation was consolidated from the following user-provided sources:

### Pasted context files

- `/Users/tanishagarg/.codex/attachments/b0b436d3-fdbf-463f-9a06-62d8f7fb056a/pasted-text.txt` — canonical Notion maths lesson structure and teaching philosophy.
- `/Users/tanishagarg/.codex/attachments/3f873ab4-128f-42f0-80b8-78cde1f8ba16/pasted-text.txt` — ACE platform architecture, content rendering, interaction model, reading-vs-video direction, and lesson experience.
- `/Users/tanishagarg/.codex/attachments/995ab04d-a0f5-4348-8d73-87a2fb8ff8fb/pasted-text.txt` — curriculum/module structure and foundation-series decisions.

### Referenced Codex tasks

- `01a08f84-8aad-72b3-8c04-3d8dd7cef23b` — “Inspect Odd Even lesson page”. This task established the need to inspect the actual lesson source and confirmed that live Notion UI state is separate from connected workspace access.
- `01a08fbb-a5db-7660-ae37-bfdacd220e52` — “Render Even Odd lesson UI”. This task preserved the exported Even/Odd lesson structure in a student-facing prototype and established the reusable ACE shell, interaction states, placeholder preservation, responsive layout, and reduced-motion direction.

### Additional referenced material inside those tasks

- Notion page: “Even and Odd testing”.
- ACE Lesson Renderer Rules supplied in the referenced task.
- Existing prototype output: `/Users/tanishagarg/.codex/visualizations/2026/09/11/01a08fbb-a5db-7660-ae37-bfdacd220e52/ace-even-odd.html`.

## Open decisions

- Final Notion metadata format for structured interactions (the Phase 2 starting decision).
- Whether synced Notion content is stored permanently in Supabase or rendered from a published content layer.
- Authentication and batch-management requirements.
- Exact question schema for multiple choice, number input, and short explanation.
- Whether the first Even/Odd lesson should add a separate opening puzzle or remain faithful to the current export.
