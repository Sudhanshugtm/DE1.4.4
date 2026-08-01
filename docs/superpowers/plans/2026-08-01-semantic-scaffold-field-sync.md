# Semantic Scaffold Field Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make explicitly equivalent scaffold facts synchronize across current and later-added
outline sections without conflating ambiguous repeated labels.

**Architecture:** A per-outline binding manifest supplies semantic keys. The outline renderer
stores those keys in an invisible TipTap mark, and a document-driven FieldBinding extension
commits whole-field edits, updates linked ranges, and hydrates later insertions without a stale
external value cache.

**Tech Stack:** Vue 3, TipTap 3, ProseMirror, Vitest 2, Vue Test Utils, jsdom, Playwright.

**Design:** `docs/superpowers/specs/2026-08-01-semantic-scaffold-field-sync-design.md`

---

## Chunk 1: Semantic metadata and editor behavior

### Task 1: Implement tested semantic scaffold bindings

**Files:**

- Create: `src/config/outlines/fieldBindings.js`
- Create: `src/extensions/scaffoldBindingMark.js`
- Modify: `src/utils/outlineWikitext.js`
- Modify: `src/utils/scaffoldFields.js`
- Replace: `src/extensions/fieldBinding.js`
- Modify: `src/components/OutlineStructureList.vue`
- Modify: `src/components/TextEditor.vue`
- Modify: `src/views/EditorView.vue`
- Create: `tests/fieldBindings.test.js`
- Create: `tests/fieldBinding.test.js`
- Modify: `tests/outlineWikitext.test.js`
- Modify: `tests/TextEditor.test.js`
- Modify: `tests/outlineSwitch.test.js`

- [ ] **Step 1: Write manifest and rendering tests first**

Add failing tests that require:

```js
expect(getFieldBindingKey('country', '[Country name]')).toBe('country:subject-name')
expect(getFieldBindingKey('company', '[Company name]')).toBe(
  getFieldBindingKey('company', '[Company Name]'),
)
expect(getFieldBindingKey('person', '[year]')).toBeNull()
expect(getFieldBindingKey('city', '[region/country]')).toBeNull()
expect(outlineItemToEditorHtml(countryLead, { isLead: true, outlineId: 'country' }))
  .toContain('data-scaffold-binding="country:subject-name"')
```

