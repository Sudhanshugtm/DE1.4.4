# Settings-only Verified Facts Demo Launcher

## Goal

Make the reviewed Verified facts prototype discoverable from the editor's bottom-right Settings button without presenting it as part of the normal prototype flow.

The existing Article outline selector remains unchanged and continues to expose every outline. A separate Settings section launches one curated Portugal/Country demo. Inside that demo, Verified facts remains where it already lives: under the toolbar `+` menu.

## User experience

Settings gains a second section below **Article outline**:

- Label: **Prototype demos**
- Description: **Explore reviewed Wikidata facts using Portugal.**
- Real Codex button: **Open Verified facts demo**

Selecting the button intentionally starts a fresh Portugal article session at:

`/editor?lang=en&variant=toolbar-outline&outline=country&title=Portugal&articleguidance=1&sourceOrigin=redlink&verifiedfacts=1`

The route flag is private prototype state, not a product setting. The demo launcher is the only visible way to add it. A flagged link remains directly shareable for review.

After the demo opens, the toolbar `+` menu contains **Verified facts** because the route is flagged and Portugal has reviewed facts. Activating it opens the existing read-only list of four reviewed Portugal facts. The launcher does not open that list automatically or insert anything into the draft.

An ordinary route never exposes the Verified facts toolbar entry, even when reviewed facts exist. In particular, the current unflagged Portugal and Buddhism links remain unchanged.

## Component boundaries

### `SettingsDialog.vue`

Owns only the visible Settings presentation. It preserves the existing Article outline group, renders the new Prototype demos group, and emits `open-verified-facts-demo` when the real button is activated. It does not construct routes or reset editor state.

### `EditorView.vue`

Coordinates the route and editor session:

- It considers the demo enabled only when `verifiedfacts=1` and the current route resolves to at least one reviewed fact.
- It passes that result to the toolbar as the Verified facts visibility Boolean.
- It handles `open-verified-facts-demo` by navigating to the exact curated Portugal query.
- It resets the editor only after successful navigation, using a keyed `TextEditor` remount so TipTap content, selection, and undo history cannot leak into the demo.
- It resets the surrounding article-session state already cleared during an intentional outline switch: added outline progress, edit checks, authored-state, citation numbering, and contextual tips.
- It closes Settings after success. Failed or rejected navigation preserves both the current draft and the open Settings dialog.

If the exact curated demo route is already active, selecting the launcher only closes Settings; it does not erase the current demo draft.

The existing outline-selection handler and its complete list of outlines remain available. Switching outline continues to use the current behavior. If a flagged route no longer resolves to reviewed facts after a switch, the toolbar entry fails closed.

### Existing Verified facts components

`CdxToolbar`, `OutlinePopover`, `VerifiedFactsReferenceList`, and the reviewed fixture remain unchanged. The Portugal facts stay static, reviewed, read-only, and free of runtime network requests.

## Navigation and failure handling

The launcher uses client-side navigation so Back can return to the previous route. Route state is changed before editor state is reset. A navigation exception or Vue Router failure stops the operation without closing Settings or clearing the draft.

The canonical query is intentionally explicit rather than inheriting unrelated parameters from the current article. This gives every reviewer the same English, toolbar-outline, Country/Portugal experience.

## Accessibility and responsive behavior

The launcher is a native Codex button rather than a clickable container, so it is reachable and activatable by keyboard and assistive technology. The section label and description explain that it opens a prototype demo and name Portugal before activation.

The new group follows the existing dialog spacing and Codex design tokens. It must fit the current Settings dialog without horizontal overflow at mobile widths. The outline selector remains first and unchanged.

## Tests and acceptance criteria

Automated tests must prove:

1. Settings still renders the Article outline selector and emits the existing outline selection event.
2. Settings renders the Prototype demos copy and emits `open-verified-facts-demo` from the button.
3. An unflagged Portugal route has four reviewed facts internally but does not expose Verified facts in the toolbar.
4. The flagged Portugal route exposes Verified facts and passes the same four facts to the existing sheet.
5. Launching from another article navigates to the exact canonical query, closes Settings, and remounts a fresh editor session only after success.
6. Selecting the launcher on the exact demo route closes Settings without clearing the current session.
7. Failed or rejected navigation leaves the current route, draft session, and Settings state unchanged.
8. Unsupported or mismatched flagged routes fail closed when no reviewed facts resolve.

Fresh verification before publishing must include the focused tests, full test suite, lint, production build, and an in-app-browser walkthrough. The walkthrough must confirm the normal route hides the entry, the Settings outline list still works, the launcher opens the canonical Portugal demo, `+` reveals Verified facts only there, all four facts appear, the layout works at desktop and mobile widths, and no application errors appear.

## Out of scope

- Fetching live Wikidata data
- Adding reviewed facts for more topics
- Turning Verified facts into a general preference or feature toggle
- Changing the existing outline list or Settings entry point
- Publishing claims about coverage beyond the reviewed Portugal example
