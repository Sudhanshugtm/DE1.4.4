# Pre-editor red-link journey

## Goal

Add a deterministic prototype journey before the existing VisualEditor:

1. Read a Wikipedia-style article.
2. Notice and activate a red link for **Ritu Karidhal**.
3. Confirm the matching Person subject in Article Guidance.
4. Add two source URLs.
5. Read the Person community guidance.
6. Select **Start writing** and enter the existing editor.

The prototype must reproduce the visible Article Guidance sequence closely while remaining fast, offline-friendly, and isolated from ongoing VisualEditor work.

## Source of truth

- The reading scene follows ProtoWiki's article composition model: wiki chrome around hand-authored article content, built with Wikimedia Codex components and tokens.
- The setup sequence, labels, branching, source requirement, and Person guidance follow the installed `ArticleGuidance` extension.
- The Person path represents a supported Wikidata match with sufficient cross-wiki coverage. Its external data is a fixed local fixture; no Wikidata call is made.

ProtoWiki is a private standalone GPL-2.0 application, not an importable component package. This repository will therefore use its documented composition pattern and visual anatomy without copying ProtoWiki source or creating a runtime dependency on a neighboring checkout. The implementation will be original code local to this prototype.

## Scope

### In scope

- A responsive Wikipedia-like reading scene at `/article`.
- A clearly visible, underlined red link for **Ritu Karidhal** inside article prose.
- A two-stage Article Guidance route at `/article-guidance`:
  - subject confirmation;
  - sources;
  - Person instructions.
- Local-only subject, article, source, and guidance fixtures.
- A URL-based handoff contract to the existing `/editor` route.
- Keyboard, focus, and screen-reader behavior for the critical path.

### Out of scope

- Live MediaWiki, Wikidata, Citoid, REST, or source-reliability requests.
- Title-conflict, already-covered, unsupported-type, or notability-block branches.
- Persisting setup state after reload.
- Changing `EditorView.vue`, `CdxToolbar.vue`, or any other editor-owned component.
- Making the existing editor consume the handoff payload. The editor-owning work may consume it separately.

## Architecture and ownership

All new feature code lives under `src/preEditor/`:

```text
src/preEditor/
  components/
    ArticleGuidanceShell.vue
    ProtoWikiArticleShell.vue
    SourceUrlForm.vue
  data/
    personJourney.js
  flow/
    preEditorFlow.js
  views/
    ArticleGuidanceSetupView.vue
    PreEditorReadingView.vue
```

Only two integration edits are allowed outside that directory:

- `src/router/index.js`: point `/article` at the isolated reader and add `/article-guidance`.
- `src/views/HubView.vue`: make the active prototype card enter `/article` instead of `/editor`.

The existing `ReadingView.vue` stays untouched and becomes unused. No editor-owned file is changed.

## Experience design

### 1. Reading scene

The page uses a compact Wikipedia article shell with familiar header, wordmark, article title, byline metadata, section heading, body copy, and footer. The article is a local fixture about women in India's space programme. Its prose contains the red link **Ritu Karidhal**.

The red link:

- is red and underlined at rest, so meaning is not communicated by color alone;
- has a descriptive accessible label: `Ritu Karidhal — article does not exist`;
- preserves the keyboard focus indicator;
- routes to `/article-guidance?title=Ritu+Karidhal&source=redlink&variant=toolbar-outline`.

No request is made while rendering or activating the link.

### 2. Confirm subject

The setup shell presents the same hierarchy as Article Guidance:

- page title: **New article**;
- prefilled article-title field: **Ritu Karidhal**;
- one deterministic result card:
  - **Ritu Karidhal**;
  - **Indian scientist and aerospace engineer**;
  - a neutral Person/type cue.

The user selects the result card to confirm the subject. The primary action is the result itself, matching the extension's search-result interaction. A **Back** action returns to the reading scene.

### 3. Add sources

The next stage uses the extension's visible copy:

- heading: **Add sources**;
- subtitle: **Sources help readers check the facts and shows why this subject matters.**
- Person requirement: **Person articles on this wiki require sources.**
- URL field with **Paste a link to a source**;
- **Add source** and **Continue** actions;
- progress: `0 of 2 sources added`, `1 of 2 sources added`, then `2 of 2 sources added`.

Local validation accepts syntactically valid `http://` or `https://` URLs, rejects malformed URLs, and rejects exact duplicates. It does not fetch, classify, or endorse a source. Each accepted source is shown by hostname with a remove action. **Continue** remains disabled until two unique URLs have been accepted.

### 4. Community guidance

The final setup stage presents:

- heading: **Getting started with this article**;
- intro: **Here are a few tips to help you write a great article.**
- the installed Person guidance, represented as concise readable bullets:
  - explain who the person is and why they are notable, using reliable independent coverage;
  - write in the third person and maintain a neutral tone;
  - do not write about yourself, family, or friends;
- recommended and discouraged source-type summaries;
- primary action: **Start writing**.

This is guidance, not authored article content. Nothing shown on this screen is inserted into the article by this implementation.

### 5. Editor handoff

Selecting **Start writing** navigates to the existing editor without editing it:

```text
/editor?lang=en
  &variant=toolbar-outline
  &outline=person
  &title=Ritu%20Karidhal
  &articleguidance=1
  &sourceOrigin=redlink
  &source=<first URL>
  &source=<second URL>
```

Vue Router represents `source` as a two-item query array. This is the explicit boundary between the isolated pre-editor prototype and editor-owned work. The pre-editor acceptance check verifies the URL payload and that `/editor` loads; it does not claim the current editor renders or stores the payload.

## State model

`preEditorFlow.js` owns a small explicit state machine:

```text
reading -> confirmSubject -> addSources -> guidance -> editorHandoff
```

Allowed backward movement:

- `confirmSubject -> reading`;
- `addSources -> confirmSubject`;
- `guidance -> addSources`.

Forward guards:

- only the fixed Person result advances from confirmation;
- two unique valid URLs are required before guidance;
- editor handoff is generated only from the guidance stage.

Unexpected or missing route queries fall back to the fixed **Ritu Karidhal** fixture, keeping the staged path recoverable and deterministic.

## Responsive and accessible behavior

- Mobile-first single column, with a readable maximum width on desktop.
- Setup actions remain visible without covering content; no hover-only affordances.
- Semantic heading order and native form labels.
- Validation messages are associated with the URL input and announced.
- Focus moves to each new stage heading after navigation within the setup route.
- Disabled actions expose native disabled semantics.
- Red-link meaning uses color, underline, and an accessible description.
- Motion is unnecessary for the critical path.

## Verification

### Automated checks

Use Node's built-in test runner for the pure flow module:

- valid and invalid URL classification;
- duplicate prevention;
- two-source progression guard;
- backward transitions;
- exact editor handoff query.

Run the existing production build to catch Vue and bundler integration errors.

### Browser acceptance

Verify at mobile and desktop widths:

1. `/` opens the active prototype card.
2. The card opens `/article`.
3. No network-backed content is required for the article to render.
4. The red link is visible, underlined, keyboard focusable, and opens Article Guidance.
5. The title and Person result are prefilled.
6. One valid source does not enable **Continue**.
7. A duplicate is rejected.
8. Two unique valid sources enable **Continue**.
9. Person guidance appears with the expected copy.
10. **Start writing** opens `/editor` with the full handoff query and the existing editor renders.

## Acceptance boundary

The journey is complete when all browser checks pass, the production build succeeds, automated flow checks pass, and the git diff contains no changes to editor-owned files. Live Wikimedia data parity and editor-side payload consumption remain explicitly separate work.
