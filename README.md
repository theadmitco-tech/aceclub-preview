# ACE renderer — Phase 1

Fixture-backed implementation of the shared ACE lesson shell. It provides H2-based navigation, deterministic section IDs, normalized-block rendering, placeholder preservation, explicit unsupported-block diagnostics, responsive layout, keyboard focus, and reduced-motion support.

Run locally from this directory with any static server, for example:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173/preview/even-and-odd-testing`. The Vercel rewrite in `vercel.json` keeps `/preview/:pageId` refreshable on deployment.

For the Notion “Open ACE Preview” button, use the deployed URL followed by the Notion page ID, for example:

```text
https://your-deployment.vercel.app/preview/3d88595d9d4c80fbbd97df2f625f35d1
```
