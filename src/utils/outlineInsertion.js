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
 * Append an outline item and leave the caret at its first scaffold text.
 * Heading-only items receive an empty paragraph so the caret remains editable.
 */
export function insertOutlineContent(editor, content) {
  return editor
    .chain()
    .focus('end')
    .insertContent(addCursorMarker(content))
    .command(({ tr }) => {
      const marker = findCursorMarker(tr.doc)

      if (!marker) return true

      tr.delete(marker.from, marker.to)
      tr.setSelection(TextSelection.create(tr.doc, marker.from))
      return true
    })
    .run()
}
