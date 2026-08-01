<template>
  <section class="outline-structure" :aria-label="`${outline.label} article outline sections`">
    <div class="outline-structure__items">
      <CdxAccordion
        v-for="item in outlineItems"
        :key="item.key"
        class="outline-structure__accordion"
        heading-level="h2"
        :class="{
          'outline-structure__accordion--empty': isItemEmpty(item),
          'outline-structure__accordion--added': isAdded(item),
        }"
        separation="none"
        :model-value="accordionStates[item.key]"
        :action-icon="actionIconFor(item)"
        :action-always-visible="true"
        :action-button-label="isAdded(item) ? `${item.title} added` : `Add ${item.title}`"
        @update:model-value="(value) => onAccordionUpdate(item, value)"
        @action-button-click="onAdd(item)"
      >
        <template #title>
          <span class="outline-structure__title">
            {{ item.title }}
            <CdxInfoChip v-if="item.required" class="outline-structure__chip">
              Required section
            </CdxInfoChip>
          </span>
        </template>
        <template #description>
          <span class="outline-structure__description">{{ item.description }}</span>
        </template>

        <div
          v-if="item.previewHtml"
          class="outline-structure__preview"
          v-html="item.previewHtml"
        ></div>
      </CdxAccordion>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CdxAccordion, CdxInfoChip } from '@wikimedia/codex'
import { cdxIconAdd, cdxIconCheck } from '@wikimedia/codex-icons'
import { useEditorInstance } from '../composables/useEditorInstance'
import { getOutlineItemDescription } from '../config/outlines/sectionDescriptions.js'
import { insertOutlineContent } from '../utils/outlineInsertion.js'
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

const emit = defineEmits(['content-inserted'])
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
    // An article cannot be published without its lead, so it is always
    // required. Other sections opt in through the outline itself.
    required: true,
    previewHtml: outlineWikitextToHtml(props.outline.lead?.content || ''),
  }
  lead.description = getOutlineItemDescription(lead, props.outline)

  const sections = (props.outline.sections || []).map((section) => ({
    ...section,
    key: `${props.outline.id}:${section.id}`,
    isLead: false,
    required: Boolean(section.required),
    // References is not added by hand: citations create it. The row stays so
    // the outline still says articles end with references.
    description: isReferencesSection(section)
      ? 'Appears with your first citation.'
      : getOutlineItemDescription(section, props.outline),
    previewHtml: isReferencesSection(section) ? '' : outlineWikitextToHtml(section.content || ''),
  }))

  return [lead, ...sections]
})

const accordionStates = ref({})

watch(
  outlineItems,
  (items) => {
    accordionStates.value = Object.fromEntries(items.map((item) => [item.key, false]))
  },
  { immediate: true },
)

function isAdded(item) {
  return addedItems.value.has(item.key)
}

// References carries no Add: it arrives with the first citation, and shows
// the check once it has.
function actionIconFor(item) {
  if (isAdded(item)) return cdxIconCheck
  return isReferencesSection(item) ? '' : cdxIconAdd
}

function isItemEmpty(item) {
  return !item.previewHtml
}

function onAccordionUpdate(item, value) {
  if (isItemEmpty(item) && value) return
  accordionStates.value[item.key] = value
}

function onAdd(item) {
  if (isAdded(item) || isReferencesSection(item)) return

  const editor = getEditor()
  if (!editor) return

  const content = outlineItemToEditorHtml(item, { isLead: item.isLead })
  if (!content) return

  const inserted = insertOutlineContent(editor, content)
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

.outline-structure__accordion {
  margin-inline: 0;
}

.outline-structure__accordion :deep(.cdx-accordion__header) {
  min-width: 0;
}

.outline-structure__title {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-50);
}

.outline-structure__chip {
  font-weight: var(--font-weight-normal);
}

.outline-structure__description {
  display: block;
  max-width: 100%;
  color: var(--color-subtle);
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
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
  color: var(--color-progressive);
}

.outline-structure__preview :deep(sup.outline-source-prompt) {
  font-size: var(--font-size-x-small);
  line-height: 0;
  vertical-align: super;
}
</style>
