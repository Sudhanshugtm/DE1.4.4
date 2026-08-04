# Settings-only Verified Facts Demo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep every existing outline available in Settings while making the reviewed Verified facts prototype discoverable only through a Settings launcher that opens a fresh, flagged Portugal demo.

**Architecture:** A small route-policy module owns the canonical demo target and semantic exact-route check. `SettingsDialog` remains presentation-only and emits launch intent. `EditorView` gates the toolbar entry, safely commits a fresh editor session after navigation, and coordinates focus through a narrow method exposed by the existing toolbar.

**Tech Stack:** Vue 3 Composition API, Vue Router 5, Wikimedia Codex, TipTap 3, Vitest, Vue Test Utils

---

## Chunk 1: Route policy and Settings presentation

### Task 1: Define the canonical demo route

**Files:**
- Create: `src/config/verifiedFactsDemo.js`
- Create: `tests/verifiedFactsDemo.test.js`

- [ ] **Step 1: Write failing semantic-route tests**

Create the complete test file below. It proves that semantic equality ignores insertion order while missing, changed, repeated, or extra query values, a non-empty hash, and a non-editor path all fail closed.

```js
import {
  VERIFIED_FACTS_DEMO_ROUTE,
  isExactVerifiedFactsDemoRoute,
} from '../src/config/verifiedFactsDemo.js'
import { describe, expect, it } from 'vitest'

const exactRoute = {
  path: '/editor',
  hash: '',
  query: { ...VERIFIED_FACTS_DEMO_ROUTE.query },
}

describe('verified facts demo route', () => {
  it('accepts the exact canonical values regardless of query insertion order', () => {
    const reversedQuery = Object.fromEntries(Object.entries(exactRoute.query).reverse())
    expect(isExactVerifiedFactsDemoRoute({ ...exactRoute, query: reversedQuery })).toBe(true)
  })

  it.each([
    ['missing value', { ...exactRoute, query: { ...exactRoute.query, title: undefined } }],
    ['changed value', { ...exactRoute, query: { ...exactRoute.query, title: 'Spain' } }],
    ['repeated value', { ...exactRoute, query: { ...exactRoute.query, title: ['Portugal'] } }],
    ['extra value', { ...exactRoute, query: { ...exactRoute.query, extra: '1' } }],
    ['hash', { ...exactRoute, hash: '#facts' }],
    ['different path', { ...exactRoute, path: '/article' }],
  ])('rejects a route with a %s', (_label, route) => {
    expect(isExactVerifiedFactsDemoRoute(route)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/verifiedFactsDemo.test.js`

Expected: the file fails to load with `Failed to resolve import "../src/config/verifiedFactsDemo.js"` and no test passes.

- [ ] **Step 3: Implement the minimal route policy**

Export one frozen router target and one pure predicate:

```js
export const VERIFIED_FACTS_DEMO_ROUTE = Object.freeze({
  name: 'editor',
  query: Object.freeze({
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'country',
    title: 'Portugal',
    articleguidance: '1',
    sourceOrigin: 'redlink',
    verifiedfacts: '1',
  }),
})

const canonicalKeys = Object.freeze(Object.keys(VERIFIED_FACTS_DEMO_ROUTE.query))

export function isExactVerifiedFactsDemoRoute(route) {
  if (route.path !== '/editor' || route.hash) return false
  const query = route.query ?? {}
  const keys = Object.keys(query)
  return (
    keys.length === canonicalKeys.length &&
    canonicalKeys.every(
      (key) => typeof query[key] === 'string' && query[key] === VERIFIED_FACTS_DEMO_ROUTE.query[key],
    )
  )
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- tests/verifiedFactsDemo.test.js`

Expected: `tests/verifiedFactsDemo.test.js` reports 7 tests passed.

- [ ] **Step 5: Commit the route policy**

```bash
git add src/config/verifiedFactsDemo.js tests/verifiedFactsDemo.test.js
git commit -m "feat: define verified facts demo route"
```

### Task 2: Add the Settings demo launcher without changing outlines

**Files:**
- Modify: `src/components/SettingsDialog.vue`
- Create: `tests/SettingsDialog.test.js`

- [ ] **Step 1: Write failing Settings presentation tests**

Create this complete test file. It uses a real memory route and minimal presentation stubs while keeping both interaction events real.

