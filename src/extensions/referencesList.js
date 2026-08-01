// ABOUTME: The list that citations write under the References heading.
// ABOUTME: An atom node: its entries come from citing, never from typing.

import { Node } from '@tiptap/core'

/**
 * What a citation shows in the list: its domain when it is a link, or the
 * text as given (an ISBN, a DOI) when it is not.
 */
export function referenceLabel(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

/**
 * The reference list body. It renders whatever has been cited so far and
 * cannot be typed into: on a wiki the list exists because citations exist,
 * so here it is written only by them.
 */
export const ReferencesList = Node.create({
  name: 'referencesList',

  group: 'block',
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      entries: {
        default: [],
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute('data-entries') || '[]')
          } catch {
            return []
          }
        },
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'ol[data-references-list]' }]
  },

  renderHTML({ node }) {
    return [
      'ol',
      {
        'data-references-list': '',
        'data-entries': JSON.stringify(node.attrs.entries),
        class: 'references-list',
        contenteditable: 'false',
      },
      ...node.attrs.entries.map((entry) => [
        'li',
        {},
        ['span', { class: 'references-list__source' }, referenceLabel(entry.url)],
      ]),
    ]
  },
})

/**
 * Where the reference list sits in the document, if it exists.
 *
 * @param {Object} doc ProseMirror document
 * @return {number|null}
 */
export function findReferencesList(doc) {
  let position = null

  doc.descendants((node, offset) => {
    if (position !== null) return false
    if (node.type.name === 'referencesList') {
      position = offset
      return false
    }
    return true
  })

  return position
}
