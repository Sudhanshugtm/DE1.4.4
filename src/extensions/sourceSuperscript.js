import Superscript from '@tiptap/extension-superscript'

const SOURCE_PROMPT_CLASS = 'outline-source-prompt'

/**
 * Preserve Source scaffold identity without styling unrelated superscript text.
 */
export const SourceSuperscript = Superscript.extend({
  addAttributes() {
    return {
      sourcePrompt: {
        default: false,
        parseHTML: (element) => element.classList.contains(SOURCE_PROMPT_CLASS),
        renderHTML: (attributes) => (attributes.sourcePrompt ? { class: SOURCE_PROMPT_CLASS } : {}),
      },
    }
  },
})