```js
// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'
import SettingsDialog from '../src/components/SettingsDialog.vue'

const stubs = {
  CdxDialog: {
    name: 'CdxDialog',
    props: ['open'],
    emits: ['update:open'],
    template: '<section><slot /></section>',
  },
  CdxLabel: { name: 'CdxLabel', template: '<h2><slot /></h2>' },
  CdxButton: {
    name: 'CdxButton',
    props: ['disabled'],
    emits: ['click'],
    template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
  OutlineSelector: {
    name: 'OutlineSelector',
    props: ['showIntro'],
    emits: ['select'],
    template:
      '<button data-testid="select-city" @click="$emit(\'select\', \'city\')">Choose from all outlines</button>',
  },
}

let wrapper

async function mountSettings(props = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/editor', component: { template: '<div />' } }],
  })
  await router.push('/editor?outline=country')
  await router.isReady()
  wrapper = mount(SettingsDialog, {
    props: { open: true, ...props },
    global: { plugins: [router], stubs },
  })
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('SettingsDialog', () => {
  it('keeps the current outline selector first and preserves its event', async () => {
    await mountSettings()
    const groups = wrapper.findAll('.field-group')
    expect(groups[0].text()).toContain('Article outline')
    expect(groups[0].text()).toContain('Currently: Country')
    expect(wrapper.findComponent({ name: 'OutlineSelector' }).props('showIntro')).toBe(false)
    await wrapper.get('[data-testid="select-city"]').trigger('click')
    expect(wrapper.emitted('outline-selected')).toEqual([['city']])
  })

  it('presents and emits the Portugal Verified facts demo', async () => {
    await mountSettings()
    const groups = wrapper.findAll('.field-group')
    expect(groups[1].text()).toContain('Prototype demos')
    expect(groups[1].text()).toContain('Explore reviewed Wikidata facts using Portugal.')
    const button = wrapper.get('[data-testid="open-verified-facts-demo"]')
    expect(button.text()).toBe('Open Verified facts demo')
    await button.trigger('click')
    expect(wrapper.emitted('open-verified-facts-demo')).toHaveLength(1)
  })

  it('disables the demo launcher while navigation is pending', async () => {
    await mountSettings({ demoLaunchPending: true })
    expect(wrapper.get('[data-testid="open-verified-facts-demo"]').attributes()).toHaveProperty(
      'disabled',
    )
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/SettingsDialog.test.js`

Expected: 3 tests run; the outline-preservation test passes, while the two launcher tests fail because `.field-group[1]` and `[data-testid="open-verified-facts-demo"]` do not exist.

- [ ] **Step 3: Implement the presentation-only launcher**

Import `CdxButton`, then make these complete script changes:

```js
import { CdxButton, CdxDialog, CdxLabel } from '@wikimedia/codex'

defineProps({
  demoLaunchPending: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['outline-selected', 'open-verified-facts-demo'])
```

Append this second field group after the existing outline selector:

```vue
<div class="field-group field-group--prototype">
  <CdxLabel>Prototype demos</CdxLabel>
  <p class="field-group__hint">Explore reviewed Wikidata facts using Portugal.</p>
  <CdxButton
    data-testid="open-verified-facts-demo"
    action="progressive"
    :disabled="demoLaunchPending"
    @click="emit('open-verified-facts-demo')"
  >
    Open Verified facts demo
  </CdxButton>
</div>
```

Use existing spacing/design tokens; separate the groups with a top border and spacing; do not alter `OutlineSelector` or its placement.

```css
.field-group--prototype {
  margin-top: var(--spacing-100);
  padding-top: var(--spacing-100);
  border-top: var(--border-subtle);
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- tests/SettingsDialog.test.js`

Expected: `tests/SettingsDialog.test.js` reports 3 tests passed.

- [ ] **Step 5: Commit the Settings launcher**

```bash
git add src/components/SettingsDialog.vue tests/SettingsDialog.test.js
git commit -m "feat: add verified facts demo launcher"
```

## Chunk 2: Editor integration and safe session transition

### Task 3: Gate Verified facts and launch a fresh Portugal session

**Files:**
- Modify: `src/components/CdxToolbar.vue`
- Modify: `src/views/EditorView.vue`
- Modify: `tests/CdxToolbar.test.js`
- Modify: `tests/outlineSwitch.test.js`

