import Heading from '@tiptap/extension-heading'

const SectionHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      outlineItemKey: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-outline-item-key'),
        renderHTML: (attributes) => {
          if (!attributes.outlineItemKey) return {}

          return { 'data-outline-item-key': attributes.outlineItemKey }
        },
      },
    }
  },
})

export default SectionHeading
