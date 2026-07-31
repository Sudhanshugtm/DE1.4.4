# Exploration article with multi-outline red links

## Goal

Turn the prototype's reading page into a self-guided research scenario that works for people who do and do not edit Wikipedia:

1. Read a short, familiar Wikipedia-style article.
2. Understand that red links are the available contribution paths in this study.
3. Choose any red link that is personally interesting.
4. Complete Subject, Sources, and Guidance.
5. Enter the existing editor with the outline that matches the chosen subject.

The article should feel restrained and encyclopedic. It must not read like product copy, a tutorial disguised as an article, or synthetic prose written to connect unrelated demo targets.

## Research premise

The study tests the complete journey from reading to contribution. It does not test whether a participant already knows Wikipedia's red-link convention. A short research note therefore explains the task before the article, while remaining visually separate from article content.

The red-link states are simulated. Every red-link subject is intentionally familiar, including subjects that already have Wikipedia articles. This gives participants recognisable choices and lets the study exercise several existing outline types. The research note must disclose the simulation so experienced editors are not misled.

## Policy and writing standard

Article copy is policy-aligned rather than claimed to be publication-ready. It follows Wikipedia's three core content principles:

- neutral point of view: describe subjects without praise, advocacy, or implied judgement;
- verifiability: every factual claim must be traceable to a reliable published source recorded in the local fixture;
- no original research: do not introduce analysis, causal claims, or synthesis that is not present in those sources.

Policy references:

- <https://en.wikipedia.org/wiki/Wikipedia:Neutral_point_of_view>
- <https://en.wikipedia.org/wiki/Wikipedia:Verifiability>
- <https://en.wikipedia.org/wiki/Wikipedia:No_original_research>

The prose uses short declarative sentences and plain international English. It avoids rhetorical introductions, promotional adjectives, neat moral conclusions, vague claims such as "throughout history", and stock phrases such as "a testament to", "plays a vital role", or "continues to inspire". It does not use an em dash as a general-purpose aside. If a claim cannot be sourced cleanly, remove or narrow the claim instead of qualifying it with vague language.

Before implementation, verify the stable source URL for each factual sentence. Routine biographical and mission facts may use authoritative institutional sources. Claims about significance, reception, or impact require independent published coverage. The simulated link state is never presented as a factual statement about a live wiki.

## Article and research note

### Research note

The note appears outside the semantic article and uses the existing Codex/token language rather than Wikipedia article styling.

**Research prototype**

> Read this short article and choose any red link that interests you. Each red link starts a different article-creation path. Link colours are simulated for this study. Blue links provide context and are not active. When asked, add any two valid web links as sources.

The note is visible at direct `/article` entry, because shared research links may bypass the hub. It is concise enough for an experienced editor to scan and explicit enough for a newcomer to begin without facilitator help.

### Article metadata

- Title: **Exploration**
- Description: **The study of unfamiliar places and environments**
- Target reading level: plain international English suitable for a Simple English Wikipedia-style prototype

### Approved article copy

#### Introduction

Exploration is the act of travelling through or studying an unfamiliar place in order to learn about it. It includes journeys across land and sea, scientific fieldwork, and the use of instruments to study places that people cannot reach directly. Maps, navigation, and observation are used in many forms of exploration.

#### Exploration on Earth

Explorers and researchers have mapped coastlines, islands, oceans, and mountain ranges. **Mount Everest** has been surveyed and climbed by expeditions from several countries. **Easter Island** has been studied for its geography, archaeology, and history. Modern software such as **Google Earth** combines maps, satellite images, and geographic data.

#### Space exploration

Space exploration uses telescopes, robotic spacecraft, and crewed missions to study the Solar System and the wider universe. **Mars** has been explored by orbiters, landers, and rovers. **Neil Armstrong** became the first person to walk on the Moon in 1969. **Valentina Tereshkova** became the first woman to travel in space in 1963.

The **Chandrayaan-3 Moon landing** took place in 2023 as part of India's lunar programme. Space exploration is carried out by public agencies, research institutions, and companies, including **SpaceX**.

Bold text above identifies red-link segments in the fixture; the rendered article does not bold those links. Context terms such as maps, navigation, satellite images, telescopes, spacecraft, Solar System, orbiters, landers, rovers, public agencies, and research institutions are rendered as blue contextual text.

The final implementation review must compare every sentence with its recorded sources. It may make small factual corrections or delete an unsupported clause without reopening the interaction design. Any change that alters a red-link subject or its outline mapping requires design review.

## Link model

Article paragraphs contain explicit segment types rather than the current `missingLink` boolean:

