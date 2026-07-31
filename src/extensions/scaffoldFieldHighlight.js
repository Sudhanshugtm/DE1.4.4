import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { findScaffoldFields } from '../utils/scaffoldFields'

export const scaffoldFieldHighlightKey = new PluginKey('scaffoldFieldHighlight')

/**
 * Fields carry a quiet tint for what they are asking for, and a louder one
 * once a check has asked for them to be resolved.
 */
function decorate(doc, flagged) {
  const decorations = findScaffoldFields(doc).map((field) =>
    Decoration.inline(field.from, field.to, {
      class: `scaffold-field scaffold-field--${field.kind}${flagged ? ' scaffold-field--flagged' : ''}`,
    }),
  )

  return DecorationSet.create(doc, decorations)
}

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
          init: (_, state) => ({ active: false, decorations: decorate(state.doc, false) }),

          apply(tr, value) {
            const toggled = tr.getMeta(scaffoldFieldHighlightKey)
            const active = typeof toggled === 'boolean' ? toggled : value.active

            if (!tr.docChanged && typeof toggled !== 'boolean') {
              return { active, decorations: value.decorations.map(tr.mapping, tr.doc) }
            }

            return { active, decorations: decorate(tr.doc, active) }
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