- [ ] **Step 1: Write the failing toolbar focus test**

Update `mountToolbar()` to attach the component to the real document; the existing `afterEach` unmount then removes it. Call `wrapper.vm.focusInsertButton()` and assert that the Insert button becomes `document.activeElement` without opening its menu.

```js
function mountToolbar(props = {}) {
  wrapper = mount(CdxToolbar, {
    attachTo: document.body,
    props: { showOutlineEntry: true, ...props },
    global: { stubs },
  })
}

it('focuses the existing Insert button without opening its menu', () => {
  mountToolbar()
  wrapper.vm.focusInsertButton()

  expect(document.activeElement).toBe(wrapper.get('[aria-label="Insert"]').element)
  expect(wrapper.find('[role="menu"]').exists()).toBe(false)
})
```

- [ ] **Step 2: Write failing visibility-gate tests**

Replace the existing Portugal integration expectation and add flagged cases with these exact assertions:

```js
it('keeps reviewed Portugal facts private on an ordinary route', async () => {
  await mountEditor({
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'country',
    title: 'Portugal',
  })

  expect(outlinePopover().props('verifiedFacts')).toHaveLength(4)
  expect(toolbar().props('showVerifiedFacts')).toBe(false)
  outlinePopover().vm.$emit('update:open', false)
  toolbar().vm.$emit('open-verified-facts')
  await nextTick()
  expect(outlinePopover().props('open')).toBe(false)
})

it('exposes reviewed facts only when the private flag is present', async () => {
  await mountEditor({
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'country',
    title: 'Portugal',
    verifiedfacts: '1',
  })

  expect(toolbar().props('showVerifiedFacts')).toBe(true)
  expect(outlinePopover().props('verifiedFacts')).toHaveLength(4)
})
```

Add `verifiedfacts: '1'` to the existing tests that intentionally open reviewed facts. Add it to the unsupported-title case too, and keep the expected result hidden/closed.

- [ ] **Step 3: Run the first focused RED cycle**

Run: `npm test -- tests/CdxToolbar.test.js tests/outlineSwitch.test.js`

Expected: the new toolbar test fails with `focusInsertButton is not a function`; the unflagged Portugal test fails because `showVerifiedFacts` is still true and a synthetic open event still opens the sheet.

- [ ] **Step 4: Implement toolbar focus and visibility gating**

In `CdxToolbar.vue`, add:

```js
function focusInsertButton() {
  insertButtonRef.value?.$el?.focus()
}

defineExpose({ focusInsertButton })
```

In `EditorView.vue`, add the computed gate and use it in both the toolbar prop and open handler:

```js
const isVerifiedFactsDemoEnabled = computed(
  () => route.query.verifiedfacts === '1' && reviewedVerifiedFacts.value.length > 0,
)

function onOpenVerifiedFacts() {
  if (!isVerifiedFactsDemoEnabled.value) return
  dismissTipQuietly()
  initialView.value = 'verified-facts'
  isPopoverOpen.value = true
}
```

Template change:

```vue
<CdxToolbar
  ref="toolbarRef"
  :show-outline-entry="isToolbarOutlineVariant"
  :show-verified-facts="isVerifiedFactsDemoEnabled"
  :show-cite="!isToolbarOutlineVariant"
  :highlight-outline-entry="highlightOutlineEntry"
  :can-publish="hasAuthoredText"
  @open-outline="onOpenOutline"
  @open-verified-facts="onOpenVerifiedFacts"
  @insert-menu-opened="hasOpenedInsertMenu = true"
  @cite="onOpenCiteDefault"
  @link="onOpenLink"
  @close="onClose"
  @publish="onPublish"
/>
```

- [ ] **Step 5: Run the first focused GREEN cycle**

Run: `npm test -- tests/CdxToolbar.test.js tests/outlineSwitch.test.js`

Expected: both focused files pass, including the new focus test and private visibility cases.

- [ ] **Step 6: Expand the integration test harness for launch behavior**

Add these hoisted functions alongside the existing editor mocks:

```js
const mocks = vi.hoisted(() => ({
  getEditor: vi.fn(),
  setEditor: vi.fn(),
  focusInsertButton: vi.fn(),
}))
```

