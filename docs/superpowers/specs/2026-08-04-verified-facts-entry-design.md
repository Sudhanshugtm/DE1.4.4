# Verified Facts Entry: First Local Slice

**Date:** 2026-08-04

## Goal

Add a local-only `Verified facts` entry to the existing toolbar `+` menu and let it open a trustworthy preview inside the existing bottom-sheet pattern. This slice is for evaluating discovery, hierarchy, and provenance on the current Buddhism journey before any fact-to-placeholder insertion is built.

## Scope

This slice will:

- keep the current Article Guidance and editor flow unchanged;
- add `Verified facts` directly below `Suggested sections` in the toolbar `+` menu;
- open the existing bottom-sheet container with a `Verified facts` heading;
- show one carefully qualified, route-specific Wikidata statement for Buddhism;
- make the statement read-only and link to the exact Wikidata claim;
- remain local and unpushed.

This slice will not:

- insert text into the editor;
- jump to or fill a placeholder;
- create a live Wikidata connection;
- treat a Wikidata value as a Wikipedia citation;
- claim broad Wikidata or outline coverage;
- change the rail, citation, publishing, section, or settings flows.

## Research constraints

The Guided Article Creation research found that loose facts became confusing when editors had to work out which placeholder they belonged to. It also found that the `+` menu alone is not highly discoverable and that provenance must be visible. Therefore:

- the user-selected `+` location is treated as a discovery experiment, not as proof that the entry point is solved;
- no fact is pasted at the current cursor;
- the card explains the statement's uncertainty instead of flattening it into a cleaner-looking claim;
- the exact Wikidata claim is available for inspection;
- missing prototype data produces no empty state or implied judgment about notability.

## User flow

1. The editor opens exactly as it does now.
2. The user taps the toolbar `+` button.
3. The menu shows, in order:
   - `Suggested sections`
   - `Verified facts`
   - the existing native insert tools
4. The user taps `Verified facts`.
5. The insert menu closes and the existing bottom sheet opens.
6. The sheet header reads `Verified facts` with the existing close control.
7. The sheet says `Referenced information from Wikidata. Check the source before using it.` and contains a `For your reference` group.
8. The Buddhism statement is shown without an add icon or insert affordance:
   - label: `Approximate origin period`
   - value: `Between 563 BCE and 483 BCE`
   - qualification: `Wikidata records the inception date as unknown, bounded by these earliest and latest dates.`
   - provenance: `1 reference` and a `View this statement on Wikidata` link to `https://www.wikidata.org/wiki/Q748#P571`
9. Following the link opens Wikidata in a new tab. Closing the sheet returns to the unchanged draft.

The Wikidata item currently represents P571 as an unknown value with P1319 and P1326 qualifiers and one book reference. The prototype must preserve that nuance and must not convert it to a single date.

## Visibility rule

`Verified facts` appears only when the local prototype has an explicitly reviewed fact set for the current language, outline, and title. The first set is only:

- language: `en`
- outline: `religion`
- title: `Buddhism`

Other journeys keep their existing `+` menu unchanged. The absence of the entry carries no message about the subject or its notability.

## Component boundaries

### Verified-fact fixture lookup

A small configuration module owns static, reviewed prototype fixtures. A lookup accepts `{ language, outline, title }` and returns a fact set or an empty array. Each displayed fact requires a label, value, uncertainty qualification, exact claim URL, and reference count. If any required field is absent, that fact is omitted. The lookup performs no network request and makes the prototype snapshot explicit.

### Toolbar entry

`CdxToolbar` receives a Boolean indicating whether reviewed facts exist. When true, it renders the new menu button with `cdxIconCheckAll` and emits a dedicated `open-verified-facts` event. It does not know fact contents or manipulate the editor.

### Editor orchestration

`EditorView` derives the current fact set from the route, passes visibility to the toolbar, and handles `open-verified-facts` by selecting that sheet view and opening the existing popover. This is the only unit coordinating route context and sheet state.

### Read-only fact presentation

`VerifiedFactsReferenceList.vue`, a toolbar-specific read-only component, renders the explanation, group label, value, qualification, reference count, and exact-claim link. It has no editor dependency and emits no insertion event. The shared insertion-capable `VerifiedFactsList.vue` and the existing experimental rail behavior remain untouched.

### Existing bottom sheet

`OutlinePopover` continues to own sheet framing, focus trapping, close behavior, and scroll treatment. It receives the reviewed fact set and renders the read-only presentation when its initial view is `verified-facts`.

## Interaction and accessibility

- The new menu item is a native button with `role="menuitem"`, matching its siblings.
- Its icon is supportive; the text label carries the meaning.
- The sheet uses the existing close button, focus trap, and scroll behavior.
- The provenance link has descriptive text, a visible focus state, and opens safely with `rel="noopener"`.
- The card itself is not clickable, preventing a false insert affordance.
- No information is conveyed by color alone.

## Failure behavior

- No reviewed facts: omit the menu item and do not show an empty sheet.
- Missing optional qualification or reference metadata: omit that row rather than inventing content.
- A failed external Wikidata navigation does not change the draft or sheet state.
- Opening or closing the sheet never changes selection, cursor position, draft text, or undo history.

## Verification

Automated checks will cover:

- the route lookup returns the Buddhism fixture and returns no fixture for an unsupported journey;
- the toolbar renders the item only when enabled;
- activating it closes the insert menu and emits `open-verified-facts`;
- the popover opens directly on the Verified Facts view;
- the fact presentation is read-only and contains the exact claim link;
- existing focused tests and the production build still pass.

Manual in-app browser verification will cover:

- opening `+` on the current Buddhism route;
- order, label, icon, spacing, and tap target of the new entry;
- transition from menu to bottom sheet;
- readable sheet hierarchy on the current narrow viewport;
- keyboard focus and close behavior;
- unchanged editor content and undo history after opening, linking, and closing.

## Next slice

Only after this discovery and provenance preview is reviewed will a separate design decide whether and how a fact should map to a specific scaffold placeholder, jump there, and become editable text. That insertion behavior is intentionally outside this slice.
