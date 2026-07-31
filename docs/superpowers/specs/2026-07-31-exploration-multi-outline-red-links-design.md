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

The article fixture below records a stable source ID on every factual sentence. Routine biographical, mission, and product facts use authoritative institutional sources; geographic facts use independent or intergovernmental sources. The copy makes no claim about significance, reception, or impact. A factual sentence cannot be changed during implementation unless its exact text and source mapping are first updated in this design specification. The simulated link state is never presented as a factual statement about a live wiki.

## Article and research note

### Research note

The note appears outside the semantic article and uses the existing Codex/token language rather than Wikipedia article styling.

**Research prototype**

> Read this short article and choose any red link that interests you. Each red link starts a different article-creation path. Link colours are simulated for this study. Blue links provide context and are not active. When asked, add any two valid web links as sources.

The note is visible at direct `/article` entry, because shared research links may bypass the hub. It is concise enough for an experienced editor to scan and explicit enough for a newcomer to begin without facilitator help.

### Article metadata

- Title: **Exploration**
- Description: **Travel and study undertaken to learn about unfamiliar places**
- Target reading level: plain international English suitable for a Simple English Wikipedia-style prototype

### Approved article copy

#### Introduction

Exploration is travel over unfamiliar territory for discovery, or the careful study of something in order to learn more about it. Modern geographical exploration includes field research and the use of different tools and methods. *Maps* and *satellite images* are among the tools used to study places.

#### Exploration on Earth

**Mount Everest** lies in the *Himalayas* on the border between *Nepal* and *China*. **Easter Island**, also called *Rapa Nui*, is a Chilean island in the *Pacific Ocean*. **Google Earth** displays satellite imagery and 3D representations of *terrain* and *buildings*.

#### Space exploration

**Mars** has been explored by robotic *orbiters*, *landers*, and *rovers*. **Neil Armstrong** became the first person to set foot on the *Moon* on 20 July 1969. **Valentina Tereshkova** became the first woman in space when *Vostok 6* launched on 16 June 1963.

The **Chandrayaan-3 Moon landing** was a successful soft landing on the *Moon* on 23 August 2023. **SpaceX** developed the *Dragon spacecraft*, which carries crew and cargo to orbiting destinations such as the *International Space Station*.

Bold text above identifies red-link segments in the fixture, and italic text identifies blue contextual segments. The rendered article does not add bold or italic styling to either link treatment.

### Sentence-level source fixture

The fixture stores sources once and references them from immutable sentence records:

```js
{
  title: 'Exploration',
  description: {
    id: 'meta-description',
    text: 'Travel and study undertaken to learn about unfamiliar places',
    sourceIds: [ 'national-geographic-why-we-explore' ]
  },
  sources: {
    'national-geographic-why-we-explore': {
      publisher: 'National Geographic Society',
      url: 'https://education.nationalgeographic.org/resource/why-we-explore/'
    },
    'rgs-geographical-exploration': {
      publisher: 'Royal Geographical Society',
      url: 'https://www.rgs.org/exploration/what-is-geographical-exploration'
    },
    'national-geographic-geography': {
      publisher: 'National Geographic Society',
      url: 'https://education.nationalgeographic.org/resource/geography-article/'
    },
    'national-geographic-everest': {
      publisher: 'National Geographic',
      url: 'https://www.nationalgeographic.com/adventure/article/climbing-mount-everest-1'
    },
    'esa-easter-island': {
      publisher: 'European Space Agency',
      url: 'https://www.esa.int/ESA_Multimedia/Images/2019/04/Easter_Island'
    },
    'google-earth-desktop': {
      publisher: 'Google Earth',
      url: 'https://earth.google.com/desktop/'
    },
    'nasa-mars-exploration': {
      publisher: 'NASA',
      url: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/'
    },
    'nasa-neil-armstrong': {
      publisher: 'NASA',
      url: 'https://www.nasa.gov/people/neil-a-armstrong/'
    },
    'esa-valentina-tereshkova': {
      publisher: 'European Space Agency',
      url: 'https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/First_woman_in_space_Valentina'
    },
    'isro-chandrayaan-3': {
      publisher: 'Indian Space Research Organisation',
      url: 'https://www.isro.gov.in/ISRO_EN/Chandrayaan3.html'
    },
    'nasa-commercial-crew-dragon': {
      publisher: 'NASA',
      url: 'https://www.nasa.gov/commercial-crew-program-press-kit/'
    }
  },
  sections: [ {
    heading: 'Introduction',
    sentences: [ {
      id: 'intro-definition',
      segments: [ { kind: 'text', text: 'Exploration is ...' } ],
      sourceIds: [ 'national-geographic-why-we-explore' ]
    } ]
  } ]
}
```

