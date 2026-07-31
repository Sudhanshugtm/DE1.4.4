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
- The setup sequence, labels, branching, source requirement, and Person guidance follow the installed `ArticleGuidance` extension at commit `6bde39a`, frozen into this prototype on 2026-07-31.
- The Person path represents a supported Wikidata match with sufficient cross-wiki coverage. Its external data is a fixed local fixture; no Wikidata call is made.

ProtoWiki is a private standalone GPL-2.0 application, not an importable component package. This repository will therefore use its documented composition pattern and visual anatomy without copying ProtoWiki source or creating a runtime dependency on a neighboring checkout. The implementation will be original code local to this prototype.

## Scope

### In scope

- A responsive Wikipedia-like reading scene at `/article`.
- A clearly visible, underlined red link for **Ritu Karidhal** inside article prose.
- A three-screen Article Guidance route at `/article-guidance`:
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

All new runtime feature code lives under `src/preEditor/`:

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

### Fixture contract

`personJourney.js` exports one deeply immutable object with this shape:

```js
{
  article: {
    title,
    description,
    sections: [ { heading, paragraphs: [ [ { text, missingLink } ] ] } ]
  },
  subject: {
    key,
    title,
    description,
    typeLabel,
    articleType,
    sitelinkCount
  },
  sourceRequirements: {
    requiredCount,
    recommended,
    discouraged
  },
  guidance: {
    heading,
    intro,
    bullets
  },
  handoff: {
    lang,
    variant,
    outline
  }
}
```

The `missingLink` flag identifies the single inline article segment rendered as the red link. `articleType` is `Q5` and `sitelinkCount` is fixed above the five-sitelink cross-wiki threshold. These values represent the successful Person branch; they are not presented as live Wikidata data.

### Unit interfaces

- `preEditorFlow.js` owns the pure behavior. It exports:
  - `STEPS`;
  - `createFlowState(fixture, initialTitle)`;
  - `findSubject(fixture, title)`;
  - `validateSourceUrl(rawUrl, existingSources)`;
  - `addSource(state, rawUrl)`;
  - `removeSource(state, normalizedUrl)`;
  - `canEnterStep(state, step)`;
  - `buildEditorQuery(state, fixture)`.
- `ProtoWikiArticleShell.vue` receives the `article` fixture as a prop and emits `activate-missing-link` with the missing-link text. It owns only wiki chrome, article rendering, and link semantics.
- `ArticleGuidanceShell.vue` receives `step`, `heading`, and `backLabel` props and emits `back`. It owns shared setup width, header, progress context, and back navigation control.
- `SourceUrlForm.vue` receives `modelValue`, `error`, `sources`, and `requiredCount`; it emits `update:modelValue`, `submit`, and `remove`. It owns form rendering but no source validation or flow state.
- `PreEditorReadingView.vue` converts `activate-missing-link` into the Article Guidance route.
- `ArticleGuidanceSetupView.vue` is the sole coordinator. It parses route queries, owns the in-memory flow state and URL-input value, calls the pure flow API, synchronizes the `step` query, moves focus, and creates the editor navigation.

## Experience design

### 1. Reading scene

The page uses a compact Wikipedia article shell with familiar header, wordmark, article title, origin metadata, section heading, body copy, and footer. The frozen article fixture is:

- title: **Women in the Indian space programme**;
- description: **From Wikipedia, the free encyclopedia**;
- lead: **Women have worked across science, engineering, mission operations, and administration in India's space programme. Their roles became especially visible through the Mars Orbiter Mission and later lunar missions.**
- section heading: **Notable contributors**;
- section text: **Mission teams have included engineers such as Muthayya Vanitha, Nandini Harinath, and Ritu Karidhal, who took leadership roles on major projects. Their work spans navigation, spacecraft operations, communications, and mission planning.**

**Ritu Karidhal** is the only segment marked as the missing article.

The red link:

- is red and underlined at rest, so meaning is not communicated by color alone;
- has a descriptive accessible label: `Ritu Karidhal — article does not exist`;
- preserves the keyboard focus indicator;
- routes to `/article-guidance?step=subject&title=Ritu+Karidhal&source=redlink&variant=toolbar-outline`.

No request is made while rendering or activating the link.

### 2. Confirm subject

The setup shell presents the same hierarchy as Article Guidance:

- page title: **New article**;
- editable, prefilled article-title field: **Ritu Karidhal**;
- one deterministic result card:
  - **Ritu Karidhal**;
  - **Indian scientist and aerospace engineer**;
  - a neutral Person/type cue.

The result appears only when the trimmed, case-insensitive field value is `Ritu Karidhal`. Any other non-empty value shows **No subjects found for "{title}"** and an empty value shows no result or error. Editing never triggers a request. Returning the field to the fixture title restores the result.

