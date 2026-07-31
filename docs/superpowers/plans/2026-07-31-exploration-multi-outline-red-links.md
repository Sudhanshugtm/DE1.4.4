# Exploration multi-outline red links implementation plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single Ritu Karidhal demo with a sourced Exploration reading page whose eight pictured, Wikidata-style red-link subjects each complete their own Article Guidance journey and visibly reach the matching existing editor outline.

**Architecture:** Keep the feature isolated under `src/preEditor/`. A frozen catalogue owns the research note, article, source records, eight subject journeys, exact or explicitly related Wikidata item IDs, bundled Commons thumbnails, source tips, guidance, and editor outline mappings. Pure flow and route helpers enforce journey identity and canonical queries; Vue views render and transition that state. Editor-owned components remain unchanged.

**Tech Stack:** Vue 3, Vue Router, Wikimedia Codex, Vite static assets, Node test runner, Playwright browser checks.

---

## File structure

- Rename `src/preEditor/data/personJourney.js` to `src/preEditor/data/explorationJourneys.js`, then replace its single-person fixture with the frozen catalogue.
- Create `src/preEditor/assets/subjects/`: eight validated 240px Commons thumbnail snapshots.
- Create `src/preEditor/assets/subjects/ATTRIBUTION.md`: exact creator, licence, and source-page metadata.
- Create `src/preEditor/flow/setupRoute.js`: setup-query parsing and canonicalization only.
- Modify `src/preEditor/flow/preEditorFlow.js`: journey-bound state, normalized matching, and guarded handoff.
- Modify `src/preEditor/components/ProtoWikiArticleShell.vue`: research note and sourced text/context/missing segment rendering.
- Modify `src/preEditor/views/PreEditorReadingView.vue`: build one native route per missing segment.
- Modify `src/preEditor/views/ArticleGuidanceSetupView.vue`: resolve and render the active pictured journey through all three steps.
- Replace `tests/preEditor/preEditorFlow.test.js`: table-driven catalogue, source, flow, query, and handoff coverage while preserving current URL/source behavior checks.
- Replace `tests/preEditor/preEditorJourney.browser.mjs`: exact mobile, compact/tablet, desktop, recovery, image, and eight-journey end-to-end coverage.
- Do not modify `src/components/**`, `src/views/EditorView.vue`, `src/config/outlines/**`, or any other editor-owned file.

## Exact catalogue contract

### Journey records

| Key | Title | Description | Item relationship | Type label / article type | Outline | Local asset |
|---|---|---|---|---|---|---|
| `person-neil-armstrong` | Neil Armstrong | American astronaut and aeronautical engineer | exact `Q1615` | Person / `Q5` | `person` | `neil-armstrong.jpg` |
| `person-valentina-tereshkova` | Valentina Tereshkova | Soviet cosmonaut and the first woman in space | exact `Q44371` | Person / `Q5` | `person` | `valentina-tereshkova.jpg` |
| `event-chandrayaan-3-landing` | Chandrayaan-3 Moon landing | 2023 lunar landing by India's Chandrayaan-3 mission | related mission `Q65049774` | Recent Event / `Q108586636` | `recent-event` | `chandrayaan-3.png` |
| `object-mars` | Mars | Fourth planet from the Sun | exact `Q111` | Astronomical Object / `Q6999` | `astronomical-object` | `mars.png` |
| `software-google-earth` | Google Earth | Virtual globe and mapping software | exact `Q42274` | Software / `Q7397` | `software` | `google-earth.png` |
| `company-spacex` | SpaceX | American aerospace company | exact `Q193701` | Company / `Q4830453` | `company` | `spacex.jpg` |
| `landform-mount-everest` | Mount Everest | Earth's highest mountain above sea level | exact `Q513` | Landform / `Q271669` | `landform` | `mount-everest.jpg` |
| `island-easter-island` | Easter Island | Island and special territory of Chile in the Pacific Ocean | exact `Q14452` | Island / `Q23442` | `island` | `easter-island.jpg` |

Every record uses:

