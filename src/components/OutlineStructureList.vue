<template>
  <section class="outline-structure" :aria-labelledby="`${outline.id}-outline-title`">
    <header class="outline-structure__header">
      <div>
        <p class="outline-structure__eyebrow">Article outline</p>
        <h2 :id="`${outline.id}-outline-title`">{{ outline.label }}</h2>
      </div>
      <CdxButton weight="quiet" @click="emit('change-outline')">Change outline</CdxButton>
    </header>

    <ol class="outline-structure__items">
      <li
        v-for="item in outlineItems"
        :key="item.key"
        class="outline-structure__item"
        :class="{ 'outline-structure__item--added': isAdded(item) }"
      >
        <div class="outline-structure__item-header">
          <h3>{{ item.title }}</h3>
          <CdxButton
            weight="quiet"
            :disabled="isAdded(item)"
            :aria-label="isAdded(item) ? `${item.title} added` : `Add ${item.title}`"
            @click="onAdd(item)"
          >
            <CdxIcon :icon="isAdded(item) ? cdxIconCheck : cdxIconAdd" />
            {{ isAdded(item) ? 'Added' : 'Add' }}
          </CdxButton>
        </div>
        <div
          v-if="item.previewHtml"
          class="outline-structure__preview"
          v-html="item.previewHtml"
        ></div>
      </li>
    </ol>

    <a class="outline-structure__source" :href="outline.sourceUrl" target="_blank" rel="noopener">
      View community outline
    </a>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconAdd, cdxIconCheck } from '@wikimedia/codex-icons'
import { useEditorInstance } from '../composables/useEditorInstance'
import {
  isReferencesSection,
  outlineItemToEditorHtml,
  outlineWikitextToHtml,
} from '../utils/outlineWikitext.js'

const props = defineProps({
  outline: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['change-outline', 'content-inserted'])
const { getEditor } = useEditorInstance()
const addedItems = defineModel('addedItems', {
  type: Set,
  default: () => new Set(),
})

const outlineItems = computed(() => {
  const lead = {
    ...props.outline.lead,
    key: `${props.outline.id}:lead`,
    title: props.outline.lead?.title || 'Introduction',
    isLead: true,
    previewHtml: outlineWikitextToHtml(props.outline.lead?.content || ''),
  }

  const sections = (props.outline.sections || []).map((section) => ({
    ...section,
    key: `${props.outline.id}:${section.id}`,
    isLead: false,
    previewHtml: isReferencesSection(section) ? '' : outlineWikitextToHtml(section.content || ''),
  }))

  return [lead, ...sections]
})

function isAdded(item) {
  return addedItems.value.has(item.key)
}

function onAdd(item) {
  if (isAdded(item)) return

  const editor = getEditor()
  if (!editor) return

  const content = outlineItemToEditorHtml(item, { isLead: item.isLead })
  if (!content) return

  const inserted = editor.chain().focus('end').insertContent(content).run()
  if (!inserted) return

  addedItems.value = new Set([...addedItems.value, item.key])
  emit('content-inserted')
}
</script>

<style scoped>
.outline-structure {
  display: flex;
  flex-direction: column;
}

.outline-structure__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-75);
  padding-bottom: var(--spacing-100);
}

.outline-structure__eyebrow,
.outline-structure__header h2 {
  margin: 0;
}

.outline-structure__eyebrow {
  color: var(--color-subtle);
  font-size: var(--font-size-x-small);
  line-height: var(--line-height-x-small);
}

.outline-structure__header h2 {
  margin-top: var(--spacing-25);
  font-size: var(--font-size-large);
  line-height: var(--line-height-large);
}

.outline-structure__header .cdx-button {
  flex: 0 0 auto;
}

.outline-structure__items {
  margin: 0 calc(var(--spacing-100) * -1);
  padding: 0;
  list-style: none;
}

.outline-structure__item {
  padding: var(--spacing-100);
  border-top: 1px solid var(--border-color-subtle);
}

.outline-structure__item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-75);
}

.outline-structure__item-header h3 {
  margin: var(--spacing-25) 0 0;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.outline-structure__item-header .cdx-button {
  flex: 0 0 auto;
}

.outline-structure__item--added {
  background-color: var(--background-color-success-subtle);
}

.outline-structure__preview {
  padding-inline-end: var(--spacing-100);
  color: var(--color-subtle);
  font-family: var(--font-family-system-sans);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.outline-structure__preview :deep(p) {
  margin: var(--spacing-50) 0 0;
}

.outline-structure__preview :deep(ul),
.outline-structure__preview :deep(ol) {
  margin: var(--spacing-50) 0 0;
  padding-inline-start: var(--spacing-125);
}

.outline-structure__preview :deep(a) {
  color: var(--color-progressive);
}

.outline-structure__preview :deep(.outline-source-prompt) {
  color: var(--color-subtle);
}

.outline-structure__source {
  align-self: flex-start;
  margin: var(--spacing-100) 0;
  font-size: var(--font-size-small);
}
</style>
