// ABOUTME: Finds the scaffold fields an outline leaves behind in the article.
// ABOUTME: These are what the Complete section check asks the editor to resolve.

const FIELD_PATTERN = /\[[^[\]]+\]/g

/**
 * What a field is asking for.
 *
 * Some fields want a single value the editor can pick or recall — a date, a
 * place, one of a few options. Others want them to write. Telling the two
 * apart lets the article hint at the difference before a field is touched.
 *
 * @param {string} label Field text, brackets included
 * @return {'pick'|'write'}
 */
export function classifyField(label) {
  const inner = label.replace(/^\[|\]$/g, '').trim()

  // A choice between options, or a pronoun set.
  if (inner.includes('/')) return 'pick'

  // Anything phrased as an instruction is asking for writing.
  if (/^(description|brief|one sentence|any |key |list |name the)/i.test(inner)) return 'write'

  return inner.split(/\s+/).length <= 3 ? 'pick' : 'write'
}

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
        kind: classifyField(match[0]),
        from: nodePosition + match.index,
        to: nodePosition + match.index + match[0].length,
      })
    }

    return true
  })

  return fields
}
