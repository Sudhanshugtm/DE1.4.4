# Semantic Scaffold Field Sync Design

## Goal

Let an editor answer a reusable fact once and have that answer appear in every
semantically linked scaffold field in the current article structure, including linked fields in
sections added later.

## User contract

- Tapping an unfilled linked field selects the whole prompt, as today.
- Tapping an already answered linked value also selects the whole value so it can be corrected.
- When the editor finishes the value by moving away, blurring the editor, or publishing, every
  linked copy updates as one undoable edit.
- A linked field in a section added later immediately receives the article's existing answer.
- The behavior is invisible apart from the reflected text; no new chip, notification, or styling
  is introduced.
- Switching outlines starts a fresh editor and therefore a fresh set of values, matching the
  existing keyed editor lifecycle.

## Safety boundary

Display text is not semantic identity. The existing implementation compares raw bracket labels,
but the expanded 38-outline catalogue reuses labels such as `[year]`, `[location]`, and `[Name]`
for unrelated facts. Blind equality would put an award year into a graduation or career-start
field and would collapse repeated list rows.

Binding is therefore explicit and scoped to one outline. Each safe fact has a stable key, for
example `country:subject-name` or `person:birth-date`. Case variants and genuine aliases can share
one key only when the outline makes their meaning unambiguous. Examples include
`[Company name]`/`[Company Name]` and `[place of birth]`/`[place]` in a person's lead and early-life
section.

The initial manifest covers the reusable invariant facts in all outlines that contain them. The
auditable entries are:

- Actor: full name, birth date, and birthplace.
- Album: album title.
- Animal: common name and geographic range.
- Astronomical object: object name.
- Award: award name.
- Celebrity: full name, birth date, and birthplace.
- Chemical element: element name.
- City: city name.
- Company: company name, including its case variant.
- Country: country name.
- Human settlement: settlement name and region.
- Island: island name and body of water.
- Landform: feature name.
- Medical condition: condition name, including its case variant.
- Medical test: test name.
- Museum: museum name, including its case variant, and founding year.
- Musician: full name, birth date, and birthplace.
- Person: full name, birth date, and birthplace.
- Plant: common name and geographic range.
- Politician: full name, birth date, and birthplace.
- Product: product name and release year.
- School: school name and founding year.
- Software: software name, developer or organisation, and release year.
- Song: song title.
- Sports club: club name and founding year.
- Sportsperson: full name, birth date, and birthplace.
- Television series: series title.
- Theorem: theorem name.
- University: university name and founding year.
- Video game: game title.

Armed conflict, Book, Building, Literary work, Music genre, Recent event, Religion, and Social
issue have no declared binding because their current scaffolds contain no safely repeated fact.
The manifest intentionally excludes:

- ambiguous generic repeats, including Person and Politician `[year]`;
- pronouns whose sentence casing differs;
- repeated list-row fields that represent different people or entries;
- compound alternatives such as `[country/region]`, `[region or country]`, and
  `[country or territory]`;
- write/instruction fields and nested optional examples unless the repeated inner value is an
  explicitly declared invariant such as an award's own name.

If one raw label has mixed meanings anywhere within an outline, every occurrence of that label is
left unbound unless item-level metadata is introduced in a later design. The synchronizer changes
only text carrying the same explicit binding key. It never rewrites ordinary article prose or an
unbound scaffold field.

## Architecture

### Binding manifest

`src/config/outlines/fieldBindings.js` is the single auditable map from an outline ID and a
verbatim scaffold label to a semantic fact key. `getFieldBindingKey(outlineId, label)` returns a
fully scoped key or `null`. Keeping this separate from the source-derived Simple English outline
text preserves that catalogue verbatim and makes semantic decisions reviewable.

### Document-resident identity

`OutlineStructureList` passes `props.outline.id` into both preview rendering and
`outlineItemToEditorHtml`. During rendering, declared fields are wrapped in an invisible span
carrying `data-scaffold-binding` and the verbatim original placeholder. A small TipTap mark
preserves both attributes when the prompt is replaced with an answer. The binding identity
therefore lives with the text in the ProseMirror document rather than in a detached JavaScript
cache. `TextEditor` does not need an outline-ID prop because inserted document content already
carries the scoped key.

This matters for Undo and late section insertion:

- Undo restores the marked bracket prompts and removes the answer, so no stale cached value can
  leak into a later section.
- Redo restores both the answer and its linked copies.
- A newly inserted marked prompt can discover an existing marked answer with the same key.

The mark has no visual treatment and is editor-only metadata.

### Field discovery and synchronization

`findBoundFields(doc)` returns contiguous marked ranges with their key, text, positions, and
marks. `findScaffoldFields(doc)` continues to find all unfilled bracket prompts and exposes a
binding key when one is present.

`FieldBinding` tracks only the linked field currently being edited. Replacing a whole linked
range starts the active answer. Further typing maps that range forward. Moving the selection
away, an explicit blur/publish commit, or replacing a different linked field commits it.

Commit creates one tagged appended transaction that replaces every other range carrying the same
key, preserves the binding mark, and clears active state. A value is an answer only when its
trimmed text is non-empty and differs from the mark's exact original placeholder; this accepts
legitimate answers containing brackets without mistaking a prompt for an answer. The transaction
tag prevents recursive synchronization. Outline insertion uses the same replacement path: if
exactly one distinct answer exists for a key, new prompts with that key inherit it. Conflicting
existing values are left untouched rather than guessed.

### Editor integration

`TextEditor` installs the binding mark before `FieldBinding`, selects both unfilled and answered
linked ranges on click, and commits an active field on blur. `EditorView` explicitly commits before
its Publish checks so the document and remaining-field count are current even if focus has not
moved.

## History and edge behavior

- The first whole-field replacement calls ProseMirror `closeHistory` and assigns a unique
  `composition` history-group ID. Every document transaction while that field is active carries
  the same group ID, including slow multi-transaction typing. The synchronization transaction is
  appended to that group. A final no-step `closeHistory` transaction closes the group after sync.
  Therefore one Undo restores the previous linked values and Redo reapplies them, without merging
  the field with preceding or following prose edits. Tests exercise slow typing, paste, blur,
  Publish, and correction through the actual Undo and Redo commands.
- Partial keyboard edits are not propagated because they do not replace a whole linked range.
- Empty answers and text that is still a bracket prompt are not committed.
- Section deletion, Undo, and reinsertion derive values from marked document content, never from
  stale positions.
- If several distinct answered values somehow exist for one key, late insertion does not choose
  between them.
- Unbound fields retain their existing highlighting, selection, checks, and ordinary editing.

## Verification

Focused automated tests will cover semantic markup, safe aliases, ambiguous exclusions, two
successive facts in one session, cross-section propagation, correction of an answered value,
blur/publish commit, late insertion, one-step Undo/Redo, recursion prevention, and stale-state
resistance after section changes. The retained journey will also be checked in a real browser on
a country outline before merge, followed by lint and production build.
