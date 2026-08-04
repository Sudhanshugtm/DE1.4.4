# Portugal Country-Outline Verified Facts Showcase

**Date:** 4 August 2026

## Goal

Demonstrate the breadth of the Verified Facts idea with several trustworthy, outline-matched suggestions for one subject. The local Portugal journey will show four reviewed Wikidata statements connected to the Country outline's Introduction prompts.

This remains a local design prototype. It must not be pushed, published, or presented as evidence of broad Wikidata coverage.

## Why Portugal

The current Buddhism journey is an honest sparse example: direct Wikidata data yields only a small number of responsibly usable statements for the Religion outline. Portugal is a better breadth example because four referenced statements have clear matches in the Country introduction:

| Country-outline prompt | Wikidata statement                                   | Reviewed display       | Context that must remain visible                                         |
| ---------------------- | ---------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| Official name          | [Q45 P1448](https://www.wikidata.org/wiki/Q45#P1448) | `República Portuguesa` | Portuguese-language value; one reference to Portugal's diplomatic portal |
| Area                   | [Q45 P2046](https://www.wikidata.org/wiki/Q45#P2046) | `92,225 km²`           | Point in time: 2021; one Pordata reference                               |
| Population             | [Q45 P1082](https://www.wikidata.org/wiki/Q45#P1082) | `10,347,892`           | Preferred statement; 2021 census; one official census reference          |
| Official language      | [Q45 P37](https://www.wikidata.org/wiki/Q45#P37)     | `Portuguese`           | Normal-rank current value; one constitutional reference                  |

The prototype excludes capital because its current reference is weak, and excludes region because Wikidata offers different granularities that the system should not choose silently. Deprecated language statements are excluded.

The reviewed qualification copy is fixed rather than improvised during implementation:

- Official name: `Wikidata records this official name in Portuguese and cites Portugal's diplomatic portal.`
- Area: `Wikidata records this area with a point in time of 2021 and cites Pordata.`
- Population: `The preferred Wikidata population statement is dated 2021, uses the census method, and cites Portugal's national statistics office.`
- Official language: `Wikidata records Portuguese as the current normal-rank official-language value and cites section 11.3 of Portugal's constitution.`

## Scope

This slice will:

- add a reviewed fact set for the exact local route `{ language: en, outline: country, title: Portugal }`;
- keep the existing `{ en, religion, Buddhism }` example available as the sparse comparison;
- reuse `+ → Verified facts` and the existing bottom sheet;
- state how many facts match the current outline;
- group the Portugal facts under `Introduction`;
- show the exact Country-outline field each fact matches;
- preserve qualifiers such as language and point-in-time dates;
- link every card to the exact Wikidata property on Portugal;
- remain read-only and leave the editor document, selection, and history unchanged.

This slice will not:

- fetch Wikidata at runtime;
- insert, replace, or generate article text;
- jump to a scaffold field;
- treat a Wikidata reference as a ready Wikipedia citation;
- include weak, ambiguous, deprecated, or unreferenced claims to make the list look larger;
- change Suggested sections, the rail, citations, publishing, settings, or GitHub Pages.

## User flow

1. Open the local Portugal editor journey with the Country outline.
2. The existing arrival flow remains unchanged.
3. Close the arrival sheet and tap the toolbar `+` button.
4. Choose `Verified facts` immediately below `Suggested sections`.
5. The bottom sheet opens on `Verified facts`.
6. The introduction says: `4 referenced facts matched to the Country outline. Check each source before using it.`
7. The sheet shows an `Introduction` group containing four read-only cards in outline order:
   1. Official name
   2. Area
   3. Population
   4. Official language
8. Each card shows:
   - the matching prompt label;
   - the reviewed value;
   - the required qualifier or source context;
   - `1 reference`;
   - `View this statement on Wikidata`.
9. Closing the sheet returns to the unchanged draft.

## Information hierarchy

The sheet should make the relationship to the outline visible before the factual detail:

1. sheet title: `Verified facts`;
2. coverage summary: `4 referenced facts matched to the Country outline`;
3. outline section: `Introduction`;
4. field-level label, such as `Area`;
5. value;
6. qualification and provenance.

The cards remain visually non-interactive. Only the provenance link is actionable. The list uses the existing scrollable bottom-sheet body; four cards stack vertically on mobile.

## Data model

The reviewed fixture remains a static, route-keyed snapshot. Each fact adds explicit outline context to the existing fields:

```js
{
  id: 'portugal-area-2021',
  outlineId: 'country',
  sectionId: 'introduction',
  sectionLabel: 'Introduction',
  targetFieldId: 'country:introduction:area',
  targetFieldToken: '[area]',
  fieldLabel: 'Area',
  label: 'Area',
  value: '92,225 km²',
  qualification: 'Wikidata records this area with a point in time of 2021 and cites Pordata.',
  referenceCount: 1,
  claimUrl: 'https://www.wikidata.org/wiki/Q45#P2046',
}
```

`outlineId`, `sectionId`, `sectionLabel`, `targetFieldId`, `targetFieldToken`, and `fieldLabel` are required for every reviewed fact. A `valueLanguage` field is optional for values that are not language-specific; when present, it must be a supported BCP 47 language tag. The official-name fact uses `valueLanguage: 'pt'`, and the renderer applies `lang="pt"` to `República Portuguesa`.

Field mapping is validated against an explicit allowlist, not accepted merely because strings are present:

| Outline  | Section      | Target field ID                            | Exact scaffold token   |
| -------- | ------------ | ------------------------------------------ | ---------------------- |
| Country  | Introduction | `country:introduction:official-name`       | `[official name]`      |
| Country  | Introduction | `country:introduction:area`                | `[area]`               |
| Country  | Introduction | `country:introduction:population`          | `[population]`         |
| Country  | Introduction | `country:introduction:language`            | `[language]`           |
| Religion | Introduction | `religion:introduction:approximate-period` | `[approximate period]` |

The validator checks the whole `{ outlineId, sectionId, targetFieldId, targetFieldToken }` tuple against this allowlist and against the current route's outline. A fact whose target belongs to another outline, section, field ID, or token fails closed. The existing Buddhism fact receives the Religion mapping metadata so the renderer has one consistent contract.

The fixture lookup continues to fail closed. It returns copies, performs no network request, rejects malformed records, and only accepts exact HTTPS Wikidata item-plus-property links.

## Component responsibilities

### Reviewed fixture lookup

`reviewedVerifiedFacts.js` owns the two reviewed route snapshots and validates both provenance and outline-context fields.

### Editor orchestration

`EditorView` continues to derive the fact set from the exact route. It also passes the current outline label to the sheet presentation. It must not manipulate the editor when opening Verified Facts.

### Bottom sheet

`OutlinePopover` keeps ownership of framing, focus trapping, close behavior, and scrolling. It passes the facts and active outline label to the read-only presentation.

### Read-only fact presentation

`VerifiedFactsReferenceList` computes stable section groups from the reviewed facts, renders the dynamic coverage summary, and stacks the cards within each section. It emits no insertion event and has no editor dependency.

### Toolbar

`CdxToolbar` remains unchanged. It only knows whether reviewed facts exist and emits the dedicated open event.

## Accessibility

- The bottom sheet retains its dynamic accessible dialog name.
- The coverage count appears in visible text and is available to assistive technology.
- Each group uses a heading associated with its section.
- Each fact article remains labelled by its field-level heading.
- Language-specific values use semantic `lang` metadata; `República Portuguesa` is marked `lang="pt"`.
- Provenance links retain visible underlines, visible keyboard focus, descriptive accessible names, `target="_blank"`, and `rel="noopener"`.
- Dates, language, rank implications, and source context are written in text, not encoded only through color.
- No card uses button semantics, a pointer cursor, or an insertion icon.

## Failure and exclusion behavior

- Unsupported route: omit the toolbar entry.
- Empty or invalid fact set: do not open an empty Verified Facts sheet.
- Missing section or field context: omit the malformed fact.
- Mismatched outline, section, field ID, or scaffold token: omit the malformed fact.
- Invalid language metadata: omit the malformed fact.
- Missing reference or invalid claim URL: omit the malformed fact.
- Multiple or ambiguous values: do not choose one silently.
- Deprecated values: exclude them.
- External navigation failure: leave the prototype and draft state unchanged.

## Verification

Automated checks will cover:

- the exact Portugal/Country route returns four facts in the intended order;
- every Portugal fact contains the allowlisted Country → Introduction → exact-field mapping tuple;
- wrong outline, section, field ID, or scaffold token mappings fail closed;
- official name, area, population, and official language preserve their reviewed values and exact qualification copy;
- the Portuguese official name renders with `lang="pt"`, and invalid language metadata fails closed;
- Buddhism remains available with its one reviewed fact and matching context metadata;
- unsupported routes still return no facts;
- malformed context metadata fails closed;
- the presentation renders the dynamic count and one Introduction group whose heading is associated with its region;
- all four articles have unique IDs and correct `aria-labelledby` relationships;
- fact cards expose no button or button-role semantics;
- links use the exact Q45 property anchors and remain safe;
- provenance links have descriptive accessible names that announce their new-tab behavior;
- opening and closing the new route's sheet does not change the real editor document, selection, or undo depth;
- the full test suite, focused lint, formatting, diff check, and production build pass.

Manual in-app verification will cover:

- the exact local Portugal/Country URL;
- unchanged arrival and `+` menu order;
- readable count, group, card hierarchy, qualifiers, and provenance at a narrow viewport;
- sheet scrolling through all four cards;
- keyboard focus and close behavior;
- a brief screen-reader announcement pass covering the dialog title, coverage summary, Introduction heading, Portuguese-language value, each fact label, and new-tab provenance link;
- hidden entry on an unsupported route;
- unchanged editor content, selection, and undo availability;
- no new browser console errors.

## Local-only handoff

After verification, keep the work on the isolated local branch and leave the Portugal route open in the in-app browser. Do not merge, push, create a pull request, or update GitHub Pages.
