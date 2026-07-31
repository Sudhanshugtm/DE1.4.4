# Optional Sources Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the pre-editor Sources screen while allowing a participant with a matching selected subject to continue with zero accepted sources.

**Architecture:** Source collection remains an optional capability owned by the existing flow model and Sources view. Progression is guarded only by journey-bound subject selection; accepted sources remain validated and are serialized by the existing editor-query builder. Browser coverage exercises both zero-source and accepted-source handoffs.

**Tech Stack:** Vue 3, Vue Router, Wikimedia Codex, Node test runner, Vitest, Playwright, Vite

---

## Chunk 1: Optional progression and release

### Task 1: Remove the source-count domain gate

**Files:**

- Modify: `tests/preEditor/preEditorFlow.test.js`
- Modify: `src/preEditor/flow/preEditorFlow.js`
- Modify: `src/preEditor/data/explorationJourneys.js`

- [ ] **Step 1: Write the failing flow tests**

Update the flow tests to require a matching subject, but not accepted sources, for Guidance:

```js
test('canEnterStep requires a journey-bound subject but no sources for Guidance', () => {
  const initial = createFlowState(personJourney)
  const subjectReady = { ...initial, selectedSubject: personJourney.subject }

  assert.equal('requiredSourceCount' in initial, false)
  assert.equal(canEnterStep(initial, STEPS.SOURCES), false)
  assert.equal(canEnterStep(initial, STEPS.GUIDANCE), false)
  assert.equal(canEnterStep(subjectReady, STEPS.SOURCES), true)
  assert.equal(canEnterStep(subjectReady, STEPS.GUIDANCE), true)
})
```

Add a zero-source editor-handoff assertion:

```js
const state = {
  ...createFlowState(personJourney),
  step: STEPS.GUIDANCE,
  selectedSubject: personJourney.subject,
}

assert.deepEqual(buildEditorQuery(state, personJourney).source, [])
```

Replace the fixture assertions that encode the old minimum:

```js
assert.equal('requiredCount' in personJourney.sourceRequirements, false)
// Inside the eight-journey catalogue loop:
assert.deepEqual(journey.sourceRequirements, { profileKey: outline })
```

Add exact route cases for one journey:

```js
const journey = explorationCatalogue.journeysByKey['island-easter-island']
const matching = {
  ...createFlowState(journey),
  selectedSubject: journey.subject,
}

for (const step of [STEPS.SOURCES, STEPS.GUIDANCE]) {
  const allowed = resolveSetupRoute(buildSetupQuery(journey, step), matching)
  assert.equal(allowed.step, step)
  assert.equal(allowed.needsReplace, false)
}

const otherJourney = explorationCatalogue.journeysByKey['object-mars']
const invalidStates = [
  { state: undefined },
  { state: { ...matching, titleInput: 'Old draft title' }, title: 'Old draft title' },
  { state: { ...matching, selectedSubject: otherJourney.subject } },
  {
    state: {
      ...createFlowState(otherJourney),
      selectedSubject: otherJourney.subject,
    },
  },
]

for (const step of [STEPS.SOURCES, STEPS.GUIDANCE]) {
  for (const { state, title } of invalidStates) {
    const query = buildSetupQuery(journey, step, title ?? journey.subject.title)
    const recovered = resolveSetupRoute(query, state)
    assert.equal(recovered.step, STEPS.SUBJECT)
    assert.equal(recovered.canonicalQuery.step, STEPS.SUBJECT)
    assert.equal(recovered.resetFlow, true)
  }
}
```

Together these cases prove matching zero-source state is accepted while missing, stale-title, foreign-subject, and foreign-journey state recovers to Subject for both Sources and Guidance. Preserve `resolveSetupRoute()`'s existing canonical-title expectation in each assertion; the required progression outcome is Subject, never Sources or Guidance.

- [ ] **Step 2: Run the flow suite and verify RED**

Run:

```bash
node --test tests/preEditor/preEditorFlow.test.js
```

