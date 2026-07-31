# Outline Switch and Section Delete Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reset the local VisualEditor when a different outline is selected, reopen the new outline sheet, and add accessible per-section trash controls matching the supplied mobile reference.

**Architecture:** `EditorView` coordinates the outline transition and controlled added-item state. TipTap extensions preserve stable outline keys on H2 nodes and render semantic delete buttons as non-document decorations; editor transactions remain the source of truth for which H2 sections are present.

**Tech Stack:** Vue 3, TipTap 3, ProseMirror, Wikimedia Codex icons/tokens, Vitest 2, Vue Test Utils, jsdom.

**Design sources:** The approved behavior is in `docs/superpowers/specs/2026-07-31-outline-switch-reset-design.md`. The section control follows the supplied `Mobile.png` reference: compact visible trash glyph, right-aligned on the H2 rule, with a larger invisible tap target.

**Workspace constraint:** Preserve the user's uncommitted `src/components/CdxToolbar.vue` work. Do not stage, format, or edit that file. The untracked pre-editor plan is also outside scope.

---

## Chunk 1: Test foundation and outline switching

### Task 1: Add focused test infrastructure and a fresh editor reset

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/utils/resetEditorContent.js`
- Create: `tests/resetEditorContent.test.js`

- [ ] **Step 1: Install the compatible test dependencies**

Run:

```bash
npm install --save-dev vitest@2.1.9 @vue/test-utils@2.4.6 jsdom@25.0.1
npm install @tiptap/core@^3.20.0
```

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 2: Write the failing editor-reset test**

Create `tests/resetEditorContent.test.js`:

```js
// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { undoDepth, redoDepth } from '@tiptap/pm/history'
import { resetEditorContent } from '../src/utils/resetEditorContent'

describe('resetEditorContent', () => {
  test('starts an empty document with empty undo and redo history', () => {
    const editor = new Editor({
      extensions: [StarterKit],
      content: '<p>Text from the previous outline</p>',
    })

    editor.commands.insertContent('<p>More text</p>')
    expect(undoDepth(editor.state)).toBeGreaterThan(0)

    resetEditorContent(editor)

    expect(editor.isEmpty).toBe(true)
    expect(undoDepth(editor.state)).toBe(0)
    expect(redoDepth(editor.state)).toBe(0)
    expect(editor.commands.undo()).toBe(false)
    editor.destroy()
  })
})
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
npx vitest run tests/resetEditorContent.test.js
```

Expected: FAIL because `src/utils/resetEditorContent.js` does not exist.

- [ ] **Step 4: Implement the minimal fresh-state reset**

Create `src/utils/resetEditorContent.js`:

```js
import { EditorState } from '@tiptap/pm/state'

