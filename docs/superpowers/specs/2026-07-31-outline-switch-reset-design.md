# Outline switch reset and section deletion

## Goal

When an editor deliberately selects a different article outline from Settings, replace the
active outline, remove all content from the VisualEditor canvas, and immediately reopen the
Suggested sections bottom sheet with the newly selected outline. Give every outline-added H2
section a compact delete control that removes that entire section from the editor.

## Scope

This behavior applies to the active `toolbar-outline` prototype, where the outline selected in
Settings is rendered by `OutlinePopover`.

### In scope

- Treat selecting a different outline as an explicit request to start the editor canvas over.
- Remove every editor node, including text typed by the user and content inserted from the
  previous outline.
- Update the `outline` URL query parameter.
- Close Settings and open the Suggested sections bottom sheet.
- Show the new outline at the top of the sheet with no sections marked as already added.
- Leave the current editor content unchanged when the already-active outline is selected.
- Show a small quiet Codex trash icon at the far right of every outline-added H2 heading.
- Delete the selected H2 and every block after it up to, but not including, the next H2.
- Include user-authored text and nested headings inside the deleted range.
- Preserve lead content before the selected H2 and every later H2 section.
- Make a deleted outline section available to add again from the bottom sheet.

### Out of scope

- A confirmation dialog before clearing.
- Preserving or migrating text between outlines.
- Changing the outline data, section insertion behavior, toolbar insert menu, or pre-editor
  journey.
- Persisting editor content across reloads.
- Adding delete controls to manually authored headings that did not come from an outline.
- Adding a deletion confirmation dialog.

## Interaction contract

The successful transition is:

```text
old outline + populated editor + Settings open
  -> select a different outline
  -> update ?outline=<new-id>
  -> replace the editor document with an empty document and fresh history
  -> reset outline-sheet state
  -> close Settings
  -> open Suggested sections with the new outline
```

The route update happens before resetting the editor. `EditorView` treats both a rejected
`router.replace()` promise and a resolved Vue Router navigation failure as failure. In either
case, the existing editor content remains intact, Settings remains open, and the new outline
sheet does not open.

The reset creates a new empty TipTap `EditorState` using the existing schema and plugin list. This
keeps the editor instance and configured extensions, while reinitializing plugin state—including
Undo and Redo history. The canvas immediately becomes empty and shows its normal empty-state
placeholder. Undo cannot restore content from the previous outline.

Selecting the active outline closes Settings but does not change the route, clear the editor, or
reopen the sheet.

### Delete one section

The section deletion transition is:

```text
lead + section A + section B + section C
  -> activate section B trash control
  -> lead + section A + section C
  -> section B becomes addable again in Suggested sections
```

The deletion begins before the selected H2 node and ends immediately before the next H2 node, or
at the end of the document when there is no later H2. H3 and H4 headings, paragraphs, lists,
source prompts, citations, placeholders, and user-authored content inside that range are deleted
with the section.

Deletion is one editor transaction and remains available through native Undo. There is no
confirmation step. After dispatching the deletion and nearest valid text selection, the extension
calls `view.focus()` so keyboard focus returns to the editor at the deletion boundary.

The set of added H2 sections is derived from `outlineItemKey` attributes currently present in the
TipTap document. Undo restores the key and its added checkmark; Redo removes both again. A restored
section therefore cannot be added twice.

## Architecture

### `SettingsDialog.vue`

Settings remains a presentation component for choosing an outline. It emits `outline-selected`
with the chosen outline ID but does not close itself. It no longer owns the route update or the
completion state, because it cannot coordinate editor content and sheet state safely. EditorView
closes it after a successful transition or after selecting the already-active outline; it remains
open after navigation failure.

Interface:

```text
input: current outline from the route
output: outline-selected(outlineId)
```

### `EditorView.vue`

EditorView owns the transition because it already coordinates the router, shared TipTap editor,
Settings dialog, and outline bottom sheet.

On `outline-selected`, it:

1. resolves the active outline ID, defaulting to `person`;
2. closes Settings and returns without destructive work if the selected ID is already active;
3. awaits `router.replace()` with the new `outline` query while preserving other query values;
4. checks the resolved value with Vue Router's `isNavigationFailure()` and catches rejected
   navigation;
5. returns without changing editor or sheet state when navigation failed;
6. replaces the editor document with a new empty document and fresh plugin state;
7. resets the added-item set and requests the `outline` sheet view;
8. closes Settings and opens the outline popover.

This is the only path that clears content. Watching `route.query.outline` is intentionally avoided:
initial route loading, browser navigation, and unrelated query updates must not erase the editor.

EditorView also owns the controlled set of outline item keys currently inserted into the editor:

```text
OutlinePopover
  update:added-items(nextSet)
    -> EditorView stores the next controlled set

TextEditor
  outline-sections-changed(presentH2Keys)
    -> EditorView retains any added lead key
    -> EditorView replaces the H2 portion with presentH2Keys
    -> OutlinePopover receives the updated controlled set
```

`OutlineStructureList` additions propagate through `OutlinePopover`'s `addedItems` model to
EditorView. After every doc-changing editor transaction—including section insertion, deletion,
Undo, Redo, paste, or heading conversion—TextEditor scans top-level H2 nodes and emits the set of
present `outlineItemKey` values. The scan makes section checkmarks document-derived. Lead state
remains controlled through the existing model because the lead has no H2 and no trash control.

### `OutlinePopover.vue`

When its computed selected outline changes, the popover:

- selects the `outline` view;
- records that a scroll reset is pending;
- resets the attached body immediately when it exists.

