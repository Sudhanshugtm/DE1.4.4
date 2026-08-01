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

function findSectionRangeAt(doc, from, key) {
  let foundHeading = false
  let foundEnd = false
  let to = doc.content.size

  doc.forEach((node, offset) => {
    if (foundEnd) return

    if (!foundHeading) {
      if (offset === from && isTopLevelH2(node) && node.attrs.outlineItemKey === key) {
        foundHeading = true
      }
      return
    }

    if (isTopLevelH2(node)) {
      to = offset
      foundEnd = true
    }
  })

  return foundHeading ? { from, to } : null
}

function findWidgetSectionRange(doc, getPos, key, headingText) {
  let widgetPosition

  try {
    widgetPosition = getPos()
  } catch {
    return null
  }

  if (typeof widgetPosition !== 'number') return null

  const $widgetPosition = doc.resolve(widgetPosition)
  const heading = $widgetPosition.parent
  if (
    $widgetPosition.depth !== 1 ||
    !isTopLevelH2(heading) ||
    heading.attrs.outlineItemKey !== key ||
    heading.textContent.trim() !== headingText
  ) {
    return null
  }

  return findSectionRangeAt(doc, $widgetPosition.before(), key)
}

function deleteSection(view, getPos, key, headingText) {
  const range = findWidgetSectionRange(view.state.doc, getPos, key, headingText)
  if (!range) return

  const transaction = closeHistory(view.state.tr.delete(range.from, range.to))
  const selectionPosition = Math.min(range.from, transaction.doc.content.size)
  transaction.setSelection(TextSelection.near(transaction.doc.resolve(selectionPosition)))
  transaction.scrollIntoView()
  view.dispatch(transaction)
  // Deleting tidies the article, it does not start writing: the editor is
  // not focused, so no keyboard comes up over what remains.
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

function preserveEditorSelection(event) {
  if (event.cancelable) event.preventDefault()
}

function createDeleteButton(view, getPos, key, headingText) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'section-delete-control'
  button.contentEditable = 'false'
  button.setAttribute('contenteditable', 'false')
  button.setAttribute('aria-label', `Delete ${headingText || 'untitled'} section`)
  button.append(createTrashIcon())
  button.addEventListener('pointerdown', preserveEditorSelection)
  button.addEventListener('mousedown', preserveEditorSelection)
  button.addEventListener('click', () => deleteSection(view, getPos, key, headingText))

  return button
}

function createSectionDeleteDecorations(doc) {
  const decorations = []
  const keyOccurrences = new Map()

  doc.forEach((node, offset) => {
    if (!isTopLevelH2(node) || !node.attrs.outlineItemKey) return

    const key = node.attrs.outlineItemKey
    const headingText = node.textContent.trim()
    const keyOccurrence = keyOccurrences.get(key) ?? 0
    keyOccurrences.set(key, keyOccurrence + 1)
    decorations.push(
      Decoration.widget(
        offset + node.nodeSize - 1,
        (view, getPos) => createDeleteButton(view, getPos, key, headingText),
        {
          key: JSON.stringify(['section-delete-control', key, headingText, keyOccurrence]),
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