Expected: FAIL because flow state still exposes `requiredSourceCount` and Guidance still checks the source count.

- [ ] **Step 3: Implement the minimal domain change**

In `createFlowState()`, remove `requiredSourceCount`.

In `canEnterStep()`, use the same subject condition for Sources and Guidance:

```js
if (step === STEPS.SOURCES || step === STEPS.GUIDANCE) {
  return hasOwnSelectedSubject(state)
}
```

Remove `requiredCount` from every exploration journey's `sourceRequirements` object and from the legacy `personJourney`. Keep each `profileKey` and all source-tip content unchanged.

- [ ] **Step 4: Run the flow suite and verify GREEN**

Run:

```bash
node --test tests/preEditor/preEditorFlow.test.js
```

Expected: all pre-editor flow tests pass.

- [ ] **Step 5: Commit the domain change**

```bash
git add tests/preEditor/preEditorFlow.test.js src/preEditor/flow/preEditorFlow.js src/preEditor/data/explorationJourneys.js
git commit -m "Allow guidance without sources"
```

### Task 2: Make optionality explicit in the Sources UI

**Files:**

- Modify: `tests/preEditor/preEditorJourney.browser.mjs`
- Modify: `src/preEditor/views/ArticleGuidanceSetupView.vue`
- Modify: `README.md`

- [ ] **Step 1: Write the failing browser expectations**

Before changing the view, update the browser suite so a zero-source journey requires:

```js
await assertVisible(page.getByRole('heading', { level: 3, name: 'Add sources (optional)' }))
await assertVisible(
  page.getByText(
    'If you have sources ready, add them now. You can also add citations while writing.',
    { exact: true },
  ),
)
assert.equal(await page.getByRole('button', { name: 'Continue', exact: true }).isEnabled(), true)
assert.equal(await page.locator('.article-guidance-sources__required').count(), 0)
assert.equal(
  await page
    .getByText('This type of article requires sources before you can continue.', {
      exact: true,
    })
    .count(),
  0,
)
```

Assert the polite status transitions with the existing add/remove controls:

```js
const sourceStatus = page.locator('.article-guidance-actions__helper[role="status"]')
assert.equal(await sourceStatus.getAttribute('aria-live'), 'polite')
await assertVisible(
  sourceStatus.getByText('You can continue without adding a source.', { exact: true }),
)
assert.equal(await page.getByRole('button', { name: 'Add source', exact: true }).isEnabled(), false)
await addSource(page, SOURCE_ONE)
await assertVisible(
  sourceStatus.getByText('1 source added. You can add more while writing.', { exact: true }),
)
await addSource(page, SOURCE_TWO)
await assertVisible(
  sourceStatus.getByText('2 sources added. You can add more while writing.', { exact: true }),
)
await page.getByRole('button', { name: `Remove source from example.com: ${SOURCE_ONE}` }).click()
await page.getByRole('button', { name: `Remove source from example.org: ${SOURCE_TWO}` }).click()
await assertVisible(
  sourceStatus.getByText('You can continue without adding a source.', { exact: true }),
)
```

Exercise empty, valid-unsubmitted, invalid, and duplicate draft states in isolated journeys/contexts. In each state, assert **Continue** remains enabled. For invalid and duplicate drafts, first activate **Add source** and assert the existing alert, then use **Continue** without changing the draft. After reaching Guidance, go Back and assert the input is empty and no alert is present; continue again, start writing, and assert the editor URL contains exactly:

```js
// Empty, valid-unsubmitted, and invalid-unsubmitted scenarios:
assert.deepEqual(editorUrl.searchParams.getAll('source'), [])

// Duplicate-unsubmitted scenario after SOURCE_ONE was accepted:
assert.deepEqual(editorUrl.searchParams.getAll('source'), [SOURCE_ONE])
```

These four assertions prove unsubmitted draft text is never serialized. Keep the separate two-accepted-source journey assertion for ordered handoff.