When the popover next opens, it attaches the body observer, applies any pending scroll reset by
setting `scrollTop` to zero, removes the scrolled styling, and only then clears the pending flag.
This guarantees a dismissed, previously scrolled sheet reopens at the top for the new outline.
EditorView—not OutlinePopover—resets the added-item model after successful outline switching.

The added-item set is a required controlled `addedItems` model supplied by `EditorView`.
`OutlinePopover` passes both its value and `update:added-items` events between EditorView and
`OutlineStructureList`; it does not inspect the editor document or mutate the set independently.

### Fresh editor session

`EditorView` keys `TextEditor` by the active outline ID. A successful outline route change
therefore destroys the previous TipTap instance and mounts a fresh empty one, including fresh
plugin and Undo/Redo state.

This boundary is intentional. TipTap's Vue editor wrapper owns a debounced reactive
`EditorState` in addition to ProseMirror's view state. Replacing only `editor.view.state` makes
the DOM look empty but leaves later editor commands reading the old reactive document. A keyed
remount resets both layers through their public lifecycle and prevents the first insertion for
the new outline from restoring old content.

### `outlineWikitext.js`

Each non-lead outline item is rendered as an H2 carrying its stable outline item key:

```html
<h2 data-outline-item-key="city:history">History</h2>
```

The key identifies the matching bottom-sheet row after deletion. It is metadata, not visible
article content.

### `SectionHeading`

The editor uses a small extension of TipTap's Heading node that preserves
`data-outline-item-key` as the `outlineItemKey` document attribute. StarterKit's built-in Heading
node is disabled to avoid registering the node twice; all current H2-H4 behavior remains enabled
through `SectionHeading`.

### `SectionDeleteControls`

A focused TipTap extension owns the non-document UI and deletion transaction. Its ProseMirror
plugin adds one widget decoration at the end of every H2 with an `outlineItemKey`.

The widget:

- is non-editable and excluded from copied or serialized article content;
- is a native `<button type="button">`;
- renders the Codex `cdxIconTrash` glyph;
- has a compact visible icon and a 44 by 44 CSS-pixel tap target;
- has an accessible name of `Delete {heading text} section`;
- remains reachable with Tab and has a token-based visible focus indicator;
- activates through native click, Enter, or Space button behavior;
- prevents pointer down from moving the text selection before activation;
- is handled by the decoration's `stopEvent` so ProseMirror does not treat button interaction as
  document editing.

On activation, the extension finds the current H2 position in the document, scans top-level nodes
for the next H2, deletes the computed range in one transaction, restores a valid text selection,
and calls `view.focus()`. Added-state synchronization comes from the resulting document scan, not
an imperative deletion callback.

### `TextEditor.vue`

TextEditor registers `SectionHeading` and `SectionDeleteControls`. After initial editor creation
and every doc-changing transaction, it emits `outline-sections-changed` with a new `Set` containing
the stable keys of all top-level H2 sections currently in the document. It owns the
reference-matched visual styling for the heading row, native button, hover state, and visible
keyboard focus, but no outline state.

## Error and edge behavior

- If no editor instance is available after the route update, the route and sheet still move to the
  new outline; there is no content instance to clear.
- A resolved or rejected route failure leaves Settings open, preserves the old query and editor
  state, and does not open the new sheet.
- Unknown outline IDs are not introduced by this change; `OutlineSelector` emits only configured
  IDs.
- Existing query parameters such as `lang` and `variant` are preserved.
- The sheet always opens on Suggested sections, even if its previous view was Verified facts or
  References.
- H2 headings without an `outlineItemKey` do not receive a trash control.
- Removing the final section deletes through the end of the document and leaves a valid empty
  paragraph when TipTap requires one.
- Multiple sections with the same visible title remain distinguishable by stable outline item key.
- Native Undo and Redo of section deletion rescan the document and keep the matching bottom-sheet
  row synchronized.
- Outline switching resets editor history, so old-outline content cannot be restored under the
  new outline.
- The existing uncommitted `CdxToolbar.vue` work is outside this change and must remain untouched.

## Verification

Automated regression coverage will exercise the user-observable coordinator behavior:

- with editor content present and the sheet dismissed, selecting a different outline updates the
  route, creates a fresh empty editor state with empty history, and reopens the sheet on the
  outline view;
- selecting the active outline does not clear or reopen;
- changing the selected outline resets the popover's added-section state.
- resolved and rejected navigation failures preserve the editor, leave Settings open, and do not
  open the sheet;
- switching preserves unrelated query parameters;
- a previously scrolled and dismissed sheet opens the new outline at scroll position zero;
- outline H2 metadata survives parsing into the TipTap document;
- a section range ends at the next H2 and includes nested headings and user-authored blocks;
- deleting the last section removes through the document end;
- pointer, Enter, and Space activation delete the same range and restore DOM focus to the editor;
- deleting, undoing, and redoing synchronize the matching bottom-sheet row with the document;
- headings without outline metadata receive no trash control.

Because the repository currently has no test runner, add the smallest Vue-compatible test setup
needed for these focused regression tests. Run the focused tests first for the red-green cycle,
then run the complete test command, lint, production build, and `git diff --check`.

Manual acceptance path:

1. Open the active Visual editor with article guidance build.
2. Add one or more suggested sections and type additional text.
3. Close the sheet and open Settings.
4. Select a different article outline.
5. Confirm the editor is empty.
6. Confirm Settings is closed and the bottom sheet is open.
7. Confirm Suggested sections shows the newly selected outline from the top and no item has an
   added checkmark.
8. Add at least two sections and type extra text inside the first section.
9. Tap the first section's trash icon.
10. Confirm that section heading and all of its content are gone while the next section remains.
11. Reopen Suggested sections and confirm the deleted section can be added again.
