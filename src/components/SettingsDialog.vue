<template>
  <CdxDialog v-model:open="open" title="Settings" :use-close-button="true">
    <div class="settings-content" :class="{ 'no-transitions': suppressTransitions }">
      <!-- Article outline (topic type) section -->
      <div class="field-group">
        <CdxLabel>Article outline</CdxLabel>
        <p class="field-group__hint">
          Currently: <strong>{{ currentOutlineLabel }}</strong> — in the real flow the topic is
          chosen before the editor opens.
        </p>
        <OutlineSelector @select="onSelectOutline" />
      </div>
      <!-- Entry point section -->
      <div class="field-group">
        <CdxLabel>Entry point</CdxLabel>
        <CdxRadio
          v-for="(label, styleKey) in entryPointLabels"
          :key="styleKey"
          v-model="localSettings.entryPoint.style"
          :input-value="styleKey"
          name="entryPoint-style"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Auto-focus section -->
      <div class="field-group">
        <CdxLabel>Auto-focus</CdxLabel>
        <CdxRadio
          v-for="(label, focusKey) in autoFocusLabels"
          :key="focusKey"
          v-model="localSettings.entryPoint.autoFocus"
          :input-value="focusKey"
          name="entryPoint-autoFocus"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Outline location section -->
      <div class="field-group">
        <CdxLabel>Outline location</CdxLabel>
        <CdxRadio
          v-for="(label, locationKey) in outlineLocationLabels"
          :key="locationKey"
          v-model="localSettings.outline.location"
          :input-value="locationKey"
          name="outline-location"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
      <!-- Outline persistence section -->
      <div class="field-group">
        <CdxLabel>Outline persistence</CdxLabel>
        <CdxRadio
          v-for="(label, persistenceKey) in outlinePersistenceLabels"
          :key="persistenceKey"
          v-model="localSettings.outline.persistence"
          :input-value="persistenceKey"
          name="outline-persistence"
          @update:model-value="onSettingChange"
        >
          {{ label }}
        </CdxRadio>
      </div>
    </div>
  </CdxDialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CdxDialog, CdxLabel, CdxRadio } from '@wikimedia/codex'
import OutlineSelector from './OutlineSelector.vue'
import { simpleEnglishOutlinesById } from '../config/outlines/simpleEnglish.js'
import { useEditorSettings } from '../composables/useEditorSettings'
import {
  entryPointLabels,
  autoFocusLabels,
  outlineLocationLabels,
  outlinePersistenceLabels,
} from '../config/editorSettings'

const open = defineModel('open', { type: Boolean, default: false })

const route = useRoute()
const router = useRouter()

const currentOutlineLabel = computed(() => {
  const outlineId = route.query.outline
  const outline =
    typeof outlineId === 'string' && Object.hasOwn(simpleEnglishOutlinesById, outlineId)
      ? simpleEnglishOutlinesById[outlineId]
      : simpleEnglishOutlinesById.person
  return outline?.label ?? 'Person'
})

function onSelectOutline(outlineId) {
  router.replace({ query: { ...route.query, outline: outlineId } })
  open.value = false
}

// Suppress CSS transitions on mount so radios don't animate to their initial state
const suppressTransitions = ref(true)
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      suppressTransitions.value = false
    })
  })
})

const { settings, updateSettings } = useEditorSettings()

// Local copy of settings for reactive updates
const localSettings = ref(structuredClone(settings.value))

// Watch for external URL changes and sync local settings
watch(
  settings,
  (newSettings) => {
    localSettings.value = structuredClone(newSettings)
  },
  { deep: true },
)

function onSettingChange() {
  updateSettings(localSettings.value)
}
</script>

<style scoped>
.field-group {
  margin-top: var(--spacing-75);
}

.field-group :deep(.cdx-label) {
  font-weight: var(--font-weight-bold);
}

.field-group__hint {
  margin: var(--spacing-25) 0 var(--spacing-50);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.no-transitions :deep(*) {
  transition: none !important;
}
</style>
