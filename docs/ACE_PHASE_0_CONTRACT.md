# ACE Phase 0 — Notion-to-Frontend Contract

Status: **frozen for Phase 1 implementation**  
Date: 2026-09-11  
Reference lesson: **Even and Odd- testing**

This document is the implementation contract for the preview renderer. It deliberately defines a small, deterministic surface. Content that is not covered here must be preserved as unsupported content or reported diagnostically; it must not be guessed into an interaction.

## 1. Preview route contract

The preview route is:

```text
/preview/:pageId
```

Examples:

```text
/preview/even-and-odd-testing
/preview/<notion-page-id>
```

`pageId` is opaque to the renderer. Slugs are acceptable for fixtures; Notion IDs are acceptable when the live connector is added in Phase 2. The route must be refreshable and shareable. A Notion preview button or link must open this route in a new browser context only when the author explicitly configures that behaviour; the renderer must not depend on Notion UI state.

Optional query parameters are reserved for diagnostics and must not change student-facing content:

```text
?debug=1
```

Unknown query parameters are ignored.

## 2. Navigation contract

- The page title is rendered once as the lesson title.
- Every authored **H2** becomes one left-navigation entry, in source order.
- Content belongs to the most recent H2 until the next H2.
- Content before the first H2 belongs to an implicit `intro` section and is rendered above the navigation sections.
- H3 and H4 remain nested content and never create left-navigation entries.
- Navigation IDs are generated from the visible heading text using lowercase kebab case.
- Duplicate generated IDs receive a numeric suffix: `try-it-yourself`, `try-it-yourself-2`, `try-it-yourself-3`.
- IDs are generated once per page and remain stable for the page's authored heading order.
- Selecting a navigation entry displays that section and updates its active state. It must not mutate authored content.

## 3. Supported block contract

| Source block | Required frontend component | Behaviour |
|---|---|---|
| Page title | `LessonTitle` | Render as the lesson heading. |
| H2 | `LessonSection` + `SectionNavItem` | Starts a navigable section. |
| H3/H4 | `NestedHeading` | Preserves hierarchy inside the current section. |
| Paragraph | `RichText` | Preserves authored order and inline emphasis/links. |
| Bulleted/numbered list | `List` | Preserves list type, order, and nesting. |
| Equation or equation paragraph | `MathBlock` / inline math | Render as mathematics; never silently flatten to plain text. |
| Callout with informational emphasis | `InsightCallout` | Informational emphasis; no interaction inferred. |
| Callout with explicit activity metadata | `Activity` | Interactive only when a supported activity schema is present. |
| Toggle | `Reveal` | Closed by default; reveals authored solution/reasoning. |
| Callout explicitly authored as recap or memory check | `RecapCallout` | Recap or memory-check summary. |
| Image/GIF with source | `LearningMedia` | Preserve alt text and source dimensions when available. |
| Divider | `Divider` | Visual separation only. |
| Checkbox | `Checkbox` | Render as authored content unless explicit retrieval/completion metadata exists. |
| Any other block | `UnsupportedBlock` | Preserve a diagnostic placeholder; never crash or invent semantics. |

Plain prose is never promoted to a question, answer control, completion state, or activity.

## 4. Minimum normalized data shape

Phase 1 may use fixtures, but fixtures must normalize into this shape so the renderer is independent of the source adapter:

```ts
type LessonDocument = {
  id: string;
  title: string;
  source: { type: 'fixture' | 'notion-export' | 'notion'; ref: string };
  blocks: LessonBlock[];
};

type LessonBlock = {
  id: string;
  type:
    | 'heading-2' | 'heading-3' | 'heading-4' | 'paragraph'
    | 'bulleted-list' | 'numbered-list' | 'equation'
    | 'callout' | 'activity' | 'toggle' | 'media'
    | 'divider' | 'checkbox' | 'unsupported';
  text?: string;
  children?: LessonBlock[];
  metadata?: Record<string, unknown>;
};
```

Adapters may retain raw source data in `metadata`, but renderer decisions must use the normalized fields and explicit metadata only.

## 5. Interaction rules

- Reveals are closed initially and expose authored solution/reasoning only after activation.
- An activity must have explicit metadata identifying its type and answer/feedback model.
- Activity state is local to the preview session in Phase 1; persistence is out of scope.
- Feedback must include text or an icon, not colour alone.
- Every interactive control has a visible keyboard focus state and an accessible name.
- Reduced-motion preferences disable non-essential transitions.
- Missing activity metadata renders the content as an informational `UnsupportedBlock` diagnostic rather than an invented activity.

## 5a. Authoring markers

These are the minimum semantic markers the source adapter may rely on. A heading or sentence by itself is not an interaction marker.

| Authoring convention | Normalized meaning | Renderer rule |
|---|---|---|
| Native Notion toggle block | `toggle` | Render closed initially as a `Reveal`; toggle children are the authored solution/reasoning. |
| Callout with explicit activity metadata | `activity` | Render as an interactive activity using the declared type and answer model. |
| Callout without activity metadata | `callout` | Render as a prompt/instructional callout; do not create answer controls. |
| Callout explicitly authored as recap or memory check | `recap` | Render as recap or memory-check content; no interaction inferred. |
| Placeholder text such as `[questions to be added here]` or `[MCQs to be added here]` | `placeholder` | Render the exact text visibly and mark it non-interactive. |
| Ordinary prose containing a question | `paragraph` | Render as prose unless it is inside a native toggle or explicitly marked activity. |
| Text such as `Show the solution` in a Markdown list | source-dependent | Treat as ordinary content unless the adapter can prove it came from a toggle/reveal structure. |

For structured activity metadata, the normalized block must declare at least:

```ts
type ActivityMetadata = {
  activityType: 'predict' | 'classify' | 'calculate' | 'explain' | 'multiple-choice' | 'number-input';
  answer?: unknown;
  options?: Array<{ id: string; label: string }>;
  feedback?: { correct?: string; incorrect?: string; retry?: string };
};
```

If any required activity semantics are missing, the renderer preserves the content as non-interactive instructional content and emits a diagnostic in debug mode.

## 6. Reference lesson freeze

The canonical Phase 1 fixture is `even-and-odd-testing`. It must preserve these authored concepts, in order:

1. Definitions of even and odd integers.
2. Zero and negative integers.
3. `x = 2a` and `y = 2b + 1`, where `a,b ∈ ℤ`.
4. Why `2b + 3` is still the same odd form.
5. Why `2b + 2` is even.
6. The useful-assumption callout.
7. Addition and subtraction parity rules.
8. Multiplication parity rules.
9. The challenge `y = x² + 3x`.
10. The memory-check key takeaway.

The first “Try it yourself” section and “Practise” section contain placeholders. The renderer must display those placeholders exactly as supplied by the source fixture and must not fabricate questions, answer choices, solutions, or controls.

## 7. Loading and failure states

The route must have explicit states for:

- loading;
- empty document;
- document-not-found or fetch failure; and
- unsupported block(s).

An unsupported block is non-fatal. A document-level failure is actionable and should include the page reference and a retry affordance where the source adapter supports retrying.

## 8. Phase boundary

Phase 0 is complete when this contract and the reference fixture are committed. Phase 1 may implement the shell and components against the normalized shape. Phase 2 may add Notion reads and adapters without changing the student-facing contract; any contract change requires a versioned update here.
