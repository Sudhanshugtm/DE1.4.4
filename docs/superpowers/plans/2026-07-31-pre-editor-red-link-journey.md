# Pre-editor Red-link Journey Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic Wikipedia article -> red link -> Article Guidance -> existing editor journey without modifying editor-owned files.

**Architecture:** Put all runtime feature code under `src/preEditor/`. Keep fixture data and flow rules pure and testable, use Vue views only as routing/state coordinators, and use Codex components plus scoped CSS for the ProtoWiki-style article shell and Article Guidance screens. The only runtime integration edits outside the feature folder are the router and hub card.

**Tech Stack:** Vue 3, Vue Router, Wikimedia Codex 2.3, Codex design tokens/icons, Node built-in test runner, Playwright available on the local machine, Vite.

**Required skills:** @superpowers:test-driven-development, @design-to-code-craft, @browser:control-in-app-browser, @superpowers:verification-before-completion

**Spec:** `docs/superpowers/specs/2026-07-31-pre-editor-red-link-journey-design.md`

---

## Guardrails

- Do not edit `src/views/EditorView.vue`, `src/components/CdxToolbar.vue`, or any editor-owned component.
- `src/components/CdxToolbar.vue` already has a concurrent uncommitted change; preserve it and never stage it.
- Never use `git add .`; stage the exact pre-editor, router, hub, test, or documentation paths only.
- Do not copy code from the GPL-2.0 ProtoWiki checkout. Implement the approved composition pattern with original Vue/CSS.
- Do not call Wikimedia, Wikidata, REST, Citoid, or source-validation services.
- Use Codex tokens for color, spacing, type, border, and state styling. The red link must also be underlined.
- Keep DOM source order equal to visual and keyboard order.

## File map

| File | Responsibility |
|---|---|
| `src/preEditor/data/personJourney.js` | Frozen article, Person, source-tip, guidance, and handoff fixture |
| `src/preEditor/flow/preEditorFlow.js` | Pure matching, URL validation, source mutation, guards, and editor query |
| `src/preEditor/components/ProtoWikiArticleShell.vue` | Semantic Wikipedia/ProtoWiki-style article chrome and missing-link emission |
| `src/preEditor/components/ArticleGuidanceShell.vue` | Shared setup header, back control, focused heading, and content container |
| `src/preEditor/components/SourceUrlForm.vue` | Codex URL input, error association, source list, progress, and add/remove events |
| `src/preEditor/views/PreEditorReadingView.vue` | Binds fixture article to the reader shell and routes the red link |
| `src/preEditor/views/ArticleGuidanceSetupView.vue` | Owns in-memory flow state, route/history guards, screen rendering, focus, and handoff |
| `tests/preEditor/preEditorFlow.test.js` | Pure behavior regression tests |
| `tests/preEditor/preEditorJourney.browser.mjs` | End-to-end critical-path browser acceptance |
| `src/router/index.js` | Routes `/article` to the isolated reader and adds `/article-guidance` |
| `src/views/HubView.vue` | Makes the active prototype card enter the article |

---

## Chunk 1: Deterministic fixture and flow

### Task 1: Write the pure-flow tests first

**Files:**
- Create: `tests/preEditor/preEditorFlow.test.js`
- Create after the red run: `src/preEditor/data/personJourney.js`
- Create after the red run: `src/preEditor/flow/preEditorFlow.js`

- [ ] **Step 1: Create the failing behavior test**

Write Node tests that import the fixture and these exports:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { personJourney } from '../../src/preEditor/data/personJourney.js'
import {
  SOURCE_ERRORS,
  STEPS,
  addSource,
  buildEditorQuery,
  canEnterStep,
  createFlowState,
  findSubject,
  removeSource,
  validateSourceUrl,
} from '../../src/preEditor/flow/preEditorFlow.js'