```js
{ kind: 'text', text: '...' }
{ kind: 'context', text: 'navigation' }
{ kind: 'missing', text: 'Neil Armstrong', journeyKey: 'person-neil-armstrong' }
```

### Red links

- Render as native anchors with a real setup-route `href`.
- Remain red and underlined at rest, so the actionable state does not rely on colour alone.
- Keep the visible keyboard focus indicator.
- Use an accessible name such as `Neil Armstrong — simulated missing article; opens article-creation guidance`.
- Emit the stable `journeyKey` when activated.
- Preserve normal open-in-new-tab and copy-link behaviour through the real `href`.

### Blue context text

Blue items are visual context only for this study. They render as non-focusable spans, not anchors, and have no pointer cursor or hover state. The research note states that they are inactive. This avoids dead links in keyboard and screen-reader navigation while preserving the familiar visual density of a Wikipedia article.

## Journey and outline catalogue

The repository currently contains 38 Simple English article outlines. This study wires eight famous red-link subjects to seven of those existing outlines:

| Journey key | Visible subject | Subject description | Type label | Article type | Editor outline |
|---|---|---|---|---|---|
| `person-neil-armstrong` | Neil Armstrong | American astronaut and aeronautical engineer | Person | `Q5` | `person` |
| `person-valentina-tereshkova` | Valentina Tereshkova | Soviet cosmonaut and the first woman in space | Person | `Q5` | `person` |
| `event-chandrayaan-3-landing` | Chandrayaan-3 Moon landing | 2023 lunar landing by India's Chandrayaan-3 mission | Recent Event | `Q108586636` | `recent-event` |
| `object-mars` | Mars | Fourth planet from the Sun | Astronomical Object | `Q6999` | `astronomical-object` |
| `software-google-earth` | Google Earth | Virtual globe and mapping software | Software | `Q7397` | `software` |
| `company-spacex` | SpaceX | American aerospace company | Company | `Q4830453` | `company` |
| `landform-mount-everest` | Mount Everest | Earth's highest mountain above sea level | Landform | `Q271669` | `landform` |
| `island-easter-island` | Easter Island | Island and special territory of Chile in the Pacific Ocean | Island | `Q23442` | `island` |

Every journey contains:

- a stable key;
- subject identity and description;
- the exact existing outline ID and article type;
- a two-source minimum;
- type-appropriate recommended source categories;
- type-appropriate Guidance copy;
- the shared `toolbar-outline` editor variant.

The two famous people share one Person guidance profile but remain separate journeys. Shared profiles prevent duplicated policy copy without hiding the distinct subject identity.

## Type-specific guidance

All guidance is frozen local content. No Wikidata, Citoid, REST, or source-quality request is made.

### Person

- Start with who the person is and why reliable independent sources discuss them.
- Write in the third person and use a neutral tone.
- Do not write about yourself, family, or friends.
- Prefer substantial biographies, institutional records, academic publications, and independent journalism.

### Recent Event

- State what happened, where and when it happened, and why reliable sources covered it.
- Present the sequence of events in chronological order.
- Distinguish confirmed information from attributed claims.
- Prefer established news organisations, official records, and independent expert analysis.

### Astronomical Object

- Identify the object's type, location, and main physical characteristics.
- Describe discovery and observation using published sources.
- Avoid speculation that is not attributed to a reliable source.
- Prefer astronomical catalogues, peer-reviewed research, observatory publications, and space-agency material.

### Software

- Explain the software's purpose, development, and notable uses.
- Separate independently documented use from the developer's own claims.
- Avoid feature lists copied from product material.
- Prefer independent technical publications, academic work, books, and established technology journalism.

### Company

- Explain what the company does, when it was formed, and its documented products or services.
- Cover significant criticism or disputes only in proportion to reliable coverage.
- Avoid promotional language and unsupported claims of leadership or innovation.
- Prefer independent business journalism, regulatory filings, books, and academic work.

### Landform

- Identify the landform's location, type, formation, and physical characteristics.
- Attribute measurements when sources differ.
- Separate scientific description from tourism or promotional claims.
- Prefer geological surveys, academic geography, authoritative atlases, and government scientific agencies.

### Island

- Identify the island's location, political status, geography, and environment.
- Add history, population, or ecology only when relevant and sourced.
- Avoid travel-guide language.
- Prefer government statistics, atlases, academic research, and reliable historical works.

## Runtime architecture

All runtime changes remain under `src/preEditor/`, apart from tests and any necessary hub copy. Editor-owned files remain untouched.

### Data

Replace the single hard-coded Person fixture with a catalogue containing:

- one immutable `explorationArticle`;
- `journeysByKey`;
- `guidanceProfilesByOutline`;
- a validated list of blue context segments.