```js
{
  key,
  subject: {
    journeyKey: key,
    title,
    description,
    wikidataItemId,
    wikidataItemUrl: `https://www.wikidata.org/wiki/${wikidataItemId}`,
    wikidataRelation: 'exact' | 'related',
    typeLabel,
    articleType,
    thumbnail: {
      url: new URL('../assets/subjects/<literal-local-file>', import.meta.url).href,
      commonsFile,
      commonsUrl,
    },
  },
  sourceRequirements: { requiredCount: 2, profileKey: outline },
  guidanceProfileKey: outline,
  handoff: { lang: 'en', variant: 'toolbar-outline', outline },
}
```

The literal local asset path is written separately in every record so Vite discovers each file. The event stores `wikidataRelation: 'related'`; every other record stores `exact`.

### Research note and sourced article structure

Store the research note on `explorationArticle.researchNote`:

```js
{
  label: 'Research prototype',
  text: 'Read this short article and choose any red link that interests you. Each red link starts a different article-creation path. Link colours are simulated for this study. Blue links provide context and are not active. When asked, add any two valid web links as sources.',
}
```

Store the description as `{ id: 'meta-description', text: 'Travel and study undertaken to learn about unfamiliar places', sourceIds: [ 'national-geographic-why-we-explore' ] }`.

Use `sections[].paragraphs[].sentences[]`. Every sentence is `{ id, sourceIds, segments }`; every segment is one of `{ kind: 'text', text }`, `{ kind: 'context', text }`, or `{ kind: 'missing', text, journeyKey }`. Concatenating ordered segment text must produce the exact claim below:

| Section / paragraph | Sentence ID | Source ID | Ordered segment contract |
|---|---|---|---|
| Introduction / 1 | `intro-definition` | `national-geographic-why-we-explore` | text `Exploration is travel over unfamiliar territory for discovery, or the careful study of something in order to learn more about it.` |
| Introduction / 1 | `intro-modern-practice` | `rgs-geographical-exploration` | text `Modern geographical exploration includes field research and the use of different tools and methods.` |
| Introduction / 1 | `intro-tools` | `national-geographic-geography` | context `Maps`; text ` and `; context `satellite images`; text ` are among the tools used to study places.` |
| Exploration on Earth / 1 | `earth-everest` | `national-geographic-everest` | missing `Mount Everest` → `landform-mount-everest`; text ` lies in the `; context `Himalayas`; text ` on the border between `; context `Nepal`; text ` and `; context `China`; text `.` |
| Exploration on Earth / 1 | `earth-easter-island` | `esa-easter-island` | missing `Easter Island` → `island-easter-island`; text `, also called `; context `Rapa Nui`; text `, is a Chilean island in the `; context `Pacific Ocean`; text `.` |
| Exploration on Earth / 1 | `earth-google-earth` | `google-earth-desktop` | missing `Google Earth` → `software-google-earth`; text ` displays satellite imagery and 3D representations of `; context `terrain`; text ` and `; context `buildings`; text `.` |
| Space exploration / 1 | `space-mars` | `nasa-mars-exploration` | missing `Mars` → `object-mars`; text ` has been explored by robotic `; context `orbiters`; text `, `; context `landers`; text `, and `; context `rovers`; text `.` |
| Space exploration / 1 | `space-armstrong` | `nasa-neil-armstrong` | missing `Neil Armstrong` → `person-neil-armstrong`; text ` became the first person to set foot on the `; context `Moon`; text ` on 20 July 1969.` |
| Space exploration / 1 | `space-tereshkova` | `esa-valentina-tereshkova` | missing `Valentina Tereshkova` → `person-valentina-tereshkova`; text ` became the first woman in space when `; context `Vostok 6`; text ` launched on 16 June 1963.` |
| Space exploration / 2 | `space-chandrayaan` | `isro-chandrayaan-3` | text `The `; missing `Chandrayaan-3 Moon landing` → `event-chandrayaan-3-landing`; text ` was a successful soft landing on the `; context `Moon`; text ` on 23 August 2023.` |
| Space exploration / 2 | `space-spacex` | `nasa-commercial-crew-dragon` | missing `SpaceX` → `company-spacex`; text ` developed the `; context `Dragon spacecraft`; text `, which carries crew and cargo to orbiting destinations such as the `; context `International Space Station`; text `.` |

Paragraph rendering inserts one normal space between consecutive sentences and no extra spaces inside segment text. Section headings are `Introduction`, `Exploration on Earth`, then `Space exploration`.

### Source records

| ID | Publisher | URL |
|---|---|---|
| `national-geographic-why-we-explore` | National Geographic Society | `https://education.nationalgeographic.org/resource/why-we-explore/` |
| `rgs-geographical-exploration` | Royal Geographical Society | `https://www.rgs.org/exploration/what-is-geographical-exploration` |
| `national-geographic-geography` | National Geographic Society | `https://education.nationalgeographic.org/resource/geography-article/` |
| `national-geographic-everest` | National Geographic | `https://www.nationalgeographic.com/adventure/article/climbing-mount-everest-1` |
| `esa-easter-island` | European Space Agency | `https://www.esa.int/ESA_Multimedia/Images/2019/04/Easter_Island` |
| `google-earth-desktop` | Google Earth | `https://earth.google.com/desktop/` |
| `nasa-mars-exploration` | NASA | `https://science.nasa.gov/planetary-science/programs/mars-exploration/` |
| `nasa-neil-armstrong` | NASA | `https://www.nasa.gov/people/neil-a-armstrong/` |
| `esa-valentina-tereshkova` | European Space Agency | `https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/First_woman_in_space_Valentina` |
| `isro-chandrayaan-3` | Indian Space Research Organisation | `https://www.isro.gov.in/ISRO_EN/Chandrayaan3.html` |
| `nasa-commercial-crew-dragon` | NASA | `https://www.nasa.gov/commercial-crew-program-press-kit/` |

