import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { findScaffoldFields } from '../utils/scaffoldFields'

export const scaffoldFieldHighlightKey = new PluginKey('scaffoldFieldHighlight')

/**
 * Marks the scaffold fields a check is asking about, so the article shows
 * what the card is talking about.
 */
export const ScaffoldFieldHighlight = Extension.create({
  name: 'scaffoldFieldHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: scaffoldFieldHighlightKey,

        state: {
          init: () => ({ active: false, decorations: DecorationSet.empty }),

          apply(tr, value) {
            const toggled = tr.getMeta(scaffoldFieldHighlightKey)
            const active = typeof toggled === 'boolean' ? toggled : value.active

            if (!active) return { active, decorations: DecorationSet.empty }

            if (!tr.docChanged && typeof toggled !== 'boolean') {
              return { active, decorations: value.decorations.map(tr.mapping, tr.doc) }
            }

            const decorations = findScaffoldFields(tr.doc).map((field) =>
              Decoration.inline(field.from, field.to, { class: 'scaffold-field-highlight' }),
            )

            return { active, decorations: DecorationSet.create(tr.doc, decorations) }
          },
        },

        props: {
          decorations(state) {
            return scaffoldFieldHighlightKey.getState(state)?.decorations
          },
        },
      }),
    ]
  },
})