Update the existing `vi.mock('@/components/CdxToolbar.vue', ...)` module mock itself to expose the public method; do not add a second global stub for the same component:

```js
vi.mock('@/components/CdxToolbar.vue', () => ({
  default: {
    name: 'CdxToolbar',
    props: ['showVerifiedFacts', 'canPublish'],
    emits: ['open-outline', 'open-verified-facts', 'publish'],
    methods: { focusInsertButton: mocks.focusInsertButton },
    template: '<div />',
  },
}))
```

Give the Settings stub a real focusable button so pending/focus behavior is observable:

```js
const stubs = {
  // retain the other existing stubs

SettingsDialog: {
  name: 'SettingsDialog',
  props: ['open', 'demoLaunchPending'],
  emits: ['outline-selected', 'open-verified-facts-demo', 'update:open'],
  template: `<button
    v-if="open"
    data-testid="open-verified-facts-demo"
    :disabled="demoLaunchPending"
    @click="$emit('open-verified-facts-demo')"
  >Open Verified facts demo</button>`,
},
EditCheckRail: {
  name: 'EditCheckRail',
  props: ['checks', 'index'],
  template: '<div />',
},
CommunityTipsSheet: {
  name: 'CommunityTipsSheet',
  props: ['open'],
  template: '<div />',
},
}
```

Change `mountEditor` to accept `{ realTextEditor = false, attach = false }` and use `attachTo: document.body` when either value is true. Update existing Boolean call sites to the named option.

- [ ] **Step 7: Write failing successful-launch and exact-route tests**

Import `VERIFIED_FACTS_DEMO_ROUTE`. Add one real-editor test from another Country article (`title=Spain`) and one from another outline (`outline=person`). Each must assert a single `router.push(VERIFIED_FACTS_DEMO_ROUTE)`, exact final route, closed Settings, a different editor instance with empty text and no Undo, and one focus call after the instance changes.

```js
const previousEditor = wrapper.findComponent(TextEditor).vm.editor
previousEditor.commands.setContent('<p>Draft that belongs to Spain</p>')
await openSettings()
settingsDialog().vm.$emit('open-verified-facts-demo')
await flushPromises()

const currentEditor = wrapper.findComponent(TextEditor).vm.editor
expect(router.currentRoute.value.query).toEqual(VERIFIED_FACTS_DEMO_ROUTE.query)
expect(currentEditor.instanceId).not.toBe(previousEditor.instanceId)
expect(currentEditor.getText()).toBe('')
expect(currentEditor.commands.undo()).toBe(false)
expect(settingsDialog().props('open')).toBe(false)
expect(mocks.focusInsertButton).toHaveBeenCalledOnce()
```

For the exact-route case, construct the query with reversed insertion order, seed real editor text, emit launch, and assert `router.push` was not called, the instance/text remain identical, surrounding state remains seeded, Settings closes, and focus is not called.

- [ ] **Step 8: Write failing session-bucket reset tests**

Use `wrapper.vm.$.setupState` only to seed and inspect the named coordinator refs; this avoids manufacturing unrelated editor events and directly verifies the reset boundary:

```js
const state = wrapper.vm.$.setupState
state.addedOutlineItems = new Set(['country:lead'])
state.pendingChecks = [{ name: 'paste' }, { name: 'completeSection' }]
state.activeCheckIndex = 1
state.hasAuthoredText = true
state.nextCitationNumber = 4
state.tipSuggestion = { title: 'Tips', open: true }
state.hasDismissedTip = true
```

After a successful launch assert the exact reset values: empty Set, empty checks, index 0, authored false, citation number 1, null tip, and dismissed false. Before/after assertions must also observe `OutlinePopover.addedItems`, `EditCheckRail.checks/index`, `CdxToolbar.canPublish`, and `CommunityTipsSheet.open` where those props exist so the test proves user-visible coordination as well as ref values.

- [ ] **Step 9: Write failing aborted and rejected launch tests**

After each `mountEditor` completes, create navigation spies/guards so initial router setup is not counted. In both tests, use a real `TextEditor`, attach to `document.body`, write `'<p>Keep this draft</p>'`, seed the coordinator state from Step 8, open Settings, focus and click its launcher.

Aborted case:

```js
removeGuard = router.beforeEach((to) => {
  if (to.query.verifiedfacts === '1') return false
})
const previousEditor = wrapper.findComponent(TextEditor).vm.editor
const button = wrapper.get('[data-testid="open-verified-facts-demo"]')
button.element.focus()
await button.trigger('click')
await flushPromises()

expect(router.currentRoute.value.query.title).toBe('Spain')
expect(wrapper.findComponent(TextEditor).vm.editor.instanceId).toBe(previousEditor.instanceId)
expect(previousEditor.getText()).toBe('Keep this draft')
expect(settingsDialog().props('open')).toBe(true)
expect(settingsDialog().props('demoLaunchPending')).toBe(false)
expect(button.element.disabled).toBe(false)
expect(document.activeElement).toBe(button.element)
```

Rejected case uses `vi.spyOn(router, 'push').mockRejectedValue(new Error('Navigation rejected'))` and repeats the same preservation assertions. The shared assertion helper must compare every seeded session bucket from Step 8, not only the editor document.

- [ ] **Step 10: Write failing redirect and final-route-mismatch tests**

Redirect case:

```js
removeGuard = router.beforeEach((to) => {
  if (to.query.verifiedfacts === '1' && to.query.title === 'Portugal') {
    return { name: 'editor', query: { ...to.query, title: 'Spain' } }
  }
})
```

After clicking the launcher, assert the route ends at flagged Spain but the editor instance/document, session buckets, open Settings, enabled/focused button, and zero toolbar-focus calls are preserved.

Final mismatch case creates `vi.spyOn(router, 'push').mockResolvedValue(undefined)` after mount. Because the spy does not navigate, assert the original Spain route and every preservation condition remain. These are separate `it(...)` blocks with their own setup and cleanup.

- [ ] **Step 11: Write the failing duplicate-request and focus-order tests**

Use a controlled promise around the real bound `router.push`:

```js
let releaseNavigation
const navigationGate = new Promise((resolve) => {
  releaseNavigation = resolve
})
const originalPush = router.push.bind(router)
const push = vi.spyOn(router, 'push').mockImplementation(async (target) => {
  await navigationGate
  return originalPush(target)
})

settingsDialog().vm.$emit('open-verified-facts-demo')
settingsDialog().vm.$emit('open-verified-facts-demo')
await nextTick()

expect(push).toHaveBeenCalledTimes(1)
expect(settingsDialog().props('demoLaunchPending')).toBe(true)
expect(mocks.focusInsertButton).not.toHaveBeenCalled()
expect(wrapper.findComponent(TextEditor).vm.editor.instanceId).toBe(previousEditor.instanceId)

releaseNavigation()
await flushPromises()

expect(wrapper.findComponent(TextEditor).vm.editor.instanceId).not.toBe(previousEditor.instanceId)
expect(mocks.focusInsertButton).toHaveBeenCalledTimes(1)
```

This proves focus moves only after final-route validation and the keyed editor remount.

- [ ] **Step 12: Write the failing redirected-outline preservation test**

Extend the existing real-editor outline-switch group with a guard that intercepts only `outline=city` and redirects to the same editor route with `outline=person` plus `redirected=1`. Select City, then assert the final full path differs from the pre-resolved City target, the same editor instance/document and session buckets remain, Settings stays open, and the outline sheet does not reopen. Keep the existing success, aborted, and rejected outline tests unchanged.

- [ ] **Step 13: Run the second focused RED cycle**

Run: `npm test -- tests/outlineSwitch.test.js`

Expected: the new launch tests fail because `open-verified-facts-demo`, pending state, canonical navigation, explicit session revision, shared reset, and post-launch focus are not wired.

- [ ] **Step 14: Implement explicit session coordination and Settings wiring**

Import the route policy; define these refs; key `TextEditor` only by the explicit revision; and wire Settings exactly as shown:

```js
const toolbarRef = ref(null)
const editorSessionRevision = ref(0)
const isOpeningVerifiedFactsDemo = ref(false)

function resetArticleSessionState() {
  addedOutlineItems.value = new Set()
  pendingChecks.value = []
  activeCheckIndex.value = 0
  hasAuthoredText.value = false
  nextCitationNumber.value = 1
  tipSuggestion.value = null
  hasDismissedTip.value = false
}
```