### Exact source-tip and Guidance profiles

Each profile has `sourceTip`, `guidanceHeading: 'Getting started with this article'`, `guidanceIntro: 'Here are a few tips to help you write an article.'`, and the three exact `guidanceBullets` below.

- `person`
  - Source: `Prefer substantial biographies, institutional records, academic publications, and independent journalism.`
  - Guidance: `Start with who the person is and why reliable independent sources discuss them.` / `Write in the third person and use a neutral tone.` / `Do not write about yourself, family, or friends.`
- `recent-event`
  - Source: `Prefer established news organisations, official records, and independent expert analysis.`
  - Guidance: `State what happened, where and when it happened, and why reliable sources covered it.` / `Present the sequence of events in chronological order.` / `Distinguish confirmed information from attributed claims.`
- `astronomical-object`
  - Source: `Prefer astronomical catalogues, peer-reviewed research, observatory publications, and space-agency material.`
  - Guidance: `Identify the object's type, location, and main physical characteristics.` / `Describe discovery and observation using published sources.` / `Avoid speculation that is not attributed to a reliable source.`
- `software`
  - Source: `Prefer independent technical publications, academic work, books, and established technology journalism.`
  - Guidance: `Explain the software's purpose, development, and notable uses.` / `Separate independently documented use from the developer's own claims.` / `Avoid feature lists copied from product material.`
- `company`
  - Source: `Prefer independent business journalism, regulatory filings, books, and academic work.`
  - Guidance: `Explain what the company does, when it was formed, and its documented products or services.` / `Cover significant criticism or disputes only in proportion to reliable coverage.` / `Avoid promotional language and unsupported claims of leadership or innovation.`
- `landform`
  - Source: `Prefer geological surveys, academic geography, authoritative atlases, and government scientific agencies.`
  - Guidance: `Identify the landform's location, type, formation, and physical characteristics.` / `Attribute measurements when sources differ.` / `Separate scientific description from tourism or promotional claims.`
- `island`
  - Source: `Prefer government statistics, atlases, academic research, and reliable historical works.`
  - Guidance: `Identify the island's location, political status, geography, and environment.` / `Add history, population, or ecology only when relevant and sourced.` / `Avoid travel-guide language.`

## Chunk 1: Implement and verify the complete journey

### Task 1: Frozen catalogue, pictures, flow, and route contract

**Files:**
- Rename: `src/preEditor/data/personJourney.js` → `src/preEditor/data/explorationJourneys.js`
- Create: eight files under `src/preEditor/assets/subjects/` plus `ATTRIBUTION.md`
- Create: `src/preEditor/flow/setupRoute.js`
- Modify: `src/preEditor/flow/preEditorFlow.js`
- Modify: `tests/preEditor/preEditorFlow.test.js`
- Mechanical import-only updates during rename: `src/preEditor/views/PreEditorReadingView.vue`, `src/preEditor/views/ArticleGuidanceSetupView.vue`

- [ ] **Step 1: Perform the behavior-neutral data-module rename**

Move the existing file to `explorationJourneys.js` with `apply_patch`, update its four current import sites, and change no exports or runtime behavior.

- [ ] **Step 2: Prove the rename stays GREEN**

Run `node --test tests/preEditor/preEditorFlow.test.js`.

Expected: the existing eight tests PASS unchanged.

