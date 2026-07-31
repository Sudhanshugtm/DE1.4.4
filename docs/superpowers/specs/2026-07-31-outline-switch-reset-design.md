# Outline switch editor reset

## Goal

When an editor deliberately selects a different article outline from Settings, replace the
active outline, remove all content from the VisualEditor canvas, and immediately reopen the
Suggested sections bottom sheet with the newly selected outline.

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

### Out of scope

- A confirmation dialog before clearing.
- Preserving or migrating text between outlines.
- Changing the outline data, section insertion behavior, toolbar insert menu, or pre-editor
  journey.
- Persisting editor content across reloads.

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

### `OutlinePopover.vue`

When its computed selected outline changes, the popover:

- selects the `outline` view;
- resets `addedOutlineItems` to a new empty set;
- scrolls the sheet body to the top.

This prevents stale added-state markers when the user later switches back to a previously used
outline.

## Error and edge behavior

- If no editor instance is available after the route update, the route and sheet still move to the
  new outline; there is no content instance to clear.
- Unknown outline IDs are not introduced by this change; `OutlineSelector` emits only configured
  IDs.
- Existing query parameters such as `lang` and `variant` are preserved.
- The sheet always opens on Suggested sections, even if its previous view was Verified facts or
  References.
- The existing uncommitted `CdxToolbar.vue` work is outside this change and must remain untouched.

## Verification

Automated regression coverage will exercise the user-observable coordinator behavior:

- with editor content present and the sheet dismissed, selecting a different outline updates the
  route, invokes the editor clear command, and reopens the sheet on the outline view;
- selecting the active outline does not clear or reopen;
- changing the selected outline resets the popover's added-section state.

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

