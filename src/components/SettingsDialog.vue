<template>
  <CdxDialog v-model:open="open" title="Settings" :use-close-button="true">
    <div class="settings-content">
      <!-- Article outline (topic type) section -->
      <div class="field-group">
        <CdxLabel>Article outline</CdxLabel>
        <p class="field-group__hint">
          Currently: <strong>{{ currentOutlineLabel }}</strong
          >. In the real flow the topic is chosen before the editor opens.
        </p>
        <OutlineSelector :show-intro="false" @select="onSelectOutline" />
      </div>
      <div
        class="field-group field-group--prototype"
        role="group"
        aria-labelledby="prototype-demos-label"
      >
        <CdxLabel id="prototype-demos-label">Prototype demos</CdxLabel>
        <p id="prototype-demos-description" class="field-group__hint">
          Explore reviewed Wikidata facts using Portugal.
        </p>
        <CdxButton
          ref="demoLauncherRef"
          data-testid="open-verified-facts-demo"
          action="progressive"
          aria-describedby="prototype-demos-description"
          :disabled="demoLaunchPending"
          @click="emit('open-verified-facts-demo')"
        >
          Open Verified facts demo
        </CdxButton>
      </div>
    </div>
  </CdxDialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CdxButton, CdxDialog, CdxLabel } from '@wikimedia/codex'
import OutlineSelector from './OutlineSelector.vue'
import { simpleEnglishOutlinesById } from '../config/outlines/simpleEnglish.js'

defineProps({
  demoLaunchPending: {
    type: Boolean,
    default: false,
  },
})

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['outline-selected', 'open-verified-facts-demo'])
const demoLauncherRef = ref(null)

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

function focusDemoLauncher() {
  demoLauncherRef.value?.$el?.focus()
}

defineExpose({ focusDemoLauncher })
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

.field-group--prototype {
  margin-top: var(--spacing-100);
  padding-top: var(--spacing-100);
  border-top: var(--border-subtle);
}
</style>