- [ ] **Step 3: Write the failing catalogue tests**

Namespace-import the now-existing `explorationJourneys.js`. Assert exports `explorationArticle`, `journeysByKey`, `guidanceProfilesByOutline`, and `sourceProfilesByOutline`; assert the complete contracts above, outline existence/type matches, local asset paths, source mappings, segment concatenation, journey coverage, eight unique keys/items, seven outlines, and recursive freezing.

- [ ] **Step 4: Run the catalogue tests and verify RED**

Run `node --test tests/preEditor/preEditorFlow.test.js`.

Expected: FAIL on the absent catalogue exports, not on module loading or syntax.

- [ ] **Step 5: Download the exact thumbnail bytes**

Create `src/preEditor/assets/subjects/`, then run these exact commands individually:

```bash
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Neil_Armstrong_pose.jpg/240px-Neil_Armstrong_pose.jpg' --output src/preEditor/assets/subjects/neil-armstrong.jpg
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/1st_meeting_of_8th_State_Duma_07.jpg/240px-1st_meeting_of_8th_State_Duma_07.jpg' --output src/preEditor/assets/subjects/valentina-tereshkova.jpg
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Chandrayaan-3_Integrated_Module_in_clean-room_01.webp/240px-Chandrayaan-3_Integrated_Module_in_clean-room_01.webp.png' --output src/preEditor/assets/subjects/chandrayaan-3.png
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png/240px-Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png' --output src/preEditor/assets/subjects/mars.png
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/NASA_World_Wind_-_Google_Earth_bar.png/240px-NASA_World_Wind_-_Google_Earth_bar.png' --output src/preEditor/assets/subjects/google-earth.png
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Entrance_to_SpaceX_headquarters.jpg/240px-Entrance_to_SpaceX_headquarters.jpg' --output src/preEditor/assets/subjects/spacex.jpg
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg/240px-Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg' --output src/preEditor/assets/subjects/mount-everest.jpg
curl -L --fail --silent --show-error 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Easter_Island_5.jpg/240px-Easter_Island_5.jpg' --output src/preEditor/assets/subjects/easter-island.jpg
```

- [ ] **Step 6: Verify every downloaded file before using it**

Run `file --mime-type src/preEditor/assets/subjects/*.{jpg,png}` and `sips -g pixelWidth -g pixelHeight src/preEditor/assets/subjects/*.{jpg,png}`. Expected MIME/dimensions:

| Local file | MIME | Width × height |
|---|---|---|
| `neil-armstrong.jpg` | `image/jpeg` | 240 × 300 |
| `valentina-tereshkova.jpg` | `image/jpeg` | 240 × 163 |
| `chandrayaan-3.png` | `image/png` | 240 × 360 |
| `mars.png` | `image/png` | 240 × 240 |
| `google-earth.png` | `image/png` | 240 × 156 |
| `spacex.jpg` | `image/jpeg` | 240 × 360 |
| `mount-everest.jpg` | `image/jpeg` | 240 × 130 |
| `easter-island.jpg` | `image/jpeg` | 240 × 160 |

Any MIME, decode, or dimension mismatch stops implementation; do not commit the response body.

- [ ] **Step 7: Add exact image attribution**

Create `ATTRIBUTION.md` with access date `2026-07-31` and these rows:

| Local file | Creator | Licence | Source page |
|---|---|---|---|
| `neil-armstrong.jpg` | Unknown author / NASA image | Public domain | `https://commons.wikimedia.org/wiki/File:Neil_Armstrong_pose.jpg` |
| `valentina-tereshkova.jpg` | duma.gov.ru | CC BY 4.0 — `https://creativecommons.org/licenses/by/4.0` | `https://commons.wikimedia.org/wiki/File:1st_meeting_of_8th_State_Duma_07.jpg` |
| `chandrayaan-3.png` | Indian Space Research Organisation | GODL-India — `https://data.gov.in/sites/default/files/Gazette_Notification_OGDL.pdf` | `https://commons.wikimedia.org/wiki/File:Chandrayaan-3_Integrated_Module_in_clean-room_01.webp` |
| `mars.png` | Kevin Gill | CC BY 2.0 — `https://creativecommons.org/licenses/by/2.0` | `https://commons.wikimedia.org/wiki/File:Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png` |
| `google-earth.png` | EEIM | Public domain | `https://commons.wikimedia.org/wiki/File:NASA_World_Wind_-_Google_Earth_bar.png` |
| `spacex.jpg` | Bruno Sanchez-Andrade Nuño | CC BY 2.0 — `https://creativecommons.org/licenses/by/2.0` | `https://commons.wikimedia.org/wiki/File:Entrance_to_SpaceX_headquarters.jpg` |
| `mount-everest.jpg` | shrimpo1967; derivative by Papa Lima Whiskey 2 | CC BY-SA 2.0 — `https://creativecommons.org/licenses/by-sa/2.0` | `https://commons.wikimedia.org/wiki/File:Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg` |
| `easter-island.jpg` | kallerna | CC BY-SA 4.0 — `https://creativecommons.org/licenses/by-sa/4.0` | `https://commons.wikimedia.org/wiki/File:Easter_Island_5.jpg` |