export function resetEditorContent(editor) {
  if (!editor?.view) return false

  const doc = editor.schema.topNodeType.createAndFill()
  const state = EditorState.create({
    schema: editor.schema,
    doc,
    plugins: editor.state.plugins,
  })

  editor.view.updateState(state)
  return true
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
npx vitest run tests/resetEditorContent.test.js
```

Expected: 1 test passes.

- [ ] **Step 6: Commit only Task 1 files**

```bash
git add package.json package-lock.json src/utils/resetEditorContent.js tests/resetEditorContent.test.js
git commit -m "Add fresh editor reset foundation"
```

### Task 2: Coordinate outline selection, route safety, and automatic sheet reopening

**Files:**
- Modify: `src/components/SettingsDialog.vue`
- Modify: `src/views/EditorView.vue`
- Modify: `src/components/OutlinePopover.vue`
- Create: `tests/outlineSwitch.test.js`
- Create: `tests/outlinePopover.test.js`

- [ ] **Step 1: Write failing coordinator tests**

In `tests/outlineSwitch.test.js`, mount `EditorView` with a memory router and named stubs for
`TextEditor`, `SettingsDialog`, and `OutlinePopover`. Mock `resetEditorContent` and
`useEditorInstance`. Explicitly stub `CdxToolbar` so this test never imports or renders the user's
dirty toolbar file.

Cover these observable cases:

```js
test('switches outline, resets editor, closes settings, and opens outline sheet')
test('selecting the active outline closes settings without resetting or reopening')
test('an aborted navigation preserves editor and sheet state and leaves settings open')
test('a rejected navigation preserves editor and sheet state and leaves settings open')
test('waits for successful navigation before resetting editor state')
test('switches route and sheet when no editor instance is available')
```

For the successful case:

```js
await router.push({
  name: 'editor',
  query: { lang: 'en', variant: 'toolbar-outline', outline: 'person' },
})

outlinePopover.vm.$emit('update:open', false)
textEditor.vm.$emit('open-settings')
await nextTick()
expect(settingsDialog.props('open')).toBe(true)
settingsDialog.vm.$emit('outline-selected', 'city')
await flushPromises()

expect(router.currentRoute.value.query).toMatchObject({
  lang: 'en',
  variant: 'toolbar-outline',
  outline: 'city',
})
expect(resetEditorContent).toHaveBeenCalledWith(editor)
expect(outlinePopover.props('open')).toBe(true)
expect(outlinePopover.props('initialView')).toBe('outline')
expect(settingsDialog.props('open')).toBe(false)
```

Create an aborted real Vue Router navigation with a temporary `beforeEach` guard returning
`false`; replace `router.replace` with a rejected mock only after the initial route has mounted.
Assert the guard or `router.replace` was reached so a missing selection handler cannot create a
false pass. Use a deferred successful `router.replace` promise in the ordering test and assert
`resetEditorContent` is untouched until that promise resolves. Clean up guards, spies, wrappers,
and mocked editors in `afterEach`.

Pre-populate `addedItems` through the OutlinePopover stub before the successful switch, then assert
its controlled prop is an empty Set after switching.

- [ ] **Step 2: Write the failing dismissed-sheet scroll test**

In `tests/outlinePopover.test.js`, mount `OutlinePopover` with `selectableOutlines: true`, a
controlled empty `addedItems` Set, Codex/content component stubs, and a jsdom `ResizeObserver`
mock. The CdxPopover stub must use `v-show` so the same `.outline-popover-body` DOM node remains
attached while dismissed. Set the body scroll position, dismiss it, change `outline` in the
memory router, reopen it, then assert:

```js
expect(body.scrollTop).toBe(0)
expect(body.classList.contains('is-scrolled')).toBe(false)
```

- [ ] **Step 3: Run both tests and verify RED**

Run:

```bash
npx vitest run tests/outlineSwitch.test.js tests/outlinePopover.test.js
```

Expected: failures because Settings owns navigation, EditorView has no selection coordinator, and
the popover drops its scroll-reset request while detached.

- [ ] **Step 4: Make Settings emit intent without owning completion**

In `SettingsDialog.vue`:

```js
const emit = defineEmits(['outline-selected'])

function onSelectOutline(outlineId) {
  emit('outline-selected', outlineId)
}
```

Remove `useRouter`; retain `useRoute` for the current-outline label. Do not close the dialog in
this component.

- [ ] **Step 5: Implement the safe EditorView transition**

In `EditorView.vue`:

```js
import { isNavigationFailure } from 'vue-router'
import { resetEditorContent } from '@/utils/resetEditorContent'
import { simpleEnglishOutlinesById } from '@/config/outlines/simpleEnglish'

const activeOutlineId = computed(() => {
  const outlineId = route.query.outline
  return typeof outlineId === 'string' && Object.hasOwn(simpleEnglishOutlinesById, outlineId)
    ? outlineId
    : 'person'
})

const addedOutlineItems = ref(new Set())

async function onOutlineSelected(outlineId) {
  if (outlineId === activeOutlineId.value) {
    settingsDialogOpen.value = false
    return
  }

  try {
    const failure = await router.replace({
      query: { ...route.query, outline: outlineId },
    })
    if (isNavigationFailure(failure)) return
  } catch {
    return
  }

  resetEditorContent(getEditor())
  addedOutlineItems.value = new Set()
  initialView.value = 'outline'
  settingsDialogOpen.value = false
  isPopoverOpen.value = true
}
```

Wire `@outline-selected="onOutlineSelected"` on SettingsDialog. Do not add a route watcher that
clears content.

- [ ] **Step 6: Introduce the controlled added-items model**

Pass `v-model:added-items="addedOutlineItems"` from EditorView to OutlinePopover. In
`OutlinePopover.vue`, replace the local set with:

```js
const addedItems = defineModel('addedItems', {
  type: Set,
  required: true,
})
```

Pass it through with `v-model:added-items="addedItems"` to `OutlineStructureList`.

- [ ] **Step 7: Preserve a pending scroll reset in OutlinePopover**

Add `pendingOutlineScrollReset = ref(false)`. On selected-outline change, set the view to
`outline`, mark the reset pending, and reset immediately only if a body is attached. After
`attachObserver()` on open, call `applyPendingOutlineScrollReset()` before clearing the flag.

- [ ] **Step 8: Run the focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/outlineSwitch.test.js tests/outlinePopover.test.js
```

Expected: `outlineSwitch.test.js` reports 6 passing tests, `outlinePopover.test.js` reports 1
passing test, and Vitest reports zero failures.

- [ ] **Step 9: Commit only Task 2 files**

```bash
git add src/components/SettingsDialog.vue src/views/EditorView.vue src/components/OutlinePopover.vue tests/outlineSwitch.test.js tests/outlinePopover.test.js
git commit -m "Reset editor when switching outlines"
```

---

## Chunk 2: Keyed sections and semantic delete controls

### Task 3: Preserve stable outline keys and compute exact section ranges

**Files:**
- Create: `src/extensions/sectionHeading.js`
- Create: `src/extensions/sectionDeleteControls.js`
- Modify: `src/utils/outlineWikitext.js`
- Create: `tests/sectionDeleteControls.test.js`
- Modify: `tests/outlineWikitext.test.js` if it exists; otherwise create it

- [ ] **Step 1: Install the heading extension used by this chunk**

Run:

```bash
npm install @tiptap/extension-heading@^3.20.0
```

- [ ] **Step 2: Write failing metadata and range tests**

Test that:

```js
expect(outlineItemToEditorHtml({ key: 'city:history', title: 'History' })).toContain(
  'data-outline-item-key="city:history"',
)
```

Create a real TipTap editor with:

```html
<p>Lead</p>
<h2 data-outline-item-key="city:history">History</h2>
<p>User text</p>
<h3>Early history</h3>
<p>Nested text</p>
<h2 data-outline-item-key="city:geography">Geography</h2>
<p>Keep this</p>
```

Assert `findSectionRange()` begins before History and ends before Geography. Add:

- a three-H2 regression proving deletion stops at the immediately following H2 rather than the
  final H2;
- a manually authored, unkeyed next H2 that still ends the keyed section but receives no control;
- a final-H2 case ending at `doc.content.size`;
- `getOutlineSectionKeys()` returning only stable keyed H2s.

- [ ] **Step 3: Run tests and verify RED**

Run:

```bash
npx vitest run tests/sectionDeleteControls.test.js tests/outlineWikitext.test.js
```

Expected: `outlineWikitext.test.js` fails its missing metadata assertion and
`sectionDeleteControls.test.js` fails to resolve the missing section extension module.

- [ ] **Step 4: Preserve the stable key on heading HTML**

Update `outlineItemToEditorHtml()`:

```js
const outlineItemKey = escapeHtml(item.key || '')
const heading = `<h2 data-outline-item-key="${outlineItemKey}">${escapeHtml(item.title || '')}</h2>`
```

Lead output remains unchanged.

- [ ] **Step 5: Create the keyed SectionHeading extension**

Create `src/extensions/sectionHeading.js`:

```js
import Heading from '@tiptap/extension-heading'

export const SectionHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      outlineItemKey: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-outline-item-key'),
        renderHTML: ({ outlineItemKey }) =>
          outlineItemKey ? { 'data-outline-item-key': outlineItemKey } : {},
      },
    }
  },
})
```

- [ ] **Step 6: Add pure section lookup helpers**

In `sectionDeleteControls.js`, export:

```js
export function getOutlineSectionKeys(doc) {
  const keys = new Set()
  doc.forEach((node) => {
    if (node.type.name === 'heading' && node.attrs.level === 2 && node.attrs.outlineItemKey) {
      keys.add(node.attrs.outlineItemKey)
    }
  })
  return keys
}

export function findSectionRange(doc, outlineItemKey) {
  let from = null
  let to = doc.content.size
  let foundEnd = false

  doc.forEach((node, offset) => {
    if (foundEnd) return
    const isH2 = node.type.name === 'heading' && node.attrs.level === 2
    if (!isH2) return
    if (from !== null) {
      to = offset
      foundEnd = true
      return
    }
    if (node.attrs.outlineItemKey === outlineItemKey) from = offset
  })

  return from === null ? null : { from, to }
}
```

The `foundEnd` guard is mandatory because ProseMirror's `forEach()` callback does not
short-circuit.

- [ ] **Step 7: Run metadata/range tests and verify GREEN**

Run:

```bash
npx vitest run tests/sectionDeleteControls.test.js tests/outlineWikitext.test.js
```

Expected: `outlineWikitext.test.js` reports 1 passing test,
`sectionDeleteControls.test.js` reports 5 passing helper tests, and Vitest reports zero failures.

- [ ] **Step 8: Commit only Task 3 files**

```bash
git add package.json package-lock.json src/extensions/sectionHeading.js src/extensions/sectionDeleteControls.js src/utils/outlineWikitext.js tests/sectionDeleteControls.test.js tests/outlineWikitext.test.js
git commit -m "Preserve outline section identity"
```

### Task 4: Render and operate the accessible section trash button

**Files:**
- Modify: `src/extensions/sectionDeleteControls.js`
- Modify: `src/components/TextEditor.vue`
- Modify: `src/views/EditorView.vue`
- Modify: `src/components/OutlinePopover.vue`
- Modify: `tests/sectionDeleteControls.test.js`
- Modify: `tests/outlineSwitch.test.js`
- Create: `tests/TextEditor.test.js`

- [ ] **Step 1: Add failing behavior tests**

Using the real TipTap editor and jsdom, assert:

- only keyed H2 nodes get `.section-delete-control`;
- the element is `BUTTON`, `type="button"`, `contenteditable="false"`, and its accessible name is
  `Delete History section`;
- the widget DOM is inside the H2 and absent from `editor.getHTML()`;
- click deletes History, User text, Early history, and Nested text while preserving Lead,
  Geography, and Keep this;
- focus returns to `editor.view.dom`;
- `undo()` restores both keyed content and `getOutlineSectionKeys()` membership;
- `redo()` removes both again.

In `tests/TextEditor.test.js`, mount the real TextEditor, insert two keyed sections, activate the
real first trash button, then Undo and Redo through the exposed real editor. Assert the component's
actual `outline-sections-changed` emissions remove, restore, and remove the first key. Feed those
real emitted Sets into an EditorView coordinator test and assert the controlled `addedItems` prop
changes accordingly; do not replace this with manually invented deletion/Undo events.

- [ ] **Step 2: Run behavior tests and verify RED**

Run:

```bash
npx vitest run tests/sectionDeleteControls.test.js tests/TextEditor.test.js tests/outlineSwitch.test.js
```

Expected: the section-control behavior tests fail because the widget does not exist,
`TextEditor.test.js` fails because no real document-derived events are emitted, and the
EditorView controlled-state case fails.

- [ ] **Step 3: Implement the decoration widget**

`SectionDeleteControls` must:

- create a ProseMirror `Plugin` whose `decorations()` scans keyed H2 nodes;
- add a `Decoration.widget()` inside each heading at `offset + node.nodeSize - 1`, with
  `ignoreSelection: true` and a stable per-key decoration key;
- render a native button with the Codex `cdxIconTrash` paths inside a 20 by 20, `aria-hidden` SVG;
- set `type`, `contentEditable`, and `aria-label`;
- prevent pointer down from changing selection;
- use the native button's single `click` activation path for pointer, Enter, and Space;
- use `findSectionRange(view.state.doc, key)`;
- dispatch one deletion transaction with `TextSelection.near()` at the deletion boundary;
- call `view.focus()` after dispatch;
- use the decoration `stopEvent` option for button events.

Do not add custom key handlers or activation guards. Real-browser verification in Chunk 3 proves
native Enter and Space behavior.

- [ ] **Step 4: Register extensions and emit document-derived keys**

In `TextEditor.vue`, configure:

```js
StarterKit.configure({
  heading: false,
  link: { openOnClick: false },
}),
SectionHeading.configure({ levels: [2, 3, 4] }),
SectionDeleteControls,
```

Add `outline-sections-changed` to emits. After initial editor registration and every
`transaction.docChanged`, emit a fresh `getOutlineSectionKeys(editor.state.doc)`. The real
TextEditor test must prove this happens after deletion, Undo, and Redo.

- [ ] **Step 5: Make added items a controlled model**

In `EditorView.vue`, retain the controlled Set introduced in Task 2 and add:

```js
function onOutlineSectionsChanged(sectionKeys) {
  const leadKeys = [...addedOutlineItems.value].filter((key) => key.endsWith(':lead'))
  addedOutlineItems.value = new Set([...leadKeys, ...sectionKeys])
}
```

Listen for `@outline-sections-changed` on TextEditor. The existing
`v-model:added-items="addedOutlineItems"` link from Task 2 propagates the result.

- [ ] **Step 6: Match the reference while preserving input quality**

In `TextEditor.vue` scoped styles:

```css
.text-editor :deep(.ProseMirror h2[data-outline-item-key]) {
  position: relative;
  padding-inline-end: 44px;
}

.text-editor :deep(.section-delete-control) {
  position: absolute;
  inset-inline-end: 0;
  top: 50%;
  width: 44px;
  height: 44px;
  padding: 12px;
  border: 0;
  background: transparent;
  color: var(--color-base);
  cursor: pointer;
  transform: translateY(-50%);
}

.text-editor :deep(.section-delete-control svg) {
  display: block;
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.text-editor :deep(.section-delete-control:focus-visible) {
  outline: var(--border-width-thick) solid var(--color-progressive);
  outline-offset: calc(-1 * var(--border-width-thick));
}

@media (hover: hover) {
  .text-editor :deep(.section-delete-control:hover) {
    background-color: var(--background-color-interactive-subtle--hover);
  }
}
```

Use existing Codex tokens present in the installed token set; if a named fallback is unavailable,
choose the closest existing Codex token rather than a hard-coded color.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/sectionDeleteControls.test.js tests/TextEditor.test.js tests/outlineSwitch.test.js
```

Expected: `sectionDeleteControls.test.js`, `TextEditor.test.js`, and `outlineSwitch.test.js` report
all named cases passing and Vitest reports zero failures. Keyboard Enter/Space activation is
verified in the real browser in Chunk 3 because jsdom does not reproduce native button default
activation reliably.

- [ ] **Step 8: Commit only Task 4 files**

```bash
git add src/extensions/sectionDeleteControls.js src/components/TextEditor.vue src/views/EditorView.vue tests/sectionDeleteControls.test.js tests/TextEditor.test.js tests/outlineSwitch.test.js
git commit -m "Add accessible outline section deletion"
```

---

## Chunk 3: Full verification and local experience

### Task 5: Verify behavior, craft, and local runtime

**Files:**
- Modify only if a focused verification exposes a defect in files already in scope.

- [ ] **Step 1: Run the complete automated suite**

```bash
npm test
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run focused non-mutating lint**

```bash
npx eslint src/components/SettingsDialog.vue src/components/OutlinePopover.vue src/components/TextEditor.vue src/views/EditorView.vue src/extensions/sectionHeading.js src/extensions/sectionDeleteControls.js src/utils/resetEditorContent.js tests --cache=false
npx oxlint src/components/SettingsDialog.vue src/components/OutlinePopover.vue src/components/TextEditor.vue src/views/EditorView.vue src/extensions/sectionHeading.js src/extensions/sectionDeleteControls.js src/utils/resetEditorContent.js tests
```

Expected: zero errors in changed files. Do not run the repository's auto-fixing lint script over
the user's dirty toolbar file.

- [ ] **Step 3: Run production build and whitespace validation**

```bash
npm run build
git diff --check
```

Expected: both exit zero. The existing Vite chunk-size warning is acceptable.

- [ ] **Step 4: Start the local server**

```bash
npm run dev -- --host 127.0.0.1
```

Keep the process running and record the exact local URL.

- [ ] **Step 5: Verify the mobile flow in a real browser**

At an exact 428 by 932 CSS-pixel viewport matching
`/Users/sshugautam/Desktop/Mobile.png`:

1. Open `/editor?lang=en&variant=toolbar-outline&outline=person`.
2. Add Introduction and at least two H2 sections.
3. Type unique text inside the first H2.
4. Dismiss the sheet, open Settings, and select a different outline.
5. Confirm the URL changes, the editor is empty, Settings closes, and the new outline sheet opens
   at its top with no added checkmarks.
6. Add two H2 sections, type unique nested content in the first, then activate its trash button.
7. Confirm the first section and nested content disappear, while lead and the second H2 remain.
8. Confirm the deleted section becomes addable again.
9. Undo and Redo; confirm editor content and the sheet checkmark remain synchronized.
10. Tab to the trash button, activate with Enter and Space in separate repetitions, and confirm
    visible focus and editor-focus restoration.
11. Inspect the section-heading alignment against `Mobile.png`: 20px trash glyph at the right end
    of the heading rule, 44px tap target, no layout collision with long titles.

Repeat a smoke pass at 1280 by 800 CSS pixels: add and delete a section, switch outlines, and
confirm the editor and sheet remain usable with pointer and keyboard.

- [ ] **Step 6: Prove the user's toolbar patch is unchanged**

The initial unstaged toolbar diff SHA-256 is:

```text
b1017ad668c5ffa190303e0977e17150e038aae624e1ff14e0f70e71815a17ac
```

Run:

```bash
git diff -- src/components/CdxToolbar.vue | shasum -a 256
git diff --cached --name-only -- src/components/CdxToolbar.vue
git log dc38c30..HEAD --format='%H' -- src/components/CdxToolbar.vue
```

Expected: the hash matches exactly, and the staged-name and feature-commit commands produce no
output.

- [ ] **Step 7: Inspect the final scoped diff**

```bash
git status --short
git diff --stat HEAD~4..HEAD
git diff -- src/components/CdxToolbar.vue
```

Expected: `CdxToolbar.vue` remains only the user's pre-existing uncommitted change and is absent
from feature commits.

- [ ] **Step 8: Stop the local server after browser verification**

Send Ctrl-C to the exact development-server session started in Step 4 and verify the process exits.
The final handoff will provide the command and URL for the user to restart it locally.