For at least one of the eight subject journeys, continue with zero accepted sources and assert:

```js
assert.deepEqual(editorUrl.searchParams.getAll('source'), [])
```

Keep a separate journey that adds `SOURCE_ONE` and `SOURCE_TWO`, then assert both repeated `source` parameters remain ordered in the editor URL. Preserve all eight outline assertions.

- [ ] **Step 2: Run the production browser suite and verify RED**

Start a new long-running Vite process from this worktree and wait for its printed Local URL:

```bash
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

Confirm the exact server before testing:

```bash
curl -fsS http://127.0.0.1:5175/article
```

Expected: HTML containing `<title>Article creation</title>`.

Then run:

```bash
PRE_EDITOR_BASE_URL=http://127.0.0.1:5175/ node --test tests/preEditor/preEditorJourney.browser.mjs
```

Expected: FAIL because the old view shows mandatory copy, disables Continue at zero sources, and blocks Guidance.

- [ ] **Step 3: Implement the minimal view change**

In `ArticleGuidanceSetupView.vue`:

- render `Add sources (optional)` with no required span;
- render the approved supporting copy;
- remove `sourcesComplete` and the button's disabled binding;
- return the approved zero/one/many helper strings;
- allow `continueToGuidance()` whenever `canEnterStep(..., GUIDANCE)` is true;
- clear `sourceUrl` and `sourceError` immediately before advancing;
- remove the now-unused `.article-guidance-sources__required` rule.

Update the README journey description so Sources are optional rather than already required/selected. Do not change editor behavior or source validation.

- [ ] **Step 4: Run the browser suite and verify GREEN**

Run:

```bash
PRE_EDITOR_BASE_URL=http://127.0.0.1:5175/ node --test tests/preEditor/preEditorJourney.browser.mjs
```

Expected: all browser tests pass, including all eight outline handoffs, one zero-source handoff, and one ordered-source handoff.

Stop the exact Vite process started in Step 2 with `Ctrl-C`; do not kill an unrelated development server.

- [ ] **Step 5: Run focused static checks**

```bash
./node_modules/.bin/eslint src/preEditor tests/preEditor
./node_modules/.bin/oxlint src/preEditor tests/preEditor
./node_modules/.bin/prettier --check src/preEditor tests/preEditor README.md docs/superpowers/specs/2026-07-31-optional-sources-design.md docs/superpowers/plans/2026-07-31-optional-sources.md
git diff --check
```

Expected: zero errors and no formatting differences.

- [ ] **Step 6: Commit the UI and journey coverage**

```bash
git add src/preEditor/views/ArticleGuidanceSetupView.vue tests/preEditor/preEditorJourney.browser.mjs README.md
git commit -m "Make source collection optional"
```

### Task 3: Verify, publish, and merge

**Files:**

- Verify: all changed files
- Deploy: `.github/workflows/deploy.yml` (unchanged)
- Create temporarily: `/private/tmp/de144-optional-sources-pr.md` (not committed)

- [ ] **Step 1: Run the complete local verification gate**

```bash
npm test
node --test tests/preEditor/preEditorFlow.test.js
./node_modules/.bin/eslint src/preEditor tests/preEditor
./node_modules/.bin/oxlint src/preEditor tests/preEditor
./node_modules/.bin/prettier --check src/preEditor tests/preEditor README.md docs/superpowers/specs/2026-07-31-optional-sources-design.md docs/superpowers/plans/2026-07-31-optional-sources.md
GITHUB_ACTIONS=1 npm run build
git diff --check
```

Expected: 27 Vitest tests, all pre-editor flow tests, targeted ESLint/Oxlint/Prettier checks, the GitHub Pages production build, and the diff check pass.

Start a new production preview from the just-built `dist` and wait for its printed Local URL:

```bash
GITHUB_ACTIONS=1 npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
```

Confirm the production base path:

```bash
curl -fsS http://127.0.0.1:4175/DE1.4.4/article
```

Expected: HTML containing `<title>Article creation</title>`.

Run both browser suites against that production preview:

```bash
PRE_EDITOR_BASE_URL=http://127.0.0.1:4175/DE1.4.4/ node --test tests/preEditor/preEditorJourney.browser.mjs
PRE_EDITOR_BASE_URL=http://127.0.0.1:4175/DE1.4.4/ node --test tests/preEditor/articlePresentation.browser.mjs
```

Expected: both suites pass. Stop the exact preview process with `Ctrl-C` after the suites finish.

- [ ] **Step 2: Recheck target-main ancestry**

Run:

```bash
git fetch de144 main
git merge-base --is-ancestor de144/main HEAD
git rev-list --left-right --count de144/main...HEAD
```

Expected: the ancestry command exits 0 and the count starts with `0`, meaning the branch is zero commits behind. If target main advanced, run:

```bash
git merge --no-ff de144/main -m "Merge latest DE1.4.4 updates"
```

Repeat Task 3 Step 1 in full, then repeat the ancestry commands.

- [ ] **Step 3: Push and open a focused pull request**

Run:

```bash
git push -u de144 codex/optional-sources
gh pr create --repo Sudhanshugtm/DE1.4.4 --base main --head codex/optional-sources --title "Make the Sources step optional" --body-file /private/tmp/de144-optional-sources-pr.md
```

Create `/private/tmp/de144-optional-sources-pr.md` first with this exact structure, replacing the test-count placeholders with the fresh results from Step 1:

```markdown
## Summary