Every sentence record must have a stable `id`, a `sourceIds` array containing at least one ID, and ordered `segments`. Every referenced source ID must exist in the fixture's `sources` object. The source map is research evidence and is not rendered as an article References section in this prototype.

The exact claim-to-source mapping is:

| Claim ID | Exact claim | Source ID and stable URL |
|---|---|---|
| `meta-description` | Travel and study undertaken to learn about unfamiliar places | `national-geographic-why-we-explore` — <https://education.nationalgeographic.org/resource/why-we-explore/> |
| `intro-definition` | Exploration is travel over unfamiliar territory for discovery, or the careful study of something in order to learn more about it. | `national-geographic-why-we-explore` — <https://education.nationalgeographic.org/resource/why-we-explore/> |
| `intro-modern-practice` | Modern geographical exploration includes field research and the use of different tools and methods. | `rgs-geographical-exploration` — <https://www.rgs.org/exploration/what-is-geographical-exploration> |
| `intro-tools` | Maps and satellite images are among the tools used to study places. | `national-geographic-geography` — <https://education.nationalgeographic.org/resource/geography-article/> |
| `earth-everest` | Mount Everest lies in the Himalayas on the border between Nepal and China. | `national-geographic-everest` — <https://www.nationalgeographic.com/adventure/article/climbing-mount-everest-1> |
| `earth-easter-island` | Easter Island, also called Rapa Nui, is a Chilean island in the Pacific Ocean. | `esa-easter-island` — <https://www.esa.int/ESA_Multimedia/Images/2019/04/Easter_Island> |
| `earth-google-earth` | Google Earth displays satellite imagery and 3D representations of terrain and buildings. | `google-earth-desktop` — <https://earth.google.com/desktop/> |
| `space-mars` | Mars has been explored by robotic orbiters, landers, and rovers. | `nasa-mars-exploration` — <https://science.nasa.gov/planetary-science/programs/mars-exploration/> |
| `space-armstrong` | Neil Armstrong became the first person to set foot on the Moon on 20 July 1969. | `nasa-neil-armstrong` — <https://www.nasa.gov/people/neil-a-armstrong/> |
| `space-tereshkova` | Valentina Tereshkova became the first woman in space when Vostok 6 launched on 16 June 1963. | `esa-valentina-tereshkova` — <https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/First_woman_in_space_Valentina> |
| `space-chandrayaan` | The Chandrayaan-3 Moon landing was a successful soft landing on the Moon on 23 August 2023. | `isro-chandrayaan-3` — <https://www.isro.gov.in/ISRO_EN/Chandrayaan3.html> |
| `space-spacex` | SpaceX developed the Dragon spacecraft, which carries crew and cargo to orbiting destinations such as the International Space Station. | `nasa-commercial-crew-dragon` — <https://www.nasa.gov/commercial-crew-program-press-kit/> |

Implementation review compares every rendered sentence with this table and fails if a factual sentence has no source mapping. Any wording, red-link subject, or outline-mapping change requires a specification update before implementation continues.

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

| Journey key | Visible subject | Subject description | Wikidata item | Type label | Article type | Editor outline |
|---|---|---|---|---|---|---|
| `person-neil-armstrong` | Neil Armstrong | American astronaut and aeronautical engineer | `Q1615` | Person | `Q5` | `person` |
| `person-valentina-tereshkova` | Valentina Tereshkova | Soviet cosmonaut and the first woman in space | `Q44371` | Person | `Q5` | `person` |
| `event-chandrayaan-3-landing` | Chandrayaan-3 Moon landing | 2023 lunar landing by India's Chandrayaan-3 mission | related item `Q65049774` | Recent Event | `Q108586636` | `recent-event` |
| `object-mars` | Mars | Fourth planet from the Sun | `Q111` | Astronomical Object | `Q6999` | `astronomical-object` |
| `software-google-earth` | Google Earth | Virtual globe and mapping software | `Q42274` | Software | `Q7397` | `software` |
| `company-spacex` | SpaceX | American aerospace company | `Q193701` | Company | `Q4830453` | `company` |
| `landform-mount-everest` | Mount Everest | Earth's highest mountain above sea level | `Q513` | Landform | `Q271669` | `landform` |
| `island-easter-island` | Easter Island | Island and special territory of Chile in the Pacific Ocean | `Q14452` | Island | `Q23442` | `island` |

