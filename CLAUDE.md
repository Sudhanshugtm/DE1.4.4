# Article Creation Editor

Vue 3 + TipTap rich text editor for Wikipedia-style article creation, styled with Wikimedia Codex design system.

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies (requires Node >=20) |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Production build |
| `npm run lint` | Oxlint + ESLint with auto-fix |
| `npm run format` | Prettier format src/ |

## Architecture

Current direction: a mobile-first prototype of Article Guidance inside the Visual
Editor. The hub lists one build; the editor opens on an empty canvas and the
toolbar `+` is the entry point to community guidance.

```
src/
  components/       # Vue SFCs (PascalCase)
  views/            # Page-level layouts (hub, article, editor, outline-lab)
  composables/      # Shared reactive logic (useEditorSettings, useEditorInstance, useTextPositionReporter)
  config/           # Static data & defaults (articleSections, editorSettings, verifiedFacts)
  extensions/       # Custom TipTap extensions (annotationHighlight)
  utils/            # Helpers (prosemirrorPositions)
  styles/           # Global CSS
  router/           # Vue Router (single "/" route)
```

## Key Files

- `src/views/HubView.vue` — Lists the prototype builds (currently one)
- `src/views/EditorView.vue` — Main layout: toolbar + editor + panel/sheet orchestration
- `src/components/TextEditor.vue` — TipTap editor; owns the Source-prompt click handler
- `src/components/OutlinePopover.vue` — Bottom sheet holding suggested sections / facts / references
- `src/components/OutlineStructureList.vue` — Suggested sections, rendered from a community outline
- `src/components/OutlineSelector.vue` — Outline (topic type) picker; `showIntro` prop hides its heading
- `src/components/SourceContextSheet.vue` — Citation-needed context item for Source prompts
- `src/components/VerifiedFactsList.vue` — Wikidata facts panel
- `src/components/CdxToolbar.vue` — Top toolbar (formatting, outline entry, publish)
- `src/components/SettingsDialog.vue` — Prototype settings: article outline switcher
- `src/components/CiteDialog.vue` — Citation dialog with tabs; emits `citation-created`
- `src/config/outlines/simpleEnglish.js` — All Simple English outlines (structure + sources)
- `src/utils/outlineWikitext.js` — Outline wikitext → editor HTML (emits Source prompts)
- `src/composables/useEditorInstance.js` — Global TipTap editor ref, shared across components
- `src/composables/useEditorSettings.js` — Settings ↔ URL query param sync
- `src/config/editorSettings.js` — Default settings + display labels
- `src/config/articleSections.js` — Article section templates (Siberian tiger content)
- `src/extensions/annotationHighlight.js` — Custom TipTap mark extension

## UI Components (Codex)

All UI uses Wikimedia Codex (`@wikimedia/codex`). Available components already imported:

CdxButton, CdxIcon, CdxMenuButton, CdxPopover, CdxAccordion, CdxCard, CdxDialog, CdxLabel, CdxRadio, CdxTabs, CdxTab, CdxSearchInput

Icons from `@wikimedia/codex-icons`:
cdxIconAdd, cdxIconSettings, cdxIconClose, cdxIconUndo, cdxIconTextStyle, cdxIconExpand, cdxIconQuotes, cdxIconLink, cdxIconEdit, cdxIconNext, cdxIconListBullet, cdxIconCheckAll, cdxIconReference, cdxIconLogoWikidata

## Styling

- All styling uses Codex CSS custom properties — never hardcode colors/spacing
- Token categories: `--color-*`, `--background-color-*`, `--border-*`, `--spacing-*`, `--font-*`, `--line-height-*`
- Common tokens: `--color-base`, `--color-subtle`, `--color-progressive`, `--background-color-neutral-subtle`, `--spacing-50/75/100`, `--font-family-system-sans`, `--font-family-serif`
- Use `:deep()` in `<style scoped>` to override Codex component internals
- Scoped styles are the default — every component uses `<style scoped>`

## Code Style

- No semicolons, single quotes, 100 char width (Prettier)
- 2-space indentation, PascalCase .vue files, camelCase .js files
- All components use `<script setup>` syntax
- Props: `defineProps({ name: { type: String, required: true } })`
- Emits: `defineEmits(['content-inserted', 'close'])`
- V-model: `defineModel('open', { type: Boolean, default: false })`
- Reactive state: `ref()` for primitives, `computed()` for derived

## Layout System

EditorView uses a sliding panel pattern:
- `.editor-wrapper` is a flex row with two full-width columns (editor + rail)
- Opening the rail applies `translateX(calc(-100vw + 88px))` with 0.3s ease transition
- Clicking the main editor area closes the rail
- Alternative: popover mode shows outline as a CdxPopover instead of the rail

## Settings System

State lives in URL query params only (no localStorage/DB), so any state is shareable
as a link.

`SettingsDialog` now carries only the **article outline** switcher: it writes
`?outline=<id>` and the panel reads it, defaulting to `person`. In the real flow the
topic type is known before the editor opens, so this exists for prototyping only.

`src/config/editorSettings.js` and `useEditorSettings()` still back the remaining
defaults (`outline.location`, `outline.persistence`, `entryPoint.autoFocus`) which are
now set in code rather than exposed as UI. To surface a setting again: add its label in
`editorSettings.js`, add a control in `SettingsDialog.vue`, consume via
`useEditorSettings()`.

## Behaviour borrowed from Visual Editor

Interactions mirror how real VE behaves, so the prototype stays a preview of the same
system rather than a lookalike:

- **Source prompts** (rendered from `{{Citation needed}}` in an outline) behave like
  `MWCitationNeededContextItem`: tap → context item titled "Citation needed" with a
  single progressive "Add a citation" action → cite dialog → the created citation
  **replaces** the prompt (VE opens Citoid with `replace: true`).
- **Panels** follow `ve.ui.MobileContext`: a bottom sheet with a close button.

When adding a behaviour, check the installed extension first
(`extensions/VisualEditor`, `extensions/Cite`, `extensions/Citoid`) and copy the
production strings rather than inventing new ones.

## Content Insertion Pattern

Components that insert content into the editor:
1. Import `useEditorInstance()` to get the TipTap editor ref
2. Call editor methods to insert content (e.g., `editor.value.commands.insertContent()`)
3. Emit `'content-inserted'` event
4. EditorView handles closing/keeping-open the panel based on `outline.persistence` setting

## Gotchas

- TipTap heading levels 2-4 only (h1 disabled in StarterKit config)
- No test framework configured — no tests exist
- `import.meta.env.DEV` exposes editor to `window.__editor` for console debugging
- Floating button width changes dynamically: 220px (quiet+animated) → 32px (icon-only or post-typing)
- ProseMirror positions ≠ text offsets — use `src/utils/prosemirrorPositions.js` for conversion
- Deployed on Vercel as SPA (rewrites all routes to /index.html)
