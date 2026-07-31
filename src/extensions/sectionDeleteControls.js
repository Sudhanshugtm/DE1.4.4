import { Extension } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { cdxIconTrash } from '@wikimedia/codex-icons'

function isTopLevelH2(node) {
  return node.type.name === 'heading' && node.attrs.level === 2
}

export function getOutlineSectionKeys(doc) {
  const keys = new Set()

  doc.forEach((node) => {
    if (isTopLevelH2(node) && node.attrs.outlineItemKey) {
      keys.add(node.attrs.outlineItemKey)
    }
  })

  return keys
}

export function findSectionRange(doc, key) {
  let from = null
  let to = null
  let foundEnd = false

  doc.forEach((node, offset) => {
    if (foundEnd || !isTopLevelH2(node)) return

    if (from === null) {
      if (node.attrs.outlineItemKey === key) from = offset
      return
    }

    to = offset
    foundEnd = true
  })

  if (from === null) return null

  return { from, to: to ?? doc.content.size }
}

function deleteSection(view, key) {
  const range = findSectionRange(view.state.doc, key)
  if (!range) return

  const transaction = closeHistory(view.state.tr.delete(range.from, range.to))
  const selectionPosition = Math.min(range.from, transaction.doc.content.size)
  transaction.setSelection(TextSelection.near(transaction.doc.resolve(selectionPosition)))
  transaction.scrollIntoView()
  view.dispatch(transaction)
  view.focus()
}

function createTrashIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '20')
  svg.setAttribute('height', '20')
  svg.setAttribute('viewBox', '0 0 20 20')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.innerHTML = cdxIconTrash

  return svg
}

function createDeleteButton(view, key, headingText) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'section-delete-control'
  button.contentEditable = 'false'
  button.setAttribute('contenteditable', 'false')
  button.setAttribute('aria-label', `Delete ${headingText} section`)
  button.append(createTrashIcon())
  button.addEventListener('mousedown', (event) => event.preventDefault())
  button.addEventListener('click', () => deleteSection(view, key))

  return button
}

function createSectionDeleteDecorations(doc) {
  const decorations = []

  doc.forEach((node, offset) => {
    if (!isTopLevelH2(node) || !node.attrs.outlineItemKey) return

    const key = node.attrs.outlineItemKey
    const headingText = node.textContent.trim()
    decorations.push(
      Decoration.widget(
        offset + node.nodeSize - 1,
        (view) => createDeleteButton(view, key, headingText),
        {
          key: `section-delete-control:${key}:${headingText}`,
          ignoreSelection: true,
          stopEvent: (event) => event.target.closest?.('.section-delete-control') !== null,
        },
      ),
    )
  })

  return DecorationSet.create(doc, decorations)
}

const sectionDeleteControlsPluginKey = new PluginKey('sectionDeleteControls')

const SectionDeleteControls = Extension.create({
  name: 'sectionDeleteControls',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: sectionDeleteControlsPluginKey,
        props: {
          decorations: (state) => createSectionDeleteDecorations(state.doc),
        },
      }),
    ]
  },
})

export default SectionDeleteControls