test('fixture freezes the supported Person path', () => {
  assert.equal(personJourney.subject.title, 'Ritu Karidhal')
  assert.equal(personJourney.subject.articleType, 'Q5')
  assert.equal(personJourney.subject.sitelinkCount, 8)
  assert.equal(personJourney.sourceRequirements.requiredCount, 2)
  assert.equal(Object.isFrozen(personJourney), true)
  assert.equal(Object.isFrozen(personJourney.article.sections), true)
  assert.equal(Object.isFrozen(personJourney.guidance.bullets), true)
})

test('findSubject matches the fixed title after trimming and case folding', () => {
  assert.equal(findSubject(personJourney, '  ritu karidhal  '), personJourney.subject)
  assert.equal(findSubject(personJourney, 'Different person'), null)
  assert.equal(findSubject(personJourney, ''), null)
})

test('validateSourceUrl accepts only normalized http and https URLs', () => {
  assert.deepEqual(validateSourceUrl(' example.com ', []), {
    valid: false,
    error: SOURCE_ERRORS.INVALID,
  })
  assert.deepEqual(validateSourceUrl('ftp://example.com/story', []), {
    valid: false,
    error: SOURCE_ERRORS.INVALID,
  })
  assert.deepEqual(validateSourceUrl(' HTTPS://Example.com/story ', []), {
    valid: true,
    source: {
      url: 'https://example.com/story',
      domain: 'example.com',
    },
  })
  assert.deepEqual(validateSourceUrl('http://Example.org', []), {
    valid: true,
    source: {
      url: 'http://example.org/',
      domain: 'example.org',
    },
  })
})

test('validateSourceUrl rejects a normalized duplicate', () => {
  const existing = [{ url: 'https://example.com/story', domain: 'example.com' }]
  assert.deepEqual(validateSourceUrl('https://EXAMPLE.com/story', existing), {
    valid: false,
    error: SOURCE_ERRORS.DUPLICATE,
  })
})

test('adding and removing sources returns new state without mutating the old state', () => {
  const initial = createFlowState(personJourney, personJourney.subject.title)
  const selected = { ...initial, selectedSubject: personJourney.subject, step: STEPS.SOURCES }
  const first = addSource(selected, 'https://example.com/one')
  assert.equal(first.error, '')
  assert.equal(selected.sources.length, 0)
  assert.equal(first.state.sources.length, 1)

  const removed = removeSource(first.state, 'https://example.com/one')
  assert.equal(removed.sources.length, 0)
  assert.equal(first.state.sources.length, 1)

  const readded = addSource(removed, 'https://EXAMPLE.com/one')
  assert.equal(readded.error, '')
  assert.equal(readded.state.sources.length, 1)
})

test('step guards require a subject and then two sources', () => {
  const initial = createFlowState(personJourney, personJourney.subject.title)
  assert.equal(canEnterStep(initial, STEPS.SUBJECT), true)
  assert.equal(canEnterStep(initial, STEPS.SOURCES), false)

  const selected = { ...initial, selectedSubject: personJourney.subject }
  assert.equal(canEnterStep(selected, STEPS.SOURCES), true)
  assert.equal(canEnterStep(selected, STEPS.GUIDANCE), false)

  const ready = {
    ...selected,
    sources: [
      { url: 'https://example.com/one', domain: 'example.com' },
      { url: 'https://example.org/two', domain: 'example.org' },
    ],
  }
  assert.equal(canEnterStep(ready, STEPS.GUIDANCE), true)
})

test('earlier steps remain permitted during backward navigation', () => {
  const ready = {
    ...createFlowState(personJourney, personJourney.subject.title),
    step: STEPS.GUIDANCE,
    selectedSubject: personJourney.subject,
    sources: [
      { url: 'https://example.com/one', domain: 'example.com' },
      { url: 'https://example.org/two', domain: 'example.org' },
    ],
  }

  assert.equal(canEnterStep(ready, STEPS.SOURCES), true)
  assert.equal(canEnterStep(ready, STEPS.SUBJECT), true)
})

