import { Extension } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { findBoundFields } from '../utils/scaffoldFields.js'

const fieldBindingKey = new PluginKey('fieldBinding')
const fieldBindingHistoryCloseKey = new PluginKey('fieldBindingHistoryClose')
const START_META = 'fieldBindingStart'
const COMMIT_META = 'commitFieldBinding'
const CLOSE_META = 'fieldBindingClose'
const HYDRATE_META = 'fieldBindingHydrate'
export const FIELD_BINDING_SYNC_META = 'fieldBindingSync'

let nextHistoryGroup = 0

function isAnswer(field) {
  const text = field.text.trim()
  return text !== '' && text !== field.placeholder
}

function findActiveField(doc, active) {
  return findBoundFields(doc).find(
    (field) =>
      field.key === active.key &&
      field.placeholder === active.placeholder &&
      field.from === active.from,
  )
}

function replaceField(tr, field, text) {
  tr.replaceWith(field.from, field.to, tr.doc.type.schema.text(text, field.marks))
}

function preserveBindingMark(tr, field) {
  const bindingMark = field.marks.find((mark) => mark.type.name === 'scaffoldBinding')
  if (!bindingMark) return

  const from = tr.mapping.map(field.from, -1)
  const to = tr.mapping.map(field.to, 1)
  if (from < to) tr.addMark(from, to, bindingMark)
}

function hydrateInsertedPrompts(state) {
  const fields = findBoundFields(state.doc)
  const byKey = new Map()

  for (const field of fields) {
    if (!byKey.has(field.key)) byKey.set(field.key, [])
    byKey.get(field.key).push(field)
  }

  const replacements = []
  for (const linkedFields of byKey.values()) {
    const answers = new Set(
      linkedFields.filter(isAnswer).map((field) => field.text.trim()),
    )
    if (answers.size !== 1) continue

    const [answer] = answers
    linkedFields
      .filter((field) => field.text.trim() === field.placeholder)
      .forEach((field) => replacements.push({ field, answer }))
  }

  if (!replacements.length) return null

  const tr = state.tr
  replacements
    .sort((a, b) => b.field.from - a.field.from)
    .forEach(({ field, answer }) => replaceField(tr, field, answer))
  tr.setMeta(HYDRATE_META, true)
  return tr
}

/** Synchronize only explicitly marked semantic scaffold fields. */
export const FieldBinding = Extension.create({
  name: 'fieldBinding',

  addCommands() {
    return {
      commitFieldBinding:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) dispatch(tr.setMeta(COMMIT_META, true))
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: fieldBindingKey,

        filterTransaction(tr, state) {
          if (
            tr.getMeta(FIELD_BINDING_SYNC_META) ||
            tr.getMeta(HYDRATE_META) ||
            tr.getMeta(CLOSE_META)
          ) {
            return true
          }

          const pluginState = fieldBindingKey.getState(state)
          if (pluginState.active && tr.docChanged) {
            const activeField = findBoundFields(state.doc).find(
              (field) =>
                field.key === pluginState.active.key &&
                field.placeholder === pluginState.active.placeholder &&
                field.from === pluginState.active.from,
            )
            if (activeField) preserveBindingMark(tr, activeField)
            tr.setMeta('composition', pluginState.active.historyGroup)
            return true
          }

          if (!tr.docChanged || state.selection.empty) return true

          const selectedField = findBoundFields(state.doc).find(
            (field) =>
              field.from === state.selection.from && field.to === state.selection.to,
          )
          if (!selectedField) return true

          preserveBindingMark(tr, selectedField)
          const historyGroup = ++nextHistoryGroup
          closeHistory(tr)
          tr.setMeta('composition', historyGroup)
          tr.setMeta(START_META, {
            key: selectedField.key,
            placeholder: selectedField.placeholder,
            historyGroup,
          })
          return true
        },

        state: {
          init: () => ({ active: null }),

          apply(tr, value, _oldState, newState) {
            if (tr.getMeta(CLOSE_META) || tr.getMeta(FIELD_BINDING_SYNC_META)) {
              return { active: null }
            }

            let active = value.active
            const started = tr.getMeta(START_META)
            if (started) {
              const field = findBoundFields(newState.doc).find(
                (candidate) =>
                  candidate.key === started.key &&
                  candidate.placeholder === started.placeholder &&
                  newState.selection.from >= candidate.from &&
                  newState.selection.to <= candidate.to,
              )
              active = field ? { ...started, from: field.from, to: field.to } : null
            } else if (active) {
              active = {
                ...active,
                from: tr.mapping.map(active.from, -1),
                to: tr.mapping.map(active.to, 1),
              }
              const field = findActiveField(newState.doc, active)
              if (field) active = { ...active, from: field.from, to: field.to }
            }

            return { active }
          },
        },

        appendTransaction(transactions, _oldState, newState) {
          if (transactions.some((tr) => tr.getMeta(CLOSE_META))) return null

          const pluginState = fieldBindingKey.getState(newState)
          const active = pluginState.active
          if (!active) {
            if (
              transactions.some(
                (tr) => tr.docChanged && tr.getMeta('outlineInsertion'),
              ) &&
              !transactions.some((tr) => tr.getMeta(HYDRATE_META))
            ) {
              return hydrateInsertedPrompts(newState)
            }
            return null
          }

          const explicitCommit = transactions.some((tr) => tr.getMeta(COMMIT_META))
          const selectionInside =
            newState.selection.from >= active.from && newState.selection.to <= active.to
          if (!explicitCommit && selectionInside) return null

          const source = findBoundFields(newState.doc).find(
            (field) =>
              field.key === active.key &&
              field.placeholder === active.placeholder &&
              field.from === active.from,
          )

          if (!source || !isAnswer(source)) {
            return closeHistory(newState.tr.setMeta(CLOSE_META, true))
          }

          const answer = source.text.trim()
          const targets = findBoundFields(newState.doc).filter(
            (field) =>
              field.key === active.key &&
              (field.from !== source.from || field.text !== answer),
          )
          const tr = newState.tr
          targets.reverse().forEach((field) => replaceField(tr, field, answer))
          tr.setMeta(FIELD_BINDING_SYNC_META, true)
          tr.setMeta('composition', active.historyGroup)
          return tr
        },
      }),
      new Plugin({
        key: fieldBindingHistoryCloseKey,

        appendTransaction(transactions, _oldState, newState) {
          if (
            transactions.some((tr) => tr.getMeta(FIELD_BINDING_SYNC_META)) &&
            !transactions.some((tr) => tr.getMeta(CLOSE_META))
          ) {
            return closeHistory(newState.tr.setMeta(CLOSE_META, true))
          }
          return null
        },
      }),
    ]
  },
})
