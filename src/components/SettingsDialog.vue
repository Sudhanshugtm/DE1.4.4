<template>
  <CdxDialog v-model:open="open" title="Settings" :use-close-button="true">
    <div class="settings-content">
      <!-- Article outline (topic type) section -->
      <div class="field-group">
        <CdxLabel>Article outline</CdxLabel>
        <p class="field-group__hint">
          Currently: <strong>{{ currentOutlineLabel }}</strong> — in the real flow the topic is
          chosen before the editor opens.
        </p>
        <OutlineSelector :show-intro="false" @select="onSelectOutline" />
      </div>
    </div>
  </CdxDialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CdxDialog, CdxLabel } from '@wikimedia/codex'
import OutlineSelector from './OutlineSelector.vue'
import { simpleEnglishOutlinesById } from '../config/outlines/simpleEnglish.js'

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['outline-selected'])

const route = useRoute()

const currentOutlineLabel = computed(() => {
  const outlineId = route.query.outline
  const outline =
    typeof outlineId === 'string' && Object.hasOwn(simpleEnglishOutlinesById, outlineId)
      ? simpleEnglishOutlinesById[outlineId]
      : simpleEnglishOutlinesById.person
  return outline?.label ?? 'Person'
})

function onSelectOutline(outlineId) {
  emit('outline-selected', outlineId)
}
</script>

<style scoped>
.field-group :deep(.cdx-label) {
  font-weight: var(--font-weight-bold);
}

.field-group__hint {
  margin: var(--spacing-25) 0 var(--spacing-50);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}
</style>
