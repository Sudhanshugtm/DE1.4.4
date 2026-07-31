import { TextSelection } from '@tiptap/pm/state'

const CURSOR_MARKER = '\uE000OUTLINE_CURSOR\uE001'

function addCursorMarker(content) {
  const headingEnd = content.startsWith('<h2>') ? content.indexOf('</h2>') + '</h2>'.length : 0
  const body = content.slice(headingEnd)
  const textContainer = body.match(/<(?:p|li)(?:\s[^>]*)?>/i)

  if (!textContainer) return `${content}<p>${CURSOR_MARKER}</p>`

  const markerPosition = headingEnd + textContainer.index + textContainer[0].length
  return `${content.slice(0, markerPosition)}${CURSOR_MARKER}${content.slice(markerPosition)}`
}

function findCursorMarker(doc) {
  let range = null

  doc.descendants((node, nodePosition) => {
    if (range || !node.isText) return !range

    const markerOffset = node.text.indexOf(CURSOR_MARKER)
    if (markerOffset === -1) return true

    const from = nodePosition + markerOffset
    range = { from, to: from + CURSOR_MARKER.length }
    return false
  })

  return range
}

/**
 * Where the references section begins, if the article already has one.
 * Sections added afterwards belong above it, since references close an article.
 */
function findReferencesStart(doc) {
  let position = null

  doc.forEach((node, offset) => {
    if (position !== null) return
    const key = node.attrs?.outlineItemKey
    if (node.type.name === 'heading' && typeof key === 'string' && key.endsWith(':references')) {
      position = offset
    }
  })

  return position
}

/**
 * Add an outline item and leave the caret at its first scaffold text.
 * Heading-only items receive an empty paragraph so the caret remains editable.
 */
export function insertOutlineContent(editor, content, { keepAboveReferences = true } = {}) {
  const referencesStart = keepAboveReferences ? findReferencesStart(editor.state.doc) : null

  return editor
    .chain()
    .focus()
    .command(({ commands }) =>
      referencesStart === null
        ? commands.focus('end')
        : commands.setTextSelection(referencesStart),
    )
    .insertContentAt(
      referencesStart === null ? editor.state.doc.content.size : referencesStart,
      addCursorMarker(content),
    )
    .command(({ tr }) => {
      // Mark this as the outline arriving, so it is not mistaken for the
      // editor having written something.
      tr.setMeta('outlineInsertion', true)

      const marker = findCursorMarker(tr.doc)

      if (!marker) return true

      tr.delete(marker.from, marker.to)
      tr.setSelection(TextSelection.create(tr.doc, marker.from))
      return true
    })
    .run()
}
