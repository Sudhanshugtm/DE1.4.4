# Optional Sources step

## Goal

Prevent research participants from getting stuck before the Guidance and editor stages when they do not have sources ready.

The Sources screen remains part of the journey because it teaches source expectations and lets participants add links when they have them. It no longer gates progress. A participant with zero, one, or multiple accepted sources can continue.

This document supersedes the two-source minimum and mandatory-source interaction described in:

- `docs/superpowers/specs/2026-07-31-pre-editor-red-link-journey-design.md`
- `docs/superpowers/specs/2026-07-31-exploration-multi-outline-red-links-design.md`

It changes only this research prototype; it does not change Article Guidance policy or configuration in the MediaWiki extension.

## Approved interaction

The Sources screen keeps its existing structure, source tips, URL input, add/remove behavior, Back action, and primary action position.

Replace the mandatory presentation with:

- Heading: **Add sources (optional)**
- Supporting copy: **If you have sources ready, add them now. You can also add citations while writing.**
- Zero-source status: **You can continue without adding a source.**
- One-source status: **1 source added. You can add more while writing.**
- Multiple-source status: **N sources added. You can add more while writing.**
- Primary action: **Continue**, enabled immediately

Do not show a required asterisk, a source minimum, or language saying sources are required.

Choosing **Continue** always advances a participant with the journey's selected subject to Guidance. It is enabled whenever the Sources screen has a matching journey and selected subject, including while an invalid or duplicate source error is visible. This remains true when the source input contains any unsubmitted draft, whether the text is empty, a valid URL, an invalid URL, or a duplicate URL. URL validation occurs only when **Add source** is activated. Continuing clears the draft input and any source error. Unsubmitted text is never auto-added, preserved when returning to Sources, or emitted as an editor query parameter.

## Flow and data behavior

The selected, journey-bound subject remains the only prerequisite for Sources and Guidance. Source count is not a routing prerequisite.

The flow must preserve these boundaries:

- Subject is still required before Sources or Guidance.
- A direct Sources or Guidance URL without matching in-memory journey and subject state recovers to the canonical Subject route for that journey.
- Missing, stale, or cross-journey selected-subject state cannot enter Sources or Guidance.
- A matching selected subject may enter Guidance with an empty sources array.
- Source-state updates remain immutable: accepting or removing a source returns new state and collection values rather than mutating existing values. An accepted entry cannot be edited in place; it can be removed and a corrected URL can be added. Accepted URLs remain normalized and deduplicated.
- Editor handoff includes one repeated `source` query parameter for every accepted source.
- Editor handoff with zero sources includes no `source` query parameters.
- Article type, title, outline, provenance, and variant handoff remain unchanged.

The source profile stays responsible for type-specific source tips through `profileKey`. Remove `sourceRequirements.requiredCount` from every journey and the legacy Person fixture, and remove `requiredSourceCount` from flow state. `canEnterStep()`, setup-route resolution, the view, and editor handoff must have no source-count progression gate. Do not preserve a misleading minimum of zero.

## Error handling and accessibility

- Keep the source input's programmatic label and existing inline validation.
- **Add source** remains disabled for an empty input and reports invalid or duplicate URLs when activated.
- The source-status text remains a polite live region so additions and removals are announced.
- Optionality is communicated with text, not color alone.
- **Continue** remains keyboard reachable and enabled in every valid Sources state.
- Focus movement, Back behavior, heading focus, and mobile layout remain unchanged.

## Scope boundaries

This change does not:

- remove or collapse the Sources screen;
- add a second **Skip for now** action;
- add live Wikidata, Citoid, or source-quality calls;
- modify the existing editor, Edit Checks, or outline contents;
- change the production Article Guidance extension's source policy;
- alter the article, red-link catalogue, subject cards, or Guidance copy.

## Verification

Test-first implementation must prove:

1. Guidance eligibility requires the matching selected subject but accepts zero sources.
2. Editor handoff succeeds with zero sources and emits no `source` values.
3. Editor handoff still preserves accepted sources in order.
4. Routing permits Guidance for a matching zero-source state and recovers direct Sources or Guidance routes with missing, stale, or cross-journey subject state to Subject.
5. The Sources screen says it is optional, contains no required marker or mandatory-source copy, and exposes an enabled **Continue** action at zero sources.
6. Empty, valid, invalid, and duplicate unsubmitted drafts do not block Continue—even while an error is visible—are cleared on progression, and do not reach the editor.
7. Source add/remove status transitions, including returning to zero accepted sources, remain available through the polite live region.
8. At least one production browser journey skips source entry, reaches its matching editor outline, and has no `source` query parameter.
9. At least one production browser journey adds sources and preserves them in the editor URL.
10. The full unit suite, targeted lint and formatting checks, and GitHub Pages production build remain green.

## Release

Publish this change through a focused branch and pull request into `Sudhanshugtm/DE1.4.4` `main`. After merge, wait for the GitHub Pages workflow and verify the public `/DE1.4.4/article` journey through Sources, Guidance, and a matching editor outline with zero sources.