Also validate every manifest label exists in its outline and every semantic group occurs at least
twice across its declared aliases, so catalogue drift fails visibly.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npx vitest run tests/fieldBindings.test.js tests/outlineWikitext.test.js
```

Expected: FAIL because the manifest, lookup, semantic rendering option, and mark do not exist.

- [ ] **Step 3: Add the minimal manifest, renderer integration, and TipTap mark**

Create the explicit 38-outline-scoped manifest enumerated in the design, returning `null` by
default. Extend inline and block rendering with an optional `outlineId`; stash declared field spans
before HTML escaping and link parsing. Add a `scaffoldBinding` mark that parses/renders both the
semantic key and original placeholder and has no visual style. In `OutlineStructureList.vue`, pass
`props.outline.id` to both preview rendering and inserted item HTML.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run the Step 2 command and require all focused tests to pass.

- [ ] **Step 5: Write failing synchronization tests**

Use a real TipTap editor with StarterKit, `ScaffoldBindingMark`, and `FieldBinding`. Cover:

1. a Country name edit updates lead plus three existing sections;
2. a second distinct fact can synchronize after the first (regression for uncleared state);
3. changing an already answered linked value updates every copy;
4. an outline section inserted after commitment hydrates from the marked document answer;
5. one Undo restores all prompts and Redo restores all answers after deliberately slow
   multi-transaction typing, paste, blur, Publish, and correction;
6. unbound `[year]` fields and near-match country variants stay independent;
7. partial edits do not propagate;
8. an explicit commit synchronizes without moving the caret;
9. deleting/undoing content and inserting later never uses a stale answer;
10. a synchronization transaction does not recurse.

- [ ] **Step 6: Run synchronization tests and verify RED**

Run:

```bash
npx vitest run tests/fieldBinding.test.js
```

Expected: FAIL against the existing raw-label, never-cleared implementation.

- [ ] **Step 7: Implement document-driven field discovery and synchronization**

Add `findBoundFields(doc)` and binding keys on unfilled fields. Replace FieldBinding with an active
marked-range lifecycle, explicit commit command, one tagged append transaction, and
outline-insertion hydration derived from marked answers. Preserve marks during replacement. Start
each whole-field edit with `closeHistory` and a unique `composition` group, keep all active edits
in that group, append sync to it, clear active state, then append a no-step `closeHistory`
transaction to close the group. Treat a bound range as answered only when its trimmed text is
non-empty and differs from its exact stored placeholder.

- [ ] **Step 8: Run synchronization tests and verify GREEN**

Run the Step 6 command and require all focused tests to pass.

- [ ] **Step 9: Write failing editor integration tests**

Extend `TextEditor.test.js` to prove a filled linked value is whole-selected on click and blur
commits the active field. Extend `outlineSwitch.test.js` with an EditorView assertion that Publish
calls `commitFieldBinding` before Complete section checks scan the document.

- [ ] **Step 10: Run integration tests and verify RED**

Run:

```bash
npx vitest run tests/TextEditor.test.js tests/outlineSwitch.test.js
```

Expected: FAIL until the mark, click target, blur hook, and publish command are integrated.

- [ ] **Step 11: Integrate the mark and commit boundary**

Register `ScaffoldBindingMark` before `FieldBinding`, select marked answered ranges before raw
scaffold fields, commit on editor blur, and call `commitFieldBinding` before Publish scans.

- [ ] **Step 12: Run all focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/fieldBindings.test.js tests/outlineWikitext.test.js tests/fieldBinding.test.js tests/TextEditor.test.js tests/outlineSwitch.test.js
```

Require zero failures and no console errors.

- [ ] **Step 13: Commit the implementation**

Stage only the design, plan, binding manifest, mark, renderer, scanner, extension, editor
integration, and their tests. Commit as `Synchronize semantic scaffold fields`.

## Chunk 2: Review and live verification

### Task 2: Verify the retained journey and prepare the merge

**Files:**

- Modify only files required by review findings.

- [ ] **Step 1: Run the full automated suite**

Run `npm test`. Compare any failure with the untouched baseline; do not label a baseline failure as
introduced by this branch.

- [ ] **Step 2: Run static and production checks**

Run `npm run lint` and `npm run build`; both must exit zero. Recheck `git diff --check` and the
intended diff.

- [ ] **Step 3: Verify in a real browser**

Start the owned Vite server with `npm run dev -- --host 127.0.0.1 --port 5175 --strictPort` and use
`http://127.0.0.1:5175/editor?outline=country&variant=toolbar-outline` at a 390 by 844 viewport.
Add Introduction and Geography, replace one `[Country name]`, leave the field, and confirm the
other updates. Immediately verify one Undo restores both prompts and Redo restores both answers.
Then add Politics and confirm its Country name arrives already filled. In a Person outline, verify
two distinct `[year]` prompts remain independent. Assert no page or browser console errors, retain
screenshots or machine assertions as evidence, and stop only the Vite process started for this
verification.

- [ ] **Step 4: Complete spec and code-quality review**

Review the full diff against the design contract, then separately review transaction lifecycle,
history behavior, semantic manifest safety, accessibility, and test quality. Resolve all critical
or important findings and rerun affected checks.

- [ ] **Step 5: Publish and merge**

Push `codex/scaffold-field-sync` to the `de144` remote, open a ready pull request against `main`,
merge it, confirm remote `main` contains the merge, and verify the deployed GitHub Pages journey
after its workflow completes.