```vue
<TextEditor
  :key="editorSessionRevision"
  :show-outline-entry="!isToolbarOutlineVariant"
  :show-placeholder="isToolbarOutlineVariant"
  :suppress-auto-focus="isToolbarOutlineVariant"
  @open-outline="onOpenOutline"
  @open-settings="settingsDialogOpen = true"
  @open-source-context="onOpenSourceContext"
  @outline-sections-changed="onOutlineSectionsChanged"
  @authored="onAuthored"
  @editor-focused="onEditorFocused"
  @pasted="onPasted"
/>
<SettingsDialog
  v-model:open="settingsDialogOpen"
  :demo-launch-pending="isOpeningVerifiedFactsDemo"
  @outline-selected="onOutlineSelected"
  @open-verified-facts-demo="onOpenVerifiedFactsDemo"
/>
```

Before `router.replace()` in `onOutlineSelected`, resolve the complete intended destination. Preserve the current query values while changing only `outline`, preserve the current hash, and require exact `fullPath` equality afterward so any redirect is rejected:

```js
const target = {
  name: 'editor',
  query: { ...route.query, outline: outlineId },
  hash: route.hash,
}
const expectedFullPath = router.resolve(target).fullPath
const failure = await router.replace(target)
if (isNavigationFailure(failure)) return
if (router.currentRoute.value.fullPath !== expectedFullPath) return
```

Only then increment `editorSessionRevision`, call `resetArticleSessionState()`, and keep the existing outline-sheet behavior.

- [ ] **Step 15: Implement the guarded demo transition**

```js
async function onOpenVerifiedFactsDemo() {
  if (isOpeningVerifiedFactsDemo.value) return
  if (isExactVerifiedFactsDemoRoute(route)) {
    settingsDialogOpen.value = false
    return
  }

  isOpeningVerifiedFactsDemo.value = true
  try {
    const failure = await router.push(VERIFIED_FACTS_DEMO_ROUTE)
    if (isNavigationFailure(failure)) return
    if (!isExactVerifiedFactsDemoRoute(router.currentRoute.value)) return

    editorSessionRevision.value += 1
    resetArticleSessionState()
    initialView.value = 'outline'
    settingsDialogOpen.value = false
    isPopoverOpen.value = true
    await nextTick()
    toolbarRef.value?.focusInsertButton()
  } catch {
    return
  } finally {
    isOpeningVerifiedFactsDemo.value = false
  }
}
```

Do not inherit arbitrary query parameters. Do not reset or close Settings before the confirmed-success block. Do not open Verified facts automatically. Pending is always cleared by `finally`; on failure the real Settings button becomes enabled without being replaced, preserving focus.

- [ ] **Step 16: Run the second focused GREEN cycle**

Run: `npm test -- tests/CdxToolbar.test.js tests/outlineSwitch.test.js`

Expected: all toolbar and integration tests PASS, including another-outline, same-outline, exact-route, aborted, rejected, redirected, final-mismatch, duplicate, session-bucket, and focus cases.

- [ ] **Step 17: Run the related Verified facts suite**

Run: `npm test -- tests/SettingsDialog.test.js tests/verifiedFactsDemo.test.js tests/CdxToolbar.test.js tests/outlineSwitch.test.js tests/outlinePopover.test.js tests/VerifiedFactsReferenceList.test.js tests/reviewedVerifiedFacts.test.js`

Expected: all related tests PASS with no unhandled errors.

- [ ] **Step 18: Commit the integration**

```bash
git add src/components/CdxToolbar.vue src/views/EditorView.vue tests/CdxToolbar.test.js tests/outlineSwitch.test.js
git commit -m "feat: launch private verified facts demo"
```

## Chunk 3: Release verification

### Task 4: Verify the complete prototype before publishing

**Files:**
- Verify only; no production files expected

- [ ] **Step 1: Record the release base and run focused tests**

Run:

```bash
git fetch de144 main
VF_RELEASE_BASE=$(git rev-parse de144/main)
echo "$VF_RELEASE_BASE"
npm test -- tests/SettingsDialog.test.js tests/verifiedFactsDemo.test.js tests/CdxToolbar.test.js tests/outlineSwitch.test.js tests/outlinePopover.test.js tests/VerifiedFactsReferenceList.test.js tests/reviewedVerifiedFacts.test.js
```

