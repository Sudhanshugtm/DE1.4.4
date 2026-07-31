// ABOUTME: Finds the scaffold fields an outline leaves behind in the article.
// ABOUTME: These are what the Complete section check asks the editor to resolve.

const FIELD_PATTERN = /\[[^[\]]+\]/g
const HAS_FIELD = /\[[^[\]]+\]/

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

// A full stop only ends a sentence when a new one starts after it. Without
// this, "e.g., won the [Award Name]" reads as two sentences and deleting
// leaves a stray "g." behind.
const SENTENCE_START = /^[A-Z[]/
// A source prompt belongs to the sentence it was asked of, so it leaves with
// it — along with the spacing that separated them.
const TRAILING_SOURCE = /^(\s+|Source)/

/**
 * The sentences still carrying an unfilled field, in reading order.
 *
 * Removing a field on its own leaves the sentence it was holding up — "was
 * born on  in ." — so a sentence that cannot be completed goes whole.
 *
 * @param {Object} doc ProseMirror document
 * @return {{ from: number, to: number }[]}
 */
export function findIncompleteSentences(doc) {
  const ranges = []

  doc.descendants((node, nodePosition) => {
    if (!node.isTextblock) return true

    // Flatten the block so a sentence can be read across source prompts and
    // other marks, keeping each character's position in the document.
    let text = ''
    const positions = []
    node.forEach((child, childOffset) => {
      if (!child.isText) return
      for (let index = 0; index < child.text.length; index++) {
        text += child.text[index]
        positions.push(nodePosition + 1 + childOffset + index)
      }
    })

    const take = (start, end) => {
      if (end > start && HAS_FIELD.test(text.slice(start, end))) {
        ranges.push({ from: positions[start], to: positions[end - 1] + 1 })
      }
    }

    let sentenceStart = 0
    let index = 0
    while (index < text.length) {
      if (!'.!?'.includes(text[index])) {
        index++
        continue
      }

      // Whatever trails the stop and belongs to this sentence — its spacing,
      // and any source prompt asked of it — leaves with it.
      let end = index + 1
      for (;;) {
        const trailing = text.slice(end).match(TRAILING_SOURCE)
        if (!trailing) break
        end += trailing[0].length
      }

      const rest = text.slice(end)
      if (rest !== '' && !SENTENCE_START.test(rest)) {
        index++
        continue
      }

      take(sentenceStart, end)
      sentenceStart = end
      index = end
    }

    // A last sentence that never got its full stop.
    take(sentenceStart, text.length)

    return false
  })

  return ranges
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
