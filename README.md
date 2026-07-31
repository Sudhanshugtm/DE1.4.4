# DE1.4.4 — Article guidance in the visual editor

A mobile-first prototype of the DE1.4.4 hypothesis: bringing community-written
article guidance inside the Visual Editor, using the patterns the editor already
has rather than a tool beside it.

**Try it:** https://sudhanshugtm.github.io/DE1.4.4/

## What it covers

This prototype follows a junior editor from a red link into the editor. They confirm
the topic, may add sources if they have them ready, and review guidance before writing.

- **Suggested sections** — the community's outline for this topic, added a section
  at a time from the toolbar's insert menu. References comes along with the first
  section and stays last.
- **Scaffold fields** — the `[bracketed]` parts of an outline. Answering one
  answers every other field asking the same thing.
- **Source prompts** — `{{Citation needed}}` from the outline, behaving as it does
  in the editor: a citation-needed context item whose one action opens the
  citation flow, and whose citation replaces the prompt.
- **Checks** — pasted content is raised as it happens; unfilled fields are raised
  when publishing. Publishing stays out of reach until the editor has written
  something of their own.

Outlines come from
[Simple English Wikipedia](https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance),
all 38 of them. The article type can be switched from the settings control, which
stands in for the topic being known before the editor opens.

## Running it

```
npm install
npm run dev
```

The dev server also listens on the local network, so the prototype can be opened
on a phone at `http://<your-ip>:5173`.

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `npm run dev`    | Vite dev server on port 5173 |
| `npm run build`  | Production build             |
| `npm run lint`   | Oxlint + ESLint              |
| `npm run format` | Prettier                     |

## Where this sits

This repository covers the complete prototype journey: reading the Exploration
article, choosing a simulated red link, completing pre-editor guidance, and entering
the editor with the matching outline.

Built with Vue 3, TipTap and [Codex](https://doc.wikimedia.org/codex/latest/),
kept at the version MediaWiki ships so behaviour here matches behaviour there.
Editor interactions are copied from the installed VisualEditor, Cite and Citoid
extensions, production wording included, rather than invented.