- [ ] **Step 8: Implement `deepFreeze`, the sourced article, and source records**

Retain the existing recursive `deepFreeze` implementation. Implement `explorationArticle` exactly from the contracts above, including the research note, object-valued description, source object, section/paragraph/sentence hierarchy, ordered segments, and source IDs. Export it only after recursively freezing it.

- [ ] **Step 9: Implement profiles and all eight journey records**

Implement and freeze `sourceProfilesByOutline`, `guidanceProfilesByOutline`, and `journeysByKey` exactly from the contracts above. Static local URLs must use a literal `new URL(..., import.meta.url).href`. Do not fetch data or derive outlines at runtime.

- [ ] **Step 10: Make the catalogue tests GREEN**

Run `node --test tests/preEditor/preEditorFlow.test.js`.

Expected: catalogue/fixture cases PASS; preserve the current URL validation, normalized duplicate, add/remove, step guard, backward-navigation, and Person handoff cases until their replacements are added.

- [ ] **Step 11: Write failing journey-flow and route tests**

Add tests requiring: `journeyKey` in state; NFKC/trim/collapsed-whitespace/English-case title matching; rejection of cross-journey subjects; exact handoff for all eight records; setup query keys limited to `step`, `journey`, `title`, `sourceOrigin`, `variant`; and exact recovery for missing/repeated/invalid step, journey, title, sourceOrigin, variant, and unknown keys.

- [ ] **Step 12: Run flow/route tests and verify RED**

Run `node --test tests/preEditor/preEditorFlow.test.js`.

Expected: FAIL because flow state is not journey-bound and `setupRoute.js` is absent.

- [ ] **Step 13: Implement journey-bound flow**

Preserve existing URL normalization/add/remove behavior. Store `journeyKey`; require `selectedSubject.journeyKey === state.journeyKey` for Sources, Guidance, and handoff; make `buildEditorQuery(state, journey)` throw for mismatches and emit only the active journey's outline/title plus repeated entered `source` URLs.

- [ ] **Step 14: Implement canonical setup-route helpers**

In `setupRoute.js`, implement scalar query reading (first string for repeated title; repeated step/origin/variant are invalid), one-time Vue Router decoding, NFKC title normalization, valid-step parsing, exact canonical query construction, journey lookup, prerequisite recovery, and unknown-key removal. `sourceOrigin` and `variant` always canonicalize to `redlink` and `toolbar-outline`; setup `source` is always dropped.

- [ ] **Step 15: Make all pure tests GREEN**

Run `node --test tests/preEditor/preEditorFlow.test.js`.

Expected: all old preserved behaviors and new catalogue/route/eight-handoff cases PASS with no warnings.

- [ ] **Step 16: Commit Task 1**

Run `git diff --check`, stage only Task 1 paths, and commit `Build frozen multi-outline journey catalogue`.

### Task 2: Exploration reader and eight pictured pre-VE journeys

**Files:**
- Modify: `src/preEditor/components/ProtoWikiArticleShell.vue`
- Modify: `src/preEditor/views/PreEditorReadingView.vue`
- Modify: `src/preEditor/views/ArticleGuidanceSetupView.vue`
- Modify: `tests/preEditor/preEditorJourney.browser.mjs`

- [ ] **Step 1: Write failing article semantics and responsive tests**

At viewports 390×844, 1025×900, and 1280×900, assert the exact research-note label/text, `Exploration` heading, `description.text`, exact paragraph text, heading order, no horizontal overflow, DOM order, eight native red links, distinct accessible names, exact per-link queries, underline/focus treatment, 4.5:1 red-link and blue-context contrast against their computed background, and inactive context spans with no role/href/tab stop/pointer cursor.

