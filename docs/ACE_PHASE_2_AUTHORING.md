# ACE Phase 2 — Notion authoring convention

The adapter accepts a Notion export JSON file through `?source=/path-or-url.json`.
The export may contain Notion API blocks (`paragraph`, `heading_2`, `callout`, `toggle`,
`image`, `to_do`, and list items) or the normalized Phase 0 shape.

Interactions are never inferred from wording. A callout becomes an activity only when
its exported metadata contains an explicit `activity` object (or `activityType`). The
object must include `activityType`; options and answer/feedback fields are optional
until the interaction renderer supports them. A normal callout remains informational.

Use native Notion toggles for solutions and reasoning. Use native headings for structure:
H2 creates left navigation, while H3/H4 stay nested. Use a visible placeholder such as
`[Placeholder: authored activity content will be added in Notion.]` when content is not
ready; the exact text is preserved and no controls are created.

Preview examples:

```text
/preview/even-and-odd-testing
/preview/<notion-page-id>?source=/exports/lesson.json
/preview/<notion-page-id>?source=https://example.test/lesson.json&debug=1
```

Live Notion API access is intentionally kept outside the browser preview: a server or
export job should fetch the page and expose the JSON export to this adapter. Credentials,
syncing, persistence, and publishing are out of scope for Phase 2.
