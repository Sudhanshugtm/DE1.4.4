# Verified Facts Entry Preview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only `+ → Verified facts` path that opens a read-only, provenance-first Buddhism preview without changing editor content.

**Architecture:** A route-keyed fixture module decides whether reviewed facts exist. `EditorView` coordinates the route, toolbar, and existing bottom sheet; `CdxToolbar` only exposes a dedicated event; `VerifiedFactsReferenceList` only renders read-only facts. The insertion-capable `VerifiedFactsList` and rail remain untouched.

**Tech Stack:** Vue 3, Vue Router, Wikimedia Codex, Vitest, Vue Test Utils, Vite.

**Required practices:** `@superpowers:test-driven-development`, `@design-to-code-craft`, `@browser:control-in-app-browser`, `@superpowers:verification-before-completion`.

**Spec:** `docs/superpowers/specs/2026-08-04-verified-facts-entry-design.md`

---

## File map

- Create `src/config/reviewedVerifiedFacts.js`: static reviewed fixtures and fail-closed context lookup.
- Create `src/components/VerifiedFactsReferenceList.vue`: semantic, read-only fact presentation.
- Modify `src/components/CdxToolbar.vue`: conditional menu entry and event.
- Modify `src/components/OutlinePopover.vue`: toolbar-only read-only view; preserve rail view.
- Modify `src/views/EditorView.vue`: route lookup and sheet orchestration.
- Create three focused test files and extend `tests/outlinePopover.test.js`.

## Chunk 1: Route-aware read-only preview

### Task 1: Reviewed fixture lookup

**Files:**

- Create: `src/config/reviewedVerifiedFacts.js`
- Create: `tests/reviewedVerifiedFacts.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/reviewedVerifiedFacts.test.js`:

```js
import { describe, expect, it } from 'vitest'
import {
  getReviewedVerifiedFacts,
  isReviewedVerifiedFact,
} from '../src/config/reviewedVerifiedFacts.js'

describe('reviewed Verified Facts lookup', () => {
  it('returns the qualified Buddhism fixture for the reviewed route', () => {
    const facts = getReviewedVerifiedFacts({
      language: 'en',
      outline: 'religion',
      title: 'Buddhism',
    })
    expect(facts).toEqual([
      expect.objectContaining({
        id: 'buddhism-inception-range',
        value: 'Between 563 BCE and 483 BCE',
        referenceCount: 1,
        claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
      }),
    ])
  })

  it('fails closed for an unreviewed context', () => {
    expect(
      getReviewedVerifiedFacts({ language: 'en', outline: 'religion', title: 'Other' }),
    ).toEqual([])
  })

  it('rejects a fact with missing provenance or uncertainty fields', () => {
    expect(
      isReviewedVerifiedFact({
        id: 'incomplete',
        label: 'Incomplete',
        value: 'Incomplete',
        referenceCount: 1,
      }),
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Run RED**

Run `npx vitest run tests/reviewedVerifiedFacts.test.js`.

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the lookup**

Create `src/config/reviewedVerifiedFacts.js`:

```js
const REQUIRED_FIELDS = ['id', 'label', 'value', 'qualification', 'referenceCount', 'claimUrl']

const reviewedFactsByContext = Object.freeze({
  'en:religion:Buddhism': [
    {
      id: 'buddhism-inception-range',
      label: 'Approximate origin period',
      value: 'Between 563 BCE and 483 BCE',
      qualification:
        'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
      referenceCount: 1,
      claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
    },
  ],
})

export function isReviewedVerifiedFact(fact) {
  return REQUIRED_FIELDS.every((field) => fact[field] !== undefined && fact[field] !== '')
}

export function getReviewedVerifiedFacts({ language, outline, title }) {
  const key = [language, outline, title].join(':')
  return (reviewedFactsByContext[key] ?? [])
    .filter(isReviewedVerifiedFact)
    .map((fact) => ({ ...fact }))
}
```

- [ ] **Step 4: Run GREEN**

Run `npx vitest run tests/reviewedVerifiedFacts.test.js`.

Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/config/reviewedVerifiedFacts.js tests/reviewedVerifiedFacts.test.js
git commit -m "feat: add reviewed verified fact fixtures"
```