### Frozen Wikidata-style results

The Subject step presents the active journey as a pictured Wikidata-style result without making a live Wikidata request. Each journey stores an exact or explicitly related Wikidata item ID and a bundled thumbnail copied from that item's image field at design time:

| Wikidata item | Bundled thumbnail source file |
|---|---|
| `Q1615` | `Neil Armstrong pose.jpg` |
| `Q44371` | `1st meeting of 8th State Duma 07.jpg` |
| `Q65049774` | `Chandrayaan-3 Integrated Module in clean-room 01.webp` |
| `Q111` | `Mars - August 30 2021 - Flickr - Kevin M. Gill.png` |
| `Q42274` | `NASA World Wind - Google Earth bar.png` |
| `Q193701` | `Entrance to SpaceX headquarters.jpg` |
| `Q513` | `Mount Everest as seen from Drukair2 PLW edit.jpg` |
| `Q14452` | `Easter Island 5.jpg` |

Seven cards show the thumbnail, title, type, description, and supporting text `Wikidata item · <QID>`. There is no separate Wikidata item for the landing event used by this study: `Q65049774` identifies the related Chandrayaan-3 mission. That event card therefore uses the honest supporting text `Related Wikidata item · Q65049774` and stores `wikidataRelation: 'related'`; it must not present the mission item as the landing event's exact identity.

Every thumbnail is bundled into `src/preEditor/assets/subjects/` and resolves to the application's own origin at runtime. The thumbnail is decorative because the same or related identity is available as text. If an image cannot be decoded, Codex's image placeholder remains visible and the result stays selectable. Runtime code neither searches Wikidata nor derives the editor outline from an item; the frozen journey mapping remains authoritative.

Every journey contains:

- a stable key;
- subject identity and description;
- an exact or explicitly related Wikidata item ID and bundled thumbnail;
- the exact existing outline ID and article type;
- a two-source minimum;
- type-appropriate recommended source categories;
- type-appropriate Guidance copy;
- the shared `toolbar-outline` editor variant.

The two famous people share one Person guidance profile but remain separate journeys. Shared profiles prevent duplicated policy copy without hiding the distinct subject identity.

## Type-specific guidance

All guidance is frozen local content. No Wikidata, Citoid, REST, or source-quality request is made. For each type below, the first three bullets are the exact Guidance-step bullets. The fourth `Prefer ...` bullet is the exact type-specific Sources-step tip shown below the shared requirement for two unique HTTP(S) URLs.

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

- one immutable `explorationArticle` with sentence IDs, ordered segments, and sentence-level source IDs;
- the complete immutable source records listed in the claim-to-source table;
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
  &sourceOrigin=redlink
  &variant=toolbar-outline