For modified-click semantics, dispatch Ctrl/Meta-click without allowing a new page to escape the test and assert the handler does not call `preventDefault`; normal unmodified primary click must navigate through the router. Copy-link behavior is covered by each native anchor's real `href`.

- [ ] **Step 2: Run the article cases and verify RED**

Run `PRE_EDITOR_BASE_URL=http://127.0.0.1:5174 node --test tests/preEditor/preEditorJourney.browser.mjs`.

Expected: FAIL on the old Ritu article and one-link model.

- [ ] **Step 3: Implement research-note and sentence rendering**

Render `article.researchNote` in regular page content before `<article>`. Render `article.description.text`. Iterate section → paragraph → sentence → segment, adding one space between sentences. Render context as non-focusable spans. Render missing segments as native anchors with the exact accessible name `<title> — simulated missing article; opens article-creation guidance`.

The click handler must leave non-primary or Meta/Ctrl/Shift/Alt-modified clicks untouched. For an unmodified primary click only, call `preventDefault()` and emit the journey key. Do not use `.prevent` on the template listener.

- [ ] **Step 4: Implement per-link reader routing**

Build a target and resolved `href` for every missing segment with exact ordered query values: `step=subject`, `journey`, `title`, `sourceOrigin=redlink`, `variant=toolbar-outline`. On an unmodified activation, push that target. Run the article cases and confirm they pass at all three viewports.

- [ ] **Step 5: Write failing pictured-journey tests**

For all eight red links, use Enter and assert canonical Subject URL, focused setup heading, exact card title/type/description, the same-origin loaded `.cdx-thumbnail__image`, exact/related supporting text, click/Enter/Space selection, correct Sources tip, two-source gating, exact Guidance bullets, exact editor query, and a visible region for the matching outline. Check both Person titles separately and all seven unique outlines.

Add: wrong/missing/repeated journey/origin/variant/title; missing/invalid/repeated step; unknown keys; unmet prerequisites; refresh; Back/Forward; cross-journey reset; and setup URLs containing no `source`. Watch every request and fail on any Wikidata, Wikimedia, Commons, Action API, REST, or page-summary origin/endpoint.

In a dedicated context, abort the selected same-origin thumbnail asset request, then assert `.cdx-thumbnail__placeholder` is visible and the same card remains selectable by pointer, Enter, and Space.

- [ ] **Step 6: Run journey tests and verify RED**

Run the 5174 browser command.

Expected: article cases PASS; journey/image/canonicalization/outline cases FAIL against the hard-coded Person setup.

- [ ] **Step 7: Implement full-route observation and active-journey reset**

Resolve a valid journey before creating state; missing/unknown journey replaces to `/article`. Observe `route.fullPath` so changes to journey, step, title, sourceOrigin, variant, repeated values, or unknown keys are all re-evaluated. Reset title, selected subject, sources, input errors, and source input whenever journey identity changes. Also clear selected subject, sources, input errors, and source input whenever missing/invalid steps or unmet prerequisites recover the same journey to Subject. Use `router.replace` for canonicalization/recovery and `router.push` for valid forward steps.

- [ ] **Step 8: Implement the complete pictured Subject card**

Bind `:thumbnail="subjectResult.thumbnail"`, `data-wikidata-item`, and the existing complete accessible label. Keep the title and description slots. Add the supporting-text slot with `Wikidata item · <QID>` or `Related Wikidata item · Q65049774`. Retain all three selectors: `@click="selectSubject"`, `@keydown.enter.prevent="selectSubject"`, and `@keydown.space.prevent="selectSubject"`. The Codex placeholder therefore does not affect selectability.

- [ ] **Step 9: Implement per-profile Sources, Guidance, and handoff**

Replace every `personJourney` read with the active journey/profile. Preserve entered URLs only in flow state; serialize them only at handoff. Start writing with `buildEditorQuery(flowState, activeJourney)`. Do not touch editor-owned files.

- [ ] **Step 10: Make the complete browser suite GREEN**

Run the 5174 browser command until all three responsive surfaces, eight decoded thumbnails, fallback, navigation/recovery, and seven visible outline cases pass with no console or local-asset errors.

- [ ] **Step 11: Run focused static checks**

Run:

```bash
./node_modules/.bin/oxlint src/preEditor tests/preEditor
./node_modules/.bin/eslint src/preEditor tests/preEditor
./node_modules/.bin/prettier --check src/preEditor tests/preEditor
git diff --check
```

