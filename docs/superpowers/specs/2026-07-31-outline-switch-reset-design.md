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
  -> close Settings
  -> update ?outline=<new-id>
  -> clear the entire editor
  -> reset outline-sheet state
  -> open Suggested sections with the new outline
```

The route update happens before clearing the editor. If route replacement fails, the existing
editor content remains intact and the new outline sheet does not open.

Clearing is one editor transaction, so the canvas immediately becomes empty and shows its normal
empty-state placeholder. The existing editor history is not explicitly destroyed; native Undo
may restore the cleared content.

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
confirmation step. After deletion, focus returns to the nearest valid editor position at the
deletion boundary.

## Architecture

### `SettingsDialog.vue`

Settings remains a presentation component for choosing an outline. It closes after a selection
and emits `outline-selected` with the chosen outline ID. It no longer owns the route update,
because it cannot coordinate editor content and sheet state safely.

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
2. returns without destructive work if the selected ID is already active;
3. awaits `router.replace()` with the new `outline` query while preserving other query values;
4. calls the TipTap `clearContent` command;
5. sets the requested sheet view to `outline`;
6. opens the outline popover.

This is the only path that clears content. Watching `route.query.outline` is intentionally avoided:
initial route loading, browser navigation, and unrelated query updates must not erase the editor.

EditorView also owns the set of outline item keys currently inserted into the editor. It passes
that set to `OutlinePopover` and removes a key when `TextEditor` emits `section-deleted`. Keeping
this state in the coordinator lets the sheet change a deleted section from added back to addable.

### `OutlinePopover.vue`

When its computed selected outline changes, the popover:

- selects the `outline` view;
- resets `addedOutlineItems` to a new empty set;
- scrolls the sheet body to the top.

This prevents stale added-state markers when the user later switches back to a previously used
outline.

The added-item set becomes a controlled model supplied by `EditorView`. `OutlinePopover` continues
to pass it to `OutlineStructureList`; it does not inspect the editor document.

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
- renders the Codex `cdxIconTrash` glyph;
- has a compact visible icon and a 44 by 44 CSS-pixel tap target;
- has an accessible name of `Delete {heading text} section`;
- stops its pointer event from moving the text selection before deletion.

On activation, the extension finds the current H2 position in the document, scans top-level nodes
for the next H2, deletes the computed range in one transaction, restores a valid text selection,
and calls its configured `onSectionDeleted(outlineItemKey)` callback.

### `TextEditor.vue`

TextEditor registers `SectionHeading` and `SectionDeleteControls`. It converts the extension
callback into a `section-deleted` component event carrying the stable outline item key. It owns
the reference-matched visual styling for the heading row and trash control, but no outline state.

## Error and edge behavior

- If no editor instance is available after the route update, the route and sheet still move to the
  new outline; there is no content instance to clear.
- Unknown outline IDs are not introduced by this change; `OutlineSelector` emits only configured
  IDs.
- Existing query parameters such as `lang` and `variant` are preserved.
- The sheet always opens on Suggested sections, even if its previous view was Verified facts or
  References.
- H2 headings without an `outlineItemKey` do not receive a trash control.
- Removing the final section deletes through the end of the document and leaves a valid empty
  paragraph when TipTap requires one.
- Multiple sections with the same visible title remain distinguishable by stable outline item key.
- Native Undo may restore the editor content after the bottom-sheet row has become addable. The
  prototype does not synchronize added-state through history transactions; selecting Add after an
  Undo remains guarded only by the current added-state set.
- The existing uncommitted `CdxToolbar.vue` work is outside this change and must remain untouched.

## Verification

Automated regression coverage will exercise the user-observable coordinator behavior:

- with editor content present and the sheet dismissed, selecting a different outline updates the
  route, invokes the editor clear command, and reopens the sheet on the outline view;
- selecting the active outline does not clear or reopen;
- changing the selected outline resets the popover's added-section state.
- outline H2 metadata survives parsing into the TipTap document;
- a section range ends at the next H2 and includes nested headings and user-authored blocks;
- deleting the last section removes through the document end;
- activating the widget emits the deleted outline item key and changes its bottom-sheet row back
  to addable;
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
