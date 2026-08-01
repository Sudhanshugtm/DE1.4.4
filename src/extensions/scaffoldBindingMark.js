import { Mark } from '@tiptap/core'

/** Preserve semantic scaffold identity after a prompt becomes authored text. */
export const ScaffoldBindingMark = Mark.create({
  name: 'scaffoldBinding',
  inclusive: false,
  keepOnSplit: false,

  addAttributes() {
    return {
      binding: {
        parseHTML: (element) => element.getAttribute('data-scaffold-binding'),
      },
      placeholder: {
        parseHTML: (element) => element.getAttribute('data-scaffold-placeholder'),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-scaffold-binding][data-scaffold-placeholder]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        'data-scaffold-binding': HTMLAttributes.binding,
        'data-scaffold-placeholder': HTMLAttributes.placeholder,
      },
      0,
    ]
  },
})