test('editor handoff contains the fixed Person contract and both sources', () => {
  const state = {
    ...createFlowState(personJourney, personJourney.subject.title),
    step: STEPS.GUIDANCE,
    selectedSubject: personJourney.subject,
    sources: [
      { url: 'https://example.com/one', domain: 'example.com' },
      { url: 'https://example.org/two', domain: 'example.org' },
    ],
  }

  assert.deepEqual(buildEditorQuery(state, personJourney), {
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'person',
    title: 'Ritu Karidhal',
    articleguidance: '1',
    sourceOrigin: 'redlink',
    source: ['https://example.com/one', 'https://example.org/two'],
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test tests/preEditor/preEditorFlow.test.js
```

Expected: non-zero exit with `ERR_MODULE_NOT_FOUND` for `personJourney.js` or `preEditorFlow.js`. This is the expected first failure because production modules do not exist.

- [ ] **Step 3: Add the exact frozen fixture**

Create `personJourney.js` with a recursive `deepFreeze` helper and one exported fixture:

```js
function deepFreeze(value) {
  Object.freeze(value)
  Object.values(value).forEach((child) => {
    if (child && typeof child === 'object' && !Object.isFrozen(child)) {
      deepFreeze(child)
    }
  })
  return value
}

export const personJourney = deepFreeze({
  article: {
    title: 'Women in the Indian space programme',
    description: 'From Wikipedia, the free encyclopedia',
    sections: [
      {
        heading: '',
        paragraphs: [[
          {
            text: "Women have worked across science, engineering, mission operations, and administration in India's space programme. Their roles became especially visible through the Mars Orbiter Mission and later lunar missions.",
            missingLink: false,
          },
        ]],
      },
      {
        heading: 'Notable contributors',
        paragraphs: [[
          { text: 'Mission teams have included engineers such as Muthayya Vanitha, Nandini Harinath, and ', missingLink: false },
          { text: 'Ritu Karidhal', missingLink: true },
          { text: ', who took leadership roles on major projects. Their work spans navigation, spacecraft operations, communications, and mission planning.', missingLink: false },
        ]],
      },
    ],
  },
  subject: {
    key: 'ritu-karidhal',
    title: 'Ritu Karidhal',
    description: 'Indian scientist and aerospace engineer',
    typeLabel: 'Person',
    articleType: 'Q5',
    sitelinkCount: 8,
  },
  sourceRequirements: {
    requiredCount: 2,
    recommended: [
      'Established encyclopaedias and biographical dictionaries',
      'Official government or parliamentary records',
      'Academic or peer-reviewed publications',
      'Major newswires and outlets with editorial standards',
    ],
    discouraged: [
      'Social media platforms and posts',
      'Blogs and personal websites',
      'Fan sites and fandom wikis',
      'Promotional material, press releases, and marketing content',
    ],
  },
  guidance: {
    heading: 'Getting started with this article',
    intro: 'Here are a few tips to help you write a great article.',
    bullets: [
      'Start with who this person is and why they are notable. Use reliable, independent sources that cover the person in depth.',
      'Write in the third person and keep a neutral tone throughout.',
      "Don't write about yourself, your family, or your friends.",
    ],
  },
  handoff: {
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'person',
  },
})
```

- [ ] **Step 4: Implement the minimal immutable flow API**

Create `preEditorFlow.js` with:

```js
export const STEPS = Object.freeze({
  SUBJECT: 'subject',
  SOURCES: 'sources',
  GUIDANCE: 'guidance',
})

export const SOURCE_ERRORS = Object.freeze({
  INVALID: 'Enter a valid URL',
  DUPLICATE: 'This source has already been added',
})

export function createFlowState(fixture, initialTitle = fixture.subject.title) {
  return {
    step: STEPS.SUBJECT,
    titleInput: initialTitle,
    selectedSubject: null,
    sources: [],
    requiredSourceCount: fixture.sourceRequirements.requiredCount,
  }
}

export function findSubject(fixture, title) {
  const candidate = String(title ?? '').trim().toLocaleLowerCase()
  return candidate === fixture.subject.title.toLocaleLowerCase() ? fixture.subject : null
}

export function validateSourceUrl(rawUrl, existingSources) {
  let parsed
  try {
    parsed = new URL(String(rawUrl ?? '').trim())
  } catch {
    return { valid: false, error: SOURCE_ERRORS.INVALID }
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: SOURCE_ERRORS.INVALID }
  }
  const source = { url: parsed.href, domain: parsed.hostname }
  if (existingSources.some((item) => item.url === source.url)) {
    return { valid: false, error: SOURCE_ERRORS.DUPLICATE }
  }
  return { valid: true, source }
}

export function addSource(state, rawUrl) {
  const validation = validateSourceUrl(rawUrl, state.sources)
  if (!validation.valid) {
    return { state, error: validation.error }
  }
  return {
    state: { ...state, sources: [...state.sources, validation.source] },
    error: '',
  }
}

export function removeSource(state, normalizedUrl) {
  return {
    ...state,
    sources: state.sources.filter((source) => source.url !== normalizedUrl),
  }
}

export function canEnterStep(state, step) {
  if (step === STEPS.SUBJECT) return true
  if (step === STEPS.SOURCES) return Boolean(state.selectedSubject)
  if (step === STEPS.GUIDANCE) {
    return (
      Boolean(state.selectedSubject) && state.sources.length >= state.requiredSourceCount
    )
  }
  return false
}

export function buildEditorQuery(state, fixture) {
  if (!canEnterStep(state, STEPS.GUIDANCE) || state.step !== STEPS.GUIDANCE) {
    throw new Error('Editor handoff requires the guidance step')
  }
  return {
    ...fixture.handoff,
    title: state.selectedSubject.title,
    articleguidance: '1',
    sourceOrigin: 'redlink',
    source: state.sources.map((source) => source.url),
  }
}
```

- [ ] **Step 5: Run the test and verify GREEN**

Run `node --test tests/preEditor/preEditorFlow.test.js`.

Expected: 8 tests, 8 pass, 0 fail.

- [ ] **Step 6: Format and re-run**

Run:

```bash
npx prettier --write src/preEditor/data/personJourney.js src/preEditor/flow/preEditorFlow.js tests/preEditor/preEditorFlow.test.js
node --test tests/preEditor/preEditorFlow.test.js
```

Expected: formatter succeeds and all 8 tests still pass.

- [ ] **Step 7: Commit only the deterministic model**

```bash
git add src/preEditor/data/personJourney.js src/preEditor/flow/preEditorFlow.js tests/preEditor/preEditorFlow.test.js
git commit -m "Add deterministic pre-editor journey model"
```

---

## Chunk 2: Reader, setup screens, routing, and verification

### Task 2: Write the browser acceptance tests before UI code

**Files:**
- Create: `tests/preEditor/preEditorJourney.browser.mjs`

- [ ] **Step 1: Confirm or start the local test server**

Resolve the same task-specific base URL used by the test: `PRE_EDITOR_BASE_URL` when set, otherwise `http://127.0.0.1:5173`. Fetch it and require the response to contain `<title>Article creation</title>` so an unrelated process is not accepted as the app. If the default URL is unavailable, start `npm run dev -- --host 127.0.0.1 --port 5173` in a managed terminal session, wait for the same title check to pass, record that this task started it, and stop only that task-owned session after browser verification.

- [ ] **Step 2: Create the browser tests**

Use `node:test`, `node:assert/strict`, and `chromium` from `playwright`. The critical-path test must:

1. Open `${PRE_EDITOR_BASE_URL ?? 'http://127.0.0.1:5173'}/article`.
2. Assert the article title and accessible red-link name.
3. Focus the red link and press Enter, then assert `New article`, the prefilled title, and the Person result.
4. Edit the title away and assert the exact no-result message; restore it.
5. Focus the Person result and press Enter.
6. Use native browser Back to return to Subject, edit the title to a non-match, then attempt browser Forward and assert the stale Sources entry is rejected back to Subject.
7. Restore the title, select the Person again, and use browser Back/Forward once more to assert valid Subject -> Sources ordering and retained state.
8. Assert the exact Sources heading, subtitle, and Person requirement copy.
9. Assert malformed and duplicate source messages.
10. Assert Continue gating at zero, one, remove, re-add, and two sources.
11. Continue to Guidance, use the visible Back action to return to Sources, then continue again.
12. Assert all three guidance bullets.
13. Select Start writing.
14. Assert `/editor`, `.editor-page`, the fixed query values, and two repeated `source` values.

Add a second route-guard test that:

1. Directly opens `/article-guidance?step=sources&title=Ritu+Karidhal&source=redlink&variant=toolbar-outline`.
2. Asserts the route is replaced with `step=subject`.
3. Completes Subject and two Sources to reach Guidance.
4. Reloads the page.
5. Asserts the refreshed route resets to Subject while preserving the title/source/variant query values.

Use accessible role/label locators rather than CSS except for the existing `.editor-page` handoff assertion. Close the browser in `t.after`.

- [ ] **Step 3: Run the browser test and verify RED**

With the existing Vite server on port 5173, run:

```bash
node --test tests/preEditor/preEditorJourney.browser.mjs
```

Expected: non-zero exit because `/article` still renders the old network-backed page and lacks the accessible red-link contract.

### Task 3: Build the isolated ProtoWiki-style reader

**Files:**
- Create: `src/preEditor/components/ProtoWikiArticleShell.vue`
- Create: `src/preEditor/views/PreEditorReadingView.vue`

- [ ] **Step 1: Implement semantic reader markup**

`ProtoWikiArticleShell.vue` must:

- accept required `article` prop and emit `activate-missing-link`;
- render page chrome in `<header>`, content in `<main>`, the fixture in `<article>`, thematic groups in `<section>`, and site information in `<footer>`;
- use `CdxButton`/`CdxIcon` with `cdxIconMenu`, `cdxIconSearch`, and `cdxIconUserAvatar` for familiar non-deceptive chrome;
- render ordinary segments as text and the one `missingLink` segment as a native `<a href>` that prevents navigation and emits its text;
- give the missing link `aria-label="Ritu Karidhal — article does not exist"`;
- keep it red and underlined at rest, with a visible `:focus-visible` outline.
- explicitly override the global link rule with `--color-link-red`, visited, hover, active, and focus tokens.

- [ ] **Step 2: Implement the reading view**

`PreEditorReadingView.vue` passes `personJourney.article` to the shell and maps the emitted missing link to:

```js
router.push({
  name: 'article-guidance',
  query: {
    step: 'subject',
    title: personJourney.subject.title,
    source: 'redlink',
    variant: personJourney.handoff.variant,
  },
})
```

- [ ] **Step 3: Apply responsive, token-based craft**

Use scoped CSS:

- mobile padding from `--spacing-*`;
- article measure around `44rem`, with a wider chrome container;
- serif article title, system-sans interface chrome;
- clear grouping before decorative color;
- flexbox only for one-axis chrome/action groups;
- no visual reordering;
- breakpoint where the reading measure begins to strain, not device-specific markup;
- no animation required.

### Task 4: Build the Article Guidance shell and source form

**Files:**
- Create: `src/preEditor/components/ArticleGuidanceShell.vue`
- Create: `src/preEditor/components/SourceUrlForm.vue`

- [ ] **Step 1: Implement the shared setup shell**

`ArticleGuidanceShell.vue` must:

- accept required `step`, `heading`, and `backLabel`;
- emit `back`;
- expose `focusHeading()` with `defineExpose`;
- render a 44px minimum header with a quiet Codex Back icon button and centered `h1` on mobile;
- hide the header Back control at desktop width, where the heading becomes serif and left-aligned;
- render the body slot in a `40rem` reading column;
- require each screen to provide a quiet text Back action at desktop width before the primary action, because the shared header control is mobile-only;
- use border, spacing, and type tokens only.

- [ ] **Step 2: Implement the controlled URL form**

`SourceUrlForm.vue` must:

- accept `modelValue`, `error`, `sources`, `requiredCount`, and `disabled`;
- emit `update:modelValue`, `submit`, and `remove`;
- use a real `<form @submit.prevent>`, a real visually available or visually hidden `<label>`, and `CdxTextInput input-type="url"`;
- associate the error with `aria-describedby`, set Codex error status, and put the message in `role="alert"`;
- use a Codex Add source button with `cdxIconAdd`;
- render accepted sources with hostname, normalized URL, and a quiet Remove button whose accessible name includes the hostname;
- expose `n of 2 sources added` as live progress text;
- keep malformed/duplicate text in the field and clear only after the parent reports successful addition;
- disable further source entry after two accepted URLs because this staged path requires exactly two.

- [ ] **Step 3: Match the extension's responsive source anatomy**

Use one source column on mobile, with the input/Add controls sharing a border and a stacked full-width Continue action. Hide the text Back action on mobile because the shell header supplies Back. At desktop, separate the input and Add controls with an 8px gap, reveal the Add source text label, hide header Back, and place quiet Back plus primary Continue inline. Recommended/discouraged source lists remain on Guidance exactly as specified; do not duplicate them on Sources.

### Task 5: Implement the three-screen coordinator and wire routes

**Files:**
- Create: `src/preEditor/views/ArticleGuidanceSetupView.vue`
- Modify: `src/router/index.js`
- Modify: `src/views/HubView.vue`

- [ ] **Step 1: Create the in-memory coordinator**

In `ArticleGuidanceSetupView.vue`:

- normalize the initial title exactly with `const initialTitle = typeof route.query.title === 'string' ? route.query.title : personJourney.subject.title`;
- create state once with `createFlowState(personJourney, initialTitle)`;
- derive `currentStep` only when `typeof route.query.step === 'string'`; treat `null` and arrays as invalid;
- show Subject, Sources, or Guidance with `v-if`;
- render a real label named **Article title**, the editable title input, and the **What is this?** results heading on Subject;
- on every title edit, update `titleInput` and clear `selectedSubject` plus `sources` before deriving the fixed result, so browser Forward cannot reuse stale prerequisites;
- update state immutably on selection, add, and remove;
- clear the URL field and error only after a successful add;
- cap accepted sources at `requiredCount`;
- use `findSubject` for the result/no-result branch;
- show a native `<button type="button">` styled as the result card, with the exact Person title, description, and `· Person` cue; do not rely on Codex 2.3's non-focusable card root;
- show **No subjects found for "{title}"** only for a non-empty non-match;
- show static article info (`Ritu Karidhal` + `CdxInfoChip`) on Sources and Guidance;
- show **Add sources**, **Sources help readers check the facts and shows why this subject matters.**, and **Person articles on this wiki require sources.** on Sources;
- show the exact frozen guidance and recommended/discouraged lists.
- render quiet text Back actions on Subject, Sources, and Guidance at desktop width; hide those text actions on mobile, where the shell's icon Back control remains visible.

- [ ] **Step 2: Add guarded forward navigation**

Use:

```js
function pushStep(step) {
  router.push({
    name: 'article-guidance',
    query: {
      ...route.query,
      step,
      title: flowState.value.titleInput,
    },
  })
}
```

On Subject selection, canonicalize the title, set `selectedSubject`, set step to Sources, and push Sources. On Continue, require `canEnterStep(state, STEPS.GUIDANCE)`, set the state step, and push Guidance.

- [ ] **Step 3: Add direct-entry, refresh, and Back guards**

Watch `route.query.step` immediately:

- invalid/missing step -> replace with Subject;
- Sources/Guidance without prerequisites -> replace with Subject while retaining `title`, `source`, and `variant`;
- permitted route -> update the state step and call `ArticleGuidanceShell.focusHeading()` after `nextTick`.

Back behavior:

- Sources/Guidance -> `router.back()`;
- Subject -> parse the recorded route string before deciding:

```js
function getPreviousPath() {
  const previous = window.history.state?.back
  if (typeof previous !== 'string') return ''
  return new URL(previous, window.location.origin).pathname
}

function goBack() {
  if (currentStep.value !== STEPS.SUBJECT) {
    router.back()
    return
  }
  if (getPreviousPath().endsWith('/article')) {
    router.back()
  } else {
    router.replace({ name: 'article' })
  }
}
```

- [ ] **Step 4: Add editor handoff**

On Start writing:

```js
flowState.value = { ...flowState.value, step: STEPS.GUIDANCE }
router.push({
  name: 'editor',
  query: buildEditorQuery(flowState.value, personJourney),
})
```

Do not read or modify any editor file.

- [ ] **Step 5: Update only the approved integration points**

In `src/router/index.js`:

- replace the `ReadingView` import with `PreEditorReadingView`;
- add `ArticleGuidanceSetupView`;
- keep `/article` named `article`;
- add `/article-guidance` named `article-guidance`;
- leave `/editor` unchanged.

In `src/views/HubView.vue`, point the active card to `{ name: 'article' }` and describe the red-link setup journey. Do not change hub styling.

- [ ] **Step 6: Run the browser test and verify GREEN**

Run:

```bash
node --test tests/preEditor/preEditorJourney.browser.mjs
```

Expected: 2 tests, 2 pass, 0 fail.

- [ ] **Step 7: Run pure tests again**

Run `node --test tests/preEditor/preEditorFlow.test.js`.

Expected: 8 tests, 8 pass, 0 fail.

- [ ] **Step 8: Format only owned files**

Run Prettier with the explicit new/pre-editor/router/hub/test paths. Do not run a repository-wide write command.

- [ ] **Step 9: Commit only the isolated journey**

Stage these exact paths:

```text
src/preEditor/
src/router/index.js
src/views/HubView.vue
tests/preEditor/preEditorJourney.browser.mjs
```

Before committing, run `git diff --cached --name-only` and confirm no editor-owned path appears. Commit with:

```bash
git commit -m "Add pre-editor Article Guidance journey"
```

### Task 6: Fresh verification and in-app browser handoff

**Files:**
- Verify only; fix discovered issues through a new failing regression test first.

- [ ] **Step 1: Run targeted static checks**

Run ESLint and Oxlint against only:

```text
src/preEditor/**/*.js
src/preEditor/**/*.vue
src/router/index.js
src/views/HubView.vue
tests/preEditor/*.js
tests/preEditor/*.mjs
```

Expected: zero errors. Do not use the repository's auto-fixing `npm run lint` while the concurrent toolbar file is dirty.

- [ ] **Step 2: Run the complete retained test set**

Run:

```bash
node --test tests/preEditor/preEditorFlow.test.js
node --test tests/preEditor/preEditorJourney.browser.mjs
```

Expected: 8 pure tests and 2 browser tests pass with zero failures.

- [ ] **Step 3: Run the production build**

Run `npm run build`.

Expected: Vite exits 0 and writes the production bundle without errors.

- [ ] **Step 4: Check patch hygiene**

Run:

```bash
git diff --check
git status --short
git show --stat --oneline HEAD
git show --name-only --format= HEAD
```

Expected: no whitespace errors; the journey commit contains only approved paths. The pre-existing concurrent `src/components/CdxToolbar.vue` working-tree change may remain and must not be altered or staged.

- [ ] **Step 5: Verify visually in the user's in-app browser**

Use the Browser skill on `http://127.0.0.1:5173/`. Preserve the user's existing tab and verify:

- desktop width: hub -> article -> red link -> three setup screens -> editor;
- mobile width: same critical path with stacked actions and readable measure;
- red link is visibly red and underlined;
- focus indicators, title edit/no-result recovery, error announcements, source removal, Continue gating, Back, and refresh reset;
- Start writing lands on the existing editor with the complete repeated-source query.

Capture screenshots for visual inspection at the reader, Sources, and Guidance screens. Inspect hierarchy, measure, source order, focus, and clipped/overlapping content before claiming completion.

- [ ] **Step 6: If browser verification finds a defect, reproduce it first**

Add a failing pure or browser regression assertion, run it to confirm RED, implement the smallest fix, and re-run all Task 6 verification steps.