### Task 2: Read-only fact presentation

**Files:**

- Create: `src/components/VerifiedFactsReferenceList.vue`
- Create: `tests/VerifiedFactsReferenceList.test.js`

- [ ] **Step 1: Write failing component tests**

Create a complete fixture and assert:

```js
// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VerifiedFactsReferenceList from '../src/components/VerifiedFactsReferenceList.vue'

const fact = {
  id: 'buddhism-inception-range',
  label: 'Approximate origin period',
  value: 'Between 563 BCE and 483 BCE',
  qualification:
    'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
  referenceCount: 1,
  claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
}

describe('VerifiedFactsReferenceList', () => {
  it('renders a provenance-first read-only fact', () => {
    const wrapper = mount(VerifiedFactsReferenceList, { props: { facts: [fact] } })
    expect(wrapper.text()).toContain('Referenced information from Wikidata')
    expect(wrapper.text()).toContain('For your reference')
    expect(wrapper.text()).toContain(fact.value)
    expect(wrapper.text()).toContain(fact.qualification)
    expect(wrapper.text()).toContain('1 reference')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('links to the exact statement without making the card interactive', () => {
    const wrapper = mount(VerifiedFactsReferenceList, { props: { facts: [fact] } })
    const link = wrapper.get('a')
    expect(link.text()).toBe('View this statement on Wikidata')
    expect(link.attributes()).toMatchObject({
      href: fact.claimUrl,
      target: '_blank',
      rel: 'noopener',
    })
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run RED**

Run `npx vitest run tests/VerifiedFactsReferenceList.test.js`.

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement semantic markup and restrained styling**

Create `src/components/VerifiedFactsReferenceList.vue` with this markup:

```vue
<template>
  <div class="verified-facts-reference">
    <p class="verified-facts-reference__intro">
      Referenced information from Wikidata. Check the source before using it.
    </p>
    <section aria-labelledby="verified-facts-reference-heading">
      <h3 id="verified-facts-reference-heading" class="verified-facts-reference__heading">
        For your reference
      </h3>
      <article v-for="fact in facts" :key="fact.id" class="verified-facts-reference__fact">
        <p class="verified-facts-reference__label">{{ fact.label }}</p>
        <p class="verified-facts-reference__value">{{ fact.value }}</p>
        <p class="verified-facts-reference__qualification">{{ fact.qualification }}</p>
        <div class="verified-facts-reference__provenance">
          <span
            >{{ fact.referenceCount }}
            {{ fact.referenceCount === 1 ? 'reference' : 'references' }}</span
          >
          <a
            :href="fact.claimUrl"
            target="_blank"
            rel="noopener"
            :aria-label="`View ${fact.label} statement on Wikidata`"
            >View this statement on Wikidata</a
          >
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
defineProps({ facts: { type: Array, required: true } })
</script>
```

Use scoped Codex-token CSS: 16px intro text; 14px semibold group and fact labels; 16px semibold value; 14px neutral qualification; 1px subtle border; 8px radius; 16px internal padding; 12px vertical gaps. Separate provenance with a top border, keep its link visibly focused, and use no pointer cursor, add icon, elevation, or insertion motion.

- [ ] **Step 4: Run GREEN**

Run `npx vitest run tests/VerifiedFactsReferenceList.test.js`.

Expected: 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/VerifiedFactsReferenceList.vue tests/VerifiedFactsReferenceList.test.js
git commit -m "feat: present verified facts as references"
```

### Task 3: Toolbar discovery entry

**Files:**

- Modify: `src/components/CdxToolbar.vue`
- Create: `tests/CdxToolbar.test.js`

- [ ] **Step 1: Write failing toolbar tests**

Create `tests/CdxToolbar.test.js` using Codex button/icon stubs:

```js
// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import CdxToolbar from '../src/components/CdxToolbar.vue'

const global = {
  stubs: {
    CdxButton: { template: '<button><slot /></button>' },
    CdxIcon: true,
  },
}

const wrappers = []
function mountToolbar(showVerifiedFacts) {
  const wrapper = mount(CdxToolbar, {
    props: { showOutlineEntry: true, showVerifiedFacts },
    global,
  })
  wrappers.push(wrapper)
  return wrapper
}

async function openInsertMenu(wrapper) {
  await wrapper.get('[aria-label="Insert"]').trigger('click')
}

afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('CdxToolbar Verified Facts entry', () => {
  it('shows the entry only when reviewed facts exist', async () => {
    const enabled = mountToolbar(true)
    await openInsertMenu(enabled)
    expect(enabled.text()).toContain('Verified facts')

    const disabled = mountToolbar(false)
    await openInsertMenu(disabled)
    expect(disabled.text()).not.toContain('Verified facts')
  })

  it('closes the menu and emits a dedicated event', async () => {
    const wrapper = mountToolbar(true)
    await openInsertMenu(wrapper)
    const item = wrapper.get('[data-testid="insert-verified-facts"]')
    expect(item.classes()).toContain('cdx-toolbar__insert-item--verified')
    await item.trigger('click')
    expect(wrapper.emitted('open-verified-facts')).toHaveLength(1)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Run RED**

Run `npx vitest run tests/CdxToolbar.test.js`.

Expected: FAIL because the prop, item, and event do not exist.

- [ ] **Step 3: Add the menu item and event**

In `src/components/CdxToolbar.vue`:

- add Boolean prop `showVerifiedFacts`, default `false`;
- add `open-verified-facts` to `defineEmits`;
- import `cdxIconCheckAll`;
- directly after `Suggested sections`, render a guarded native menu button with `data-testid="insert-verified-facts"`, the check icon, and `Verified facts`;
- give that button the `cdx-toolbar__insert-item--verified` modifier and a 44px minimum height without changing the existing tool rows;
- implement `onInsertVerifiedFacts()` to close the menu, reset `moreExpanded`, and emit the event.

- [ ] **Step 4: Run GREEN**

Run `npx vitest run tests/CdxToolbar.test.js`.

Expected: 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/CdxToolbar.vue tests/CdxToolbar.test.js
git commit -m "feat: expose verified facts from insert menu"
```

### Task 4: Sheet and route integration

**Files:**

- Modify: `src/components/OutlinePopover.vue`
- Modify: `src/views/EditorView.vue`
- Modify: `tests/outlinePopover.test.js`
- Modify: `tests/outlineSwitch.test.js`

- [ ] **Step 1: Write a failing popover test**

Extend `tests/outlinePopover.test.js` with a `VerifiedFactsReferenceList` stub. Mount closed with `initialView: 'verified-facts'`, `selectableOutlines: true`, and one reviewed fact, then toggle `open` to true so the existing watcher consumes `initialView`. Assert that the header reads `Verified facts`, the read-only stub receives the fact, and the legacy `VerifiedFactsList` stub is absent. Add a second mount with `selectableOutlines: false` and assert that the legacy `VerifiedFactsList` remains present and the read-only stub is absent. Keep the existing scroll-reset test unchanged.

Extend the existing `EditorView` harness in `tests/outlineSwitch.test.js`:

- declare `showVerifiedFacts` on its `CdxToolbar` mock and `verifiedFacts` on its `OutlinePopover` stub;
- on the reviewed Buddhism route, assert `showVerifiedFacts` is true and the popover receives one fact;
- emit `open-verified-facts` from the toolbar and assert the popover opens with `initialView === 'verified-facts'`;
- on an unsupported title, assert `showVerifiedFacts` is false and `verifiedFacts` is empty;
- emit `open-outline` in toolbar mode and assert it opens `initialView === 'outline'`;
- emit `open-outline` in non-toolbar mode with a placeholder-selected editor mock and assert the legacy `initialView === 'verified-facts'` behavior remains unchanged.

- [ ] **Step 2: Run RED**

