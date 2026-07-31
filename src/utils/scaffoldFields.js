// ABOUTME: Finds the scaffold fields an outline leaves behind in the article.
// ABOUTME: These are what the Complete section check asks the editor to resolve.

const FIELD_PATTERN = /\[[^[\]]+\]/g

/**
 * Every unfilled scaffold field left in the document, in reading order.
 *
 * @param {Object} doc ProseMirror document
 * @return {{ label: string, from: number, to: number }[]}
 */
export function findScaffoldFields(doc) {
  const fields = []

  doc.descendants((node, nodePosition) => {
    if (!node.isText || !node.text) return true

    for (const match of node.text.matchAll(FIELD_PATTERN)) {
      fields.push({
        label: match[0],
        from: nodePosition + match.index,
        to: nodePosition + match.index + match[0].length,
      })
    }

    return true
  })

  return fields
}