- keeps the Article Guidance Sources screen but makes progression possible with zero sources
- labels source collection as optional and keeps Continue available through draft and validation-error states
- preserves normalized accepted sources in the editor handoff

## Verification

- `npm test` — `<VITEST_COUNT>` passing
- pre-editor flow tests — `<FLOW_COUNT>` passing
- production browser journey tests — `<BROWSER_COUNT>` passing
- article-presentation browser test — passing
- GitHub Pages production build — passing
- targeted ESLint, Oxlint, Prettier, and diff checks — passing
```

Use `apply_patch` to create the temporary file so the Markdown contains real newlines. Expected: Git prints the new remote branch and `gh` returns a PR URL. Do not use `--draft` because the user explicitly authorized merge after verification.

- [ ] **Step 4: Merge the approved pull request**

Run:

```bash
gh pr view --repo Sudhanshugtm/DE1.4.4 --json number,state,isDraft,mergeable,mergeStateStatus,url
gh pr merge --repo Sudhanshugtm/DE1.4.4 --merge <PR_NUMBER>
gh pr view --repo Sudhanshugtm/DE1.4.4 <PR_NUMBER> --json state,mergedAt,mergeCommit,url
```

Expected before merge: `OPEN`, `isDraft: false`, and `MERGEABLE`/`CLEAN`. Expected after merge: `state: MERGED` and a non-null merge commit. Do not delete the local worktree or feature branch.

- [ ] **Step 5: Verify deployment and the public journey**

Find and wait for the merge commit's deployment:

```bash
gh run list --repo Sudhanshugtm/DE1.4.4 --branch main --limit 5 --json databaseId,headSha,status,conclusion,workflowName,url
gh run watch <RUN_ID> --repo Sudhanshugtm/DE1.4.4 --exit-status
```

Expected: `Deploy to GitHub Pages` completes with `success` for the PR merge commit.

Run the journey suite against the public origin:

```bash
PRE_EDITOR_BASE_URL=https://sudhanshugtm.github.io/DE1.4.4/ node --test tests/preEditor/preEditorJourney.browser.mjs
```

Expected: all journeys pass on the public build, including the zero-source URL assertion. Finally, open `https://sudhanshugtm.github.io/DE1.4.4/article` in the in-app browser, complete one zero-source red-link journey, verify Guidance and the matching outline, inspect error/warning console logs, and leave the public article tab open for the user.
