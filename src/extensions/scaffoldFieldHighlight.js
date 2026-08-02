import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { findScaffoldFields } from '../utils/scaffoldFields'

export const scaffoldFieldHighlightKey = new PluginKey('scaffoldFieldHighlight')

/**
 * Fields carry a quiet tint for what they are asking for. A check does not
 * add to it: marking every field at once shouts, where the check's own card
 * and its Review action already say which ones and where.
 */
function decorate(doc) {
  const decorations = findScaffoldFields(doc).map((field) =>
    Decoration.inline(field.from, field.to, {
      class: `scaffold-field scaffold-field--${field.kind}`,
      // Prompts are the community's text, not the editor's spelling: without
      // this, the browser underlines every bracketed word in red the moment
      // the caret enters, and the scaffold reads as a page of typos.
      spellcheck: 'false',
    }),
  )

  return DecorationSet.create(doc, decorations)
}

/**
 * Tints the scaffold fields an outline leaves behind, so what is waiting to
 * be filled in reads differently from what has been written.
 */
export const ScaffoldFieldHighlight = Extension.create({
  name: 'scaffoldFieldHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: scaffoldFieldHighlightKey,

        state: {
          init: (_, state) => decorate(state.doc),

          apply(tr, value) {
            return tr.docChanged ? decorate(tr.doc) : value.map(tr.mapping, tr.doc)
          },
        },

        props: {
          decorations(state) {
            return scaffoldFieldHighlightKey.getState(state)
          },
        },
      }),
    ]
  },
})
