import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { findScaffoldFields } from '../utils/scaffoldFields'

const fieldBindingKey = new PluginKey('fieldBinding')
const FIELD_PATTERN = /^\[[^[\]]+\]$/

/**
 * A field answered once is answered everywhere it appears.
 *
 * Outlines repeat the same field — a person's name opens most of their
 * sections — so filling one and retyping the rest is work the article can do
 * for the editor. The answer travels when they move on from the field, so it
 * arrives whole rather than a letter at a time.
 */
export const FieldBinding = Extension.create({
  name: 'fieldBinding',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: fieldBindingKey,

        state: {
          init: () => null,

          apply(tr, filling, oldState, newState) {
            if (filling) {
              return {
                label: filling.label,
                from: tr.mapping.map(filling.from),
                to: tr.mapping.map(filling.to, 1),
              }
            }

            if (!tr.docChanged || oldState.selection.empty) return null

            // Typing over a whole field is the editor answering it.
            const replaced = oldState.doc.textBetween(
              oldState.selection.from,
              oldState.selection.to,
            )
            if (!FIELD_PATTERN.test(replaced)) return null

            const from = tr.mapping.map(oldState.selection.from)
            return { label: replaced, from, to: newState.selection.from }
          },
        },

        appendTransaction(transactions, oldState, newState) {
          const filling = fieldBindingKey.getState(oldState)
          if (!filling) return null

          // Still inside the field being answered: nothing to share yet.
          const cursor = newState.selection.from
          if (cursor >= filling.from && cursor <= filling.to + 1) return null

          const answer = newState.doc.textBetween(filling.from, filling.to).trim()
          if (!answer || FIELD_PATTERN.test(answer)) return null

          const matches = findScaffoldFields(newState.doc).filter(
            (field) => field.label === filling.label,
          )
          if (!matches.length) return null

          const tr = newState.tr
          // Replace from the end so the earlier positions stay valid.
          matches.reverse().forEach((field) => {
            tr.insertText(answer, field.from, field.to)
          })

          return tr.setMeta('addToHistory', true)
        },
      }),
    ]
  },
})