Expected: record the immutable `de144/main` SHA; all related files and tests pass with no unhandled errors.

- [ ] **Step 2: Run the full automated suite**

Run: `npm test`

Expected: every Vitest file and test passes.

- [ ] **Step 3: Run non-mutating static checks and production build**

Run: `npx oxlint .`

Expected: exit 0 with no Oxlint errors and no files changed.

Run: `npx eslint .`

Expected: exit 0 with no ESLint errors and no files changed.

Run: `npx prettier --check src tests docs/superpowers/specs/2026-08-04-settings-verified-facts-demo-design.md docs/superpowers/plans/2026-08-04-settings-verified-facts-demo.md`

Expected: every matched file uses Prettier formatting.

Run: `git diff --check "$VF_RELEASE_BASE"..HEAD`

Expected: no whitespace errors across every committed release change.

Run: `git diff --name-status "$VF_RELEASE_BASE"..HEAD`

Expected: only the reviewed Verified facts implementation, its specs/plans, and tests appear.

Run: `npm run build`

Expected: Vite production build exits 0; the existing large-chunk advisory is non-blocking.

- [ ] **Step 4: Start the production preview and verify desktop/mobile in the in-app browser**

Run the built app in a persistent terminal session:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Open this exact normal route:

`http://127.0.0.1:4173/editor?lang=en&variant=toolbar-outline&outline=country&title=Portugal&articleguidance=1&sourceOrigin=redlink`

Walk through both normal and demo routes:

1. Open unflagged Portugal and confirm `+` has no Verified facts item.
2. Open bottom-right Settings and confirm the full outline selector remains above Prototype demos.
3. Select City from the existing outline selector; confirm the route changes to `outline=city`, the editor resets, and Suggested sections shows City. Return to the exact normal Portugal URL.
4. Reopen Settings and activate the launcher; confirm the exact flagged Portugal URL, a fresh draft, and focus on the toolbar `+`.
5. Open `+`, select Verified facts, and confirm all four reviewed facts and their Wikidata links.
6. Confirm Back returns to the previous route.
7. Repeat the essential Settings/launch/menu/four-facts checks at a 390×844 viewport with no horizontal overflow.
8. Confirm no application console errors.

- [ ] **Step 5: Request final spec and code-quality review, then rerun gates after fixes**

Review the complete diff from `"$VF_RELEASE_BASE"` through `HEAD` against `docs/superpowers/specs/2026-08-04-settings-verified-facts-demo-design.md`. Fix and re-verify any Critical or Important issue before publishing.

After any review-driven code or test change, rerun Steps 1–4 in full. Do not rely on pre-fix results.

- [ ] **Step 6: Prove a fast-forward release and publish to the Pages remote**

Run:

```bash
git fetch de144 main
git merge-base --is-ancestor de144/main HEAD
git rev-list --left-right --count de144/main...HEAD
git status --short
git push de144 HEAD:main
```

Expected before push: ancestry exits 0; the left/right count is `0 <positive-number>`; the worktree is clean; no force is used. The push must report a fast-forward update of `de144/main`.

Find and monitor the exact deployment:

```bash
gh run list --repo Sudhanshugtm/DE1.4.4 --workflow "Deploy to GitHub Pages" --branch main --limit 1 --json databaseId,headSha,status,conclusion,url
gh run watch <databaseId> --repo Sudhanshugtm/DE1.4.4 --exit-status
```

Expected: `headSha` equals local `HEAD`; the workflow completes successfully.

- [ ] **Step 7: Verify the public normal and direct-demo routes**

Repeat the normal-route hidden-entry and Settings-to-demo checks on:

`https://sudhanshugtm.github.io/DE1.4.4/editor?lang=en&variant=toolbar-outline&outline=country&title=Portugal&articleguidance=1&sourceOrigin=redlink`

Then open and refresh the direct flagged route:

`https://sudhanshugtm.github.io/DE1.4.4/editor?lang=en&variant=toolbar-outline&outline=country&title=Portugal&articleguidance=1&sourceOrigin=redlink&verifiedfacts=1`

Expected: both deep links survive refresh; normal stays hidden; Settings launches the flagged URL; flagged `+` exposes Verified facts; all four Portugal facts render; no application errors appear.
