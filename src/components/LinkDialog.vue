<!-- ABOUTME: Minimal link tool: paste a URL, get a link at the caret. -->
<!-- ABOUTME: Runs the same discouraged-source check as the citation flow. -->

<template>
  <div class="link-dialog">
    <CdxDialog
      v-model:open="open"
      title="Add a link"
      :use-close-button="true"
      :render-in-place="true"
    >
      <div class="link-dialog__content">
        <CdxSearchInput
          v-model="url"
          :use-button="true"
          :hide-icon="true"
          button-label="Insert"
          placeholder="e.g. http://www.example.com"
          @submit-click="onInsert"
        />
        <CdxMessage v-if="error" type="error" :inline="true">{{ error }}</CdxMessage>
      </div>
    </CdxDialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CdxDialog, CdxMessage, CdxSearchInput } from '@wikimedia/codex'
import { findDiscouragedSource } from '../config/outlines/discouragedSources'

const props = defineProps({
  outlineId: {
    type: String,
    default: '',
  },
  outlineLabel: {
    type: String,
    default: 'this type of',
  },
})

const emit = defineEmits(['link-created'])

const open = defineModel('open', { type: Boolean, default: false })
const url = ref('')
const error = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    url.value = ''
    error.value = ''
  }
})

watch(url, () => {
  error.value = ''
})

function onInsert() {
  const value = url.value.trim()
  if (!value) return

  let parsed
  try {
    parsed = new URL(value)
  } catch {
    error.value = 'Enter a valid URL.'
    return
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    error.value = 'Enter a valid URL.'
    return
  }

  // Same rule as citing: what the community discouraged before writing does
  // not become acceptable while writing.
  const match = findDiscouragedSource(value, props.outlineId)
  if (match) {
    error.value = `Simple English editors discourage ${match.domain} as a source for ${props.outlineLabel} articles. Link an independent, reliable source instead.`
    return
  }

  url.value = ''
  open.value = false
  emit('link-created', { url: parsed.href })
}
</script>

<style scoped>
.link-dialog :deep(.cdx-dialog__header) {
  flex-direction: row-reverse;
  align-items: center;
  padding: var(--spacing-50) var(--spacing-100);
  border-bottom: var(--border-width-base) var(--border-style-base) var(--border-color-subtle);
}

.link-dialog :deep(.cdx-dialog__header__title) {
  font-size: var(--font-size-large);
}

.link-dialog :deep(.cdx-dialog__header__close-button.cdx-button) {
  margin-right: var(--spacing-100);
}

.link-dialog__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
  padding: var(--spacing-100);
}

/* On a phone the link tool takes the screen, like the citation flow. */
@media screen and (max-width: 640px) {
  .link-dialog :deep(.cdx-dialog) {
    width: 100%;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    border: 0;
    border-radius: 0;
  }
}
</style>
