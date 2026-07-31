import Superscript from '@tiptap/extension-superscript'

const SOURCE_PROMPT_CLASS = 'outline-source-prompt'
const CITATION_CLASS = 'citation-reference'

/**
 * Preserve Source scaffold identity without styling unrelated superscript text.
 * A resolved citation keeps its own class so it reads as a reference, not a prompt.
 */
export const SourceSuperscript = Superscript.extend({
  addAttributes() {
    return {
      sourcePrompt: {
        default: false,
        parseHTML: (element) => element.classList.contains(SOURCE_PROMPT_CLASS),
        renderHTML: (attributes) => (attributes.sourcePrompt ? { class: SOURCE_PROMPT_CLASS } : {}),
      },
      citation: {
        default: false,
        parseHTML: (element) => element.classList.contains(CITATION_CLASS),
        renderHTML: (attributes) => (attributes.citation ? { class: CITATION_CLASS } : {}),
      },
    }
  },
})