The catalogue imports the existing `simpleEnglishOutlinesById` only for integrity checks and outline metadata. It does not duplicate editor scaffold content.

### Reader

`ProtoWikiArticleShell.vue` renders text, context, and missing segments. `PreEditorReadingView.vue` resolves every missing segment to:

```text
/article-guidance
  ?step=subject
  &journey=<journey-key>
  &title=<subject-title>
  &source=redlink
  &variant=toolbar-outline
```

The route's `journey` value is authoritative. `title` initializes the editable subject field but cannot change which outline the journey represents.

### Article Guidance

`ArticleGuidanceSetupView.vue` resolves the active journey once and passes it through Subject, Sources, and Guidance. The shell and responsive visual fidelity from the existing implementation remain unchanged.

- Subject shows only the active journey's deterministic result.
- Sources uses the selected type label and source-tip profile.
- Guidance uses the selected type's frozen copy.
- Two unique valid HTTP(S) source URLs remain required.
- Start writing hands the selected journey's outline to the editor.

`preEditorFlow.js` stores `journeyKey` in state and rejects a selected subject from another journey. Changing to another red-link journey creates a fresh flow with no carried sources.

### Editor handoff

The handoff remains the ownership boundary:

```text
/editor?lang=en
  &variant=toolbar-outline
  &outline=<journey outline id>
  &title=<subject title>
  &articleguidance=1
  &sourceOrigin=redlink
  &source=<first URL>
  &source=<second URL>
```

The editor already reads valid outline IDs. This work does not change editor components or claim that the editor consumes title and source payloads beyond its current behaviour.

## Route, history, and recovery

- Forward setup transitions use `router.push` and preserve `journey`, `title`, `source`, and `variant`.
- Back and Forward retain state while the mounted flow belongs to the same journey.
- Returning to `/article` and choosing another red link starts a clean journey.
- Refreshing Sources or Guidance resets to Subject for the same valid journey because setup state is not persisted.
- An unknown or missing journey key replaces the setup route with `/article`; it must never silently fall back to Person.
- A route whose title does not match the journey opens Subject with the provided editable title and no result. Restoring the journey's canonical title restores the result.

## Accessibility

- Article and section heading order remains semantic.
- Each red link is a native anchor and has a distinct accessible name.
- Red-link action is conveyed by underline, colour, the research note, and accessible text.
- Blue context text is not exposed as an action.
- Focus moves to the setup heading after a red-link transition.
- Route changes and validation retain the current status/error announcements.
- DOM order equals reading and keyboard order at every breakpoint.
- The research note is regular page content and does not use an alert role.

## Verification

### Unit checks

- all eight journey keys are unique;
- every missing article segment references a real journey;
- every journey appears in the article at least once;
- every journey outline exists in `simpleEnglishOutlinesById`;
- every journey article type matches the registered outline article type;
- shared guidance profiles exist for all seven outline IDs;
- cross-journey subject/state combinations are rejected;
- exact editor handoff queries are correct for all eight journeys;
- the catalogue remains deeply immutable.

### Browser checks

At mobile, compact/tablet, and desktop widths:

1. The research note and the short Exploration article are readable without horizontal scrolling.
2. Eight red links and blue context text have the approved visual and semantic treatment.
3. Every red link exposes its own journey, title, and accessible name in its `href`.
4. Keyboard Enter on every red link opens its matching Subject result.
5. Blue context items have no link role or tab stop.
6. Subject displays the correct title, description, and type.
7. Sources displays the correct type-specific tips.
8. Guidance displays the correct type-specific guidance.
9. Completing each of the seven unique outline paths reaches `/editor` with the exact outline ID; both Person subjects are checked separately for title identity.
10. Back, Forward, invalid-step recovery, and refresh preserve or reset the journey as specified.
11. No request to Wikimedia or another content API occurs during the flow.
12. The final diff contains no editor-owned files.

Run existing unit, browser, lint, and production-base checks in addition to the new catalogue and journey cases.

## Out of scope

- all 38 outlines on one article;
- live Wikipedia missing-page status;
- live Wikidata identity resolution;
- live source evaluation or citation generation;
- claiming the famous subjects are genuinely missing;
- persisting incomplete setup state across reloads;
- changing editor rendering, toolbar behaviour, or outline content;
- publication-ready sourcing or community review of the fixture article.

## Acceptance boundary

The design is complete when a participant can enter `/article` directly, understand the research task, choose any of eight familiar simulated red links, complete type-appropriate Article Guidance, and enter the existing editor with the matching one of seven real outline IDs. The article must remain readable, policy-aligned, and clearly separated from the research instructions.