```

The route's `journey` value is authoritative. `title` initializes the editable subject field but cannot change which outline the journey represents.

`sourceOrigin` records how the participant entered the flow. The repeated `source` query key is reserved exclusively for participant-entered source URLs at editor handoff; it is never used for provenance and never appears on a setup-step URL. Participant-entered URLs remain in in-memory flow state during Subject, Sources, and Guidance.

Title matching is deterministic:

1. Vue Router performs URL decoding once; application code must not call `decodeURIComponent` again.
2. If `title` is repeated, use its first string value. Treat a missing, non-string, or whitespace-only value as absent and initialize the field with the journey's canonical title.
3. For comparison, normalize both values with Unicode NFKC, trim leading and trailing whitespace, collapse internal whitespace to one space, and compare with English locale-insensitive lowercase.
4. A normalized match displays the canonical title and the journey's single deterministic result.
5. A non-match displays the participant's trimmed input and no result. Typing a value that normalizes to the canonical title restores the result.

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

- The only valid `step` values are `subject`, `sources`, and `guidance`.
- Forward setup transitions use `router.push` and preserve `journey`, `title`, `sourceOrigin`, and `variant`. Participant-entered source URLs remain in flow state and are not serialized into setup-step URLs.
- Back and Forward retain state while the mounted flow belongs to the same journey.
- Returning to `/article` and choosing another red link starts a clean journey.
- A missing or unknown `step` on a valid journey uses `router.replace` to the canonical Subject URL for that journey and resets its transient flow state. It does not add a history entry.
- `sources` requires a matched and selected Subject result. `guidance` requires that result plus two unique valid HTTP(S) URLs. A direct route, refresh, Back, or Forward operation that does not meet the requested step's prerequisites uses `router.replace` to the canonical Subject URL and resets transient flow state.
- Refreshing Sources or Guidance therefore resets to Subject for the same valid journey because setup state is not persisted.
- An unknown or missing journey key replaces the setup route with `/article`; it must never silently fall back to Person.
- A route whose title does not match the journey opens Subject with the provided editable title and no result. Restoring the journey's canonical title restores the result.
- The canonical values for this study are `sourceOrigin=redlink` and `variant=toolbar-outline`. Route normalization preserves those values when present and replaces a missing, repeated, or different value with the canonical one.
- Route normalization drops unrecognized setup query keys and moves focus to the setup heading after replacement.

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
- every article description and factual sentence has at least one source ID;
- every referenced source ID resolves to the exact HTTPS URL in the approved source table;
- rendered sentence text exactly matches the approved claim text;
- cross-journey subject/state combinations are rejected;
- missing, empty, repeated, decoded, whitespace-varied, and case-varied titles follow the specified normalization rules;
- missing and unknown steps replace to Subject, while unmet step prerequisites reset to Subject;
- setup URLs use `sourceOrigin` only and editor handoff URLs reserve repeated `source` keys for entered URLs;
- exact editor handoff queries are correct for all eight journeys;
- the catalogue remains deeply immutable.

### Browser checks

At mobile, compact/tablet, and desktop widths:

1. The research note and the short Exploration article are readable without horizontal scrolling.
2. Eight red links and blue context text have the approved visual and semantic treatment.
3. Every red link includes its own journey and title in its `href`, and separately exposes its approved accessible name.
4. Keyboard Enter on every red link opens its matching Subject result.
5. Blue context items have no link role or tab stop.
6. Automated accessibility checks verify text contrast, distinct accessible names, visible keyboard focus, and focus on the setup heading after navigation.
7. Subject displays the correct title, description, and type, including the specified title-normalization cases.
8. Sources displays the correct type-specific tips.
9. Guidance displays the correct type-specific guidance.
10. Completing each of the seven unique outline paths reaches `/editor` with the exact outline ID; both Person subjects are checked separately for title identity.
11. Back, Forward, missing-step recovery, invalid-step recovery, prerequisite recovery, and refresh preserve or reset the journey as specified.
12. Every Subject result displays a same-origin bundled thumbnail and its exact or explicitly related Wikidata item ID.
13. No request to any Wikidata, Wikimedia, or Commons origin or to another content API occurs during the flow.
14. When a thumbnail request is deliberately failed, the Codex placeholder is visible and the result remains keyboard- and pointer-selectable.
15. The final diff contains no editor-owned files.

Run existing unit, browser, lint, and production-base checks in addition to the new catalogue and journey cases.

## Out of scope

- all 38 outlines on one article;
- live Wikipedia missing-page status;
- live Wikidata identity resolution;
- live source evaluation or citation generation;
- claiming the famous subjects are genuinely missing;
- persisting incomplete setup state across reloads;
- changing editor rendering, toolbar behaviour, or outline content;
- formal Wikipedia community review or publication of the fixture article.

## Acceptance boundary

The design is complete when a participant can enter `/article` directly, understand the research task, choose any of eight familiar simulated red links, complete type-appropriate Article Guidance, and enter the existing editor with the matching one of seven real outline IDs. The article must remain readable, policy-aligned, and clearly separated from the research instructions.