The user selects the result card to confirm the subject. Selection canonicalizes the article title to **Ritu Karidhal** and advances to Sources. The primary action is the result itself, matching the extension's search-result interaction. A **Back** action returns to the reading scene.

### 3. Add sources

The next stage uses the extension's visible copy:

- heading: **Add sources**;
- subtitle: **Sources help readers check the facts and shows why this subject matters.**
- Person requirement: **Person articles on this wiki require sources.**
- URL field with **Paste a link to a source**;
- **Add source** and **Continue** actions;
- progress: `0 of 2 sources added`, `1 of 2 sources added`, then `2 of 2 sources added`.

Local validation trims surrounding whitespace, parses with the platform `URL` constructor, and accepts only `http://` or `https://`. The normalized `URL.href` is the stored value and duplicate key. Malformed or unsupported input remains editable and shows **Enter a valid URL**; a duplicate remains editable and shows **This source has already been added**. A successful add clears the field and its error.

The prototype does not fetch, classify, or endorse a source. Each accepted source is shown by hostname with a remove action. Removing a source immediately updates progress and disables **Continue** below two sources; a removed URL can be added again. **Continue** remains disabled until two unique URLs have been accepted.

### 4. Community guidance

The final setup stage presents:

- heading: **Getting started with this article**;
- intro: **Here are a few tips to help you write a great article.**
- the installed Person guidance, represented as concise readable bullets:
  - explain who the person is and why they are notable, using reliable independent coverage;
  - write in the third person and maintain a neutral tone;
  - do not write about yourself, family, or friends;
- recommended source types:
  - established encyclopaedias and biographical dictionaries;
  - official government or parliamentary records;
  - academic or peer-reviewed publications;
  - major newswires and outlets with editorial standards;
- discouraged source types:
  - social media platforms and posts;
  - blogs and personal websites;
  - fan sites and fandom wikis;
  - promotional material, press releases, and marketing content;
- primary action: **Start writing**.

The guidance and source-type lists are a frozen local representation of `outlines/Person.txt` at ArticleGuidance commit `6bde39a`. This is guidance, not authored article content. Nothing shown on this screen is inserted into the article by this implementation.

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

### Route and history behavior

The setup route uses `step=subject|sources|guidance`. Forward transitions use `router.push`, giving each screen a browser-history entry. The view watches the route query and renders the matching permitted state, so native browser Back moves from Guidance to Sources to Subject to the article while the mounted in-memory state is retained.

The shared **Back** control uses `router.back()` on Sources and Guidance. On Subject it uses `router.back()` when the recorded previous URL is `/article`; otherwise it replaces the current entry with `/article`. This keeps a directly opened setup URL recoverable without creating a Back loop.

Direct entry and refresh behave as follows:

- missing or invalid `step` becomes `subject` with `router.replace`;
- `title` initializes the editable field when it is a string; a missing title uses **Ritu Karidhal**;
- unknown queries are ignored;
- direct or refreshed entry to Sources or Guidance lacks prerequisite in-memory state and is replaced with Subject while retaining the initial title, source, and variant queries;
- returning from `/editor` by browser Back also restarts at Subject because setup state is intentionally not persisted.

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

Use Node's built-in test runner in `tests/preEditor/preEditorFlow.test.js`:

- valid and invalid URL classification;
- duplicate prevention;
- two-source progression guard;
- backward transitions;
- exact editor handoff query.

Run it with `node --test tests/preEditor/preEditorFlow.test.js`.

Run the existing production build to catch Vue and bundler integration errors.

### Browser acceptance

Verify at mobile and desktop widths:

1. `/` opens the active prototype card.
2. The card opens `/article`.
3. No network-backed content is required for the article to render.
4. The red link is visible, underlined, keyboard focusable, and opens Article Guidance.
5. The title and Person result are prefilled.
6. Editing the title away hides the result and restoring it returns the result.
7. A malformed URL remains in the field with the exact validation message.
8. One valid source does not enable **Continue**.
9. A duplicate is rejected with the exact duplicate message.
10. Two unique valid sources enable **Continue**.
11. Removing and re-adding a source updates progress and gating.
12. Internal and browser Back follow the specified screen order.
13. Refreshing Sources or Guidance safely resets to Subject.
14. Person guidance appears with the expected frozen copy.
15. **Start writing** opens `/editor` with the full handoff query and the existing editor renders.

## Acceptance boundary

The journey is complete when all browser checks pass, the production build succeeds, automated flow checks pass, and the git diff contains no changes to editor-owned files. Live Wikimedia data parity and editor-side payload consumption remain explicitly separate work.
