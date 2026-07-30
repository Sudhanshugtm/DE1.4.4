<template>
  <section class="outline-structure" :aria-labelledby="`${outline.id}-outline-title`">
    <header class="outline-structure__header">
      <div>
        <p class="outline-structure__eyebrow">Article outline</p>
        <h2 :id="`${outline.id}-outline-title`">{{ outline.label }}</h2>
      </div>
      <CdxButton weight="quiet" @click="emit('change-outline')">Change outline</CdxButton>
    </header>

    <div class="outline-structure__items">
      <CdxAccordion
        v-for="item in outlineItems"
        :key="item.key"
        class="outline-structure__accordion"
        :class="{
          'outline-structure__accordion--empty': isItemEmpty(item),
          'outline-structure__accordion--added': isAdded(item),
        }"
        separation="none"
        :model-value="accordionStates[item.key]"
        :action-icon="isAdded(item) ? cdxIconCheck : cdxIconAdd"
        :action-always-visible="true"
        :action-button-label="isAdded(item) ? `${item.title} added` : `Add ${item.title}`"
        @update:model-value="(value) => onAccordionUpdate(item, value)"
        @action-button-click="onAdd(item)"
      >
        <template #title>{{ item.title }}</template>

        <div
          v-if="item.previewHtml"
          class="outline-structure__preview"
          v-html="item.previewHtml"
        ></div>
      </CdxAccordion>
    </div>

    <a class="outline-structure__source" :href="outline.sourceUrl" target="_blank" rel="noopener">
      View community outline
    </a>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CdxAccordion, CdxButton } from '@wikimedia/codex'
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

const accordionStates = ref({})

watch(
  outlineItems,
  (items) => {
    accordionStates.value = Object.fromEntries(items.map((item, index) => [item.key, index === 0]))
  },
  { immediate: true },
)

function isAdded(item) {
  return addedItems.value.has(item.key)
}

function isItemEmpty(item) {
  return !item.previewHtml
}

function onAccordionUpdate(item, value) {
  if (isItemEmpty(item) && value) return
  accordionStates.value[item.key] = value
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

.outline-structure__accordion {
  margin-inline: 0;
}

.outline-structure__accordion--empty :deep(> summary::before) {
  opacity: 0;
}

.outline-structure__accordion--empty :deep(> summary) {
  cursor: default;
  pointer-events: none;
}

.outline-structure__accordion--empty :deep(> summary .cdx-accordion__action) {
  pointer-events: auto;
  cursor: pointer;
}

.outline-structure__accordion--added :deep(> summary .cdx-accordion__action) {
  pointer-events: none;
  cursor: default;
  opacity: var(--opacity-icon-base--disabled, 0.51);
}

.outline-structure__preview {
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