Expected: clean output with no auto-fix required.

- [ ] **Step 12: Commit Task 2**

Stage only Task 2 paths plus test-driven corrections to Task 1 and commit `Connect eight red links to pictured guidance journeys`.

### Task 3: Fresh-server, production-base, ownership, and live verification

**Files:**
- Modify only if a verification failure produces a new failing test first: the files already listed above.

- [ ] **Step 1: Capture the stable implementation baseline**

The planning commit is named exactly `Document pictured multi-outline implementation`. Before Task 1 begins, run `git rev-list -n 1 --grep='^Document pictured multi-outline implementation$' HEAD` and record the returned 40-character SHA in the implementation task context and every review prompt.

- [ ] **Step 2: Restart a verified dev server**

Port 5174 currently belongs to PID 77919 whose cwd was verified as this worktree. At final verification, re-run `lsof -nP -iTCP:5174 -sTCP:LISTEN` and `lsof -a -p 77919 -d cwd -Fn`. If PID 77919 is still the verified listener, stop it with `kill 77919`; if the listener changed, verify its cwd before stopping that explicit PID. Start a new PTY session with:

```bash
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Wait for Vite's ready output, then require both commands to succeed:

```bash
curl -fsS http://127.0.0.1:5174/article
curl -fsS http://127.0.0.1:5174/src/preEditor/data/explorationJourneys.js
```

The second response must contain `person-neil-armstrong` and `event-chandrayaan-3-landing`; this prevents a stale app from satisfying browser tests.

- [ ] **Step 3: Run the full development-base gate**

```bash
node --test tests/preEditor/preEditorFlow.test.js
PRE_EDITOR_BASE_URL=http://127.0.0.1:5174 node --test tests/preEditor/preEditorJourney.browser.mjs
./node_modules/.bin/oxlint src/preEditor tests/preEditor
./node_modules/.bin/eslint src/preEditor tests/preEditor
./node_modules/.bin/prettier --check src/preEditor tests/preEditor
npm run build
git diff --check
```

Expected: all pass with no warning, console error, failed asset, or formatter diff.

- [ ] **Step 4: Run the editor-ownership gate**

Using the recorded planning SHA as the literal base, run the path checks below. First write the complete changed-path list to the terminal and assert that every runtime/test change is allowlisted under `src/preEditor/` or `tests/preEditor/`, while documentation is allowlisted only under `docs/superpowers/`; no other path may appear:

```bash
git diff --name-only <recorded-planning-sha>..HEAD
git status --short
```

Then run these focused forbidden-path checks:

```bash
git diff --name-only <recorded-planning-sha>..HEAD -- src/components src/views/EditorView.vue src/config/outlines
git diff --name-only -- src/components src/views/EditorView.vue src/config/outlines
git ls-files --others --exclude-standard -- src/components src/views/EditorView.vue src/config/outlines
```

Expected: all three outputs are empty. Also run `git status --short`; only intentional pre-editor/docs changes may remain before the final commit.

- [ ] **Step 5: Build and serve the production base freshly**

Run `GITHUB_ACTIONS=1 npm run build`, then start a separate PTY session:

```bash
npm run preview -- --host 127.0.0.1 --port 4174 --strictPort
```

Wait for ready output and require `curl -fsS http://127.0.0.1:4174/article-guidance-nve/` to contain the app root. Then run:

```bash
PRE_EDITOR_BASE_URL=http://127.0.0.1:4174/article-guidance-nve/ node --test tests/preEditor/preEditorJourney.browser.mjs
```

Expected: the complete suite passes with production-base routes and same-origin asset URLs. Stop the preview PTY with Ctrl-C after verification.

- [ ] **Step 6: Inspect and exercise the in-app browser**

Refresh `http://127.0.0.1:5174/article`. Inspect at desktop and mobile widths. Manually complete Neil Armstrong and Chandrayaan-3 Moon landing through their pictured exact/related item cards; confirm the visible Person and Recent Event outlines differ. Leave the in-app browser on the refreshed article.

- [ ] **Step 7: Run whole-diff reviews and finish**

Dispatch an independent whole-diff spec reviewer, then a code-quality reviewer using the recorded planning SHA and current HEAD. Fix every blocking issue with a failing test first and re-review. Run the full development and production gates again after any fix. Confirm clean status and retain the restarted 5174 server for the user.