Run `npx vitest run tests/outlinePopover.test.js tests/outlineSwitch.test.js`.

Expected: the new tests fail because the prop, component, route orchestration, and dedicated event are absent.

- [ ] **Step 3: Integrate the bottom sheet**

In `src/components/OutlinePopover.vue`:

- import `VerifiedFactsReferenceList`;
- add Array prop `verifiedFacts`, default `() => []`;
- render it only for `selectableOutlines && selectedView === 'verified-facts'`;
- render legacy `VerifiedFactsList` only for `!selectableOutlines && selectedView === 'verified-facts'`;
- preserve the existing header, close, focus, and scroll behavior.

In `src/views/EditorView.vue`, add:

```js
import { getReviewedVerifiedFacts } from '@/config/reviewedVerifiedFacts'

const reviewedVerifiedFacts = computed(() =>
  getReviewedVerifiedFacts({
    language: typeof route.query.lang === 'string' ? route.query.lang : 'en',
    outline: activeOutlineId.value,
    title: typeof route.query.title === 'string' ? route.query.title : '',
  }),
)

function onOpenVerifiedFacts() {
  dismissTipQuietly()
  initialView.value = 'verified-facts'
  isPopoverOpen.value = true
}
```

Pass `:show-verified-facts="reviewedVerifiedFacts.length > 0"` and `@open-verified-facts="onOpenVerifiedFacts"` to `CdxToolbar`, and pass `:verified-facts="reviewedVerifiedFacts"` to `OutlinePopover`. In `onOpenOutline`, make toolbar-outline mode always select `outline`; preserve the existing placeholder-selected `verified-facts` behavior only for the non-toolbar rail. The dedicated `open-verified-facts` event is the only way to open the new preview.

- [ ] **Step 4: Run focused tests**

```bash
npx vitest run tests/reviewedVerifiedFacts.test.js tests/VerifiedFactsReferenceList.test.js tests/CdxToolbar.test.js tests/outlinePopover.test.js tests/outlineSwitch.test.js
```

Expected: all focused tests pass.

- [ ] **Step 5: Run repository verification**

```bash
npm test
npm run build
npx eslint src/config/reviewedVerifiedFacts.js src/components/VerifiedFactsReferenceList.vue src/components/CdxToolbar.vue src/components/OutlinePopover.vue src/views/EditorView.vue tests/reviewedVerifiedFacts.test.js tests/VerifiedFactsReferenceList.test.js tests/CdxToolbar.test.js tests/outlinePopover.test.js tests/outlineSwitch.test.js
git diff --check
```

Expected: zero test failures, build exit 0, focused ESLint exit 0 without unrelated rewrites, and a clean diff check.

- [ ] **Step 6: Commit**

```bash
git add src/components/OutlinePopover.vue src/views/EditorView.vue tests/outlinePopover.test.js tests/outlineSwitch.test.js
git commit -m "feat: open reviewed facts in guidance sheet"
```

### Task 5: In-app design verification

**Files:** none

- [ ] **Step 1: Start the local server**

Run `npm run dev`, keep it alive, and use the exact local URL Vite prints.

- [ ] **Step 2: Open the reviewed journey**

Open `/editor?lang=en&variant=toolbar-outline&outline=religion&title=Buddhism&articleguidance=1&sourceOrigin=redlink` in the in-app browser.

- [ ] **Step 3: Verify the design and behavior**

Check the current narrow viewport: unchanged arrival flow; menu order and 44px target; transition from `+` menu to sheet; readable title, explanation, group, value, uncertainty, and provenance; non-interactive card treatment; keyboard focus; hidden entry for unsupported titles; no new browser errors. Record editor text, selection/cursor, and Undo availability before opening. Follow the exact-claim link, confirm it opens `https://www.wikidata.org/wiki/Q748#P571` in a new tab, return to the prototype, close the sheet, and confirm all three editor-state values are unchanged.

- [ ] **Step 4: Keep it local**

Run `git status --short --branch` and `git log -5 --oneline --decorate`. Do not push, publish, or alter GitHub Pages.
