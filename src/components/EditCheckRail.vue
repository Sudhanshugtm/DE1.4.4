<!-- ABOUTME: The gutter markers and card that carry edit checks and suggestions. -->
<!-- ABOUTME: Markers sit beside the text they are about; pagination appears for more than one. -->

<template>
  <!-- A suggestion is a card that shows itself once and waits to be put
       away; it never takes a gutter marker. When a check exists, the check
       takes the rail: feedback outranks guidance. -->
  <template v-if="!checks.length && suggestion">
    <div v-if="suggestion.open" class="edit-check__card" role="status">
      <div class="edit-check__header">
        <span class="edit-check__title">
          <CdxIcon :icon="cdxIconLightbulb" class="edit-check__suggestion-icon" />
          {{ suggestion.title }}
        </span>
        <CdxButton weight="quiet" aria-label="Close" @click="$emit('suggestion-dismiss')">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>

      <div class="edit-check__body">
        <p v-if="suggestion.intro" class="edit-check__attribution">{{ suggestion.intro }}</p>
        <ul class="edit-check__tips">
          <li v-for="tip in suggestion.bullets" :key="tip">{{ tip }}</li>
        </ul>
        <div class="edit-check__actions">
          <CdxButton @click="$emit('suggestion-dismiss')">Got it</CdxButton>
        </div>
      </div>
    </div>
  </template>

  <template v-if="checks.length">
    <!-- Gutter: a marker beside each stretch of text a check is about. -->
    <div class="edit-check__gutter" aria-hidden="true">
      <span v-if="marker" class="edit-check__marker" :style="{ top: `${marker.top}px` }">
        <CdxIcon :icon="markerIcon" class="edit-check__marker-icon" />
      </span>
    </div>

    <div class="edit-check__card" role="status">
      <div class="edit-check__header">
        <span class="edit-check__title">
          <CdxIcon :icon="markerIcon" class="edit-check__marker-icon" />
          {{ current.title }}
        </span>
        <CdxButton weight="quiet" aria-label="Close" @click="$emit('dismiss')">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>

      <div class="edit-check__body">
        <p class="edit-check__message">{{ current.message }}</p>
        <p v-if="current.prompt" class="edit-check__prompt">{{ current.prompt }}</p>
        <div class="edit-check__actions">
          <CdxButton
            v-for="action in current.actions"
            :key="action.name"
            @click="$emit('act', { action: action.name, check: current })"
          >
            {{ action.label }}
          </CdxButton>
        </div>
      </div>

      <!-- One check needs no way to move between checks. -->
      <div v-if="checks.length > 1" class="edit-check__pagination">
        <span class="edit-check__count">{{ index + 1 }} of {{ checks.length }}</span>
        <CdxButton
          weight="quiet"
          aria-label="Previous"
          :disabled="index === 0"
          @click="$emit('navigate', index - 1)"
        >
          <CdxIcon :icon="cdxIconExpand" class="edit-check__chevron-up" />
        </CdxButton>
        <CdxButton
          weight="quiet"
          aria-label="Next"
          :disabled="index === checks.length - 1"
          @click="$emit('navigate', index + 1)"
        >
          <CdxIcon :icon="cdxIconExpand" />
        </CdxButton>
      </div>
    </div>
  </template>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconClose, cdxIconAlert, cdxIconLightbulb, cdxIconExpand } from '@wikimedia/codex-icons'
import { useEditorInstance } from '../composables/useEditorInstance'

const props = defineProps({
  checks: {
    type: Array,
    default: () => [],
  },
  index: {
    type: Number,
    default: 0,
  },
  suggestion: {
    type: Object,
    default: null,
  },
})

defineEmits(['act', 'dismiss', 'navigate', 'suggestion-dismiss'])

const { getEditor } = useEditorInstance()
const current = computed(() => props.checks[props.index] ?? props.checks[0] ?? {})
const markerIcon = computed(() =>
  current.value.type === 'suggestion' ? cdxIconLightbulb : cdxIconAlert,
)

// One check, one marker: it sits beside the first field the check is about.
const marker = ref(null)

function positionMarkers() {
  const editor = getEditor()
  const firstField = current.value?.fields?.[0]

  if (!editor || !props.checks.length) {
    marker.value = null
    return
  }

  // A check about a place in the article points at it; one about the edit
  // itself sits where the editor is working.
  const position = firstField?.from ?? editor.state.selection.from

  try {
    marker.value = { top: editor.view.coordsAtPos(position).top }
  } catch {
    marker.value = null
  }
}

let frame = null
function schedulePositioning() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(positionMarkers)
}

watch(() => [props.checks, props.index, props.suggestion], schedulePositioning, {
  deep: true,
  immediate: true,
})
onMounted(() => {
  schedulePositioning()
  window.addEventListener('resize', schedulePositioning)
  document.addEventListener('scroll', schedulePositioning, true)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('resize', schedulePositioning)
  document.removeEventListener('scroll', schedulePositioning, true)
})
</script>

<style scoped>
/* Gutter markers sit in a column at the edge of the article. */
.edit-check__gutter {
  position: fixed;
  top: 48px;
  right: 0;
  bottom: 0;
  width: 44px;
  z-index: 2;
  border-left: 1px solid var(--border-color-subtle);
  background-color: var(--background-color-base);
  pointer-events: none;
}

.edit-check__marker {
  position: absolute;
  right: 0;
  width: 44px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* A bar ties the marker back to the line it is about. */
.edit-check__marker::before {
  content: '';
  position: absolute;
  left: 0;
  top: -2px;
  bottom: -2px;
  width: 2px;
  background-color: var(--color-icon-warning, #ab7f2a);
}

.edit-check__marker-icon {
  color: var(--color-icon-warning, #ab7f2a);
}

/* The suggestion speaks in the progressive voice, not the warning one. */
.edit-check__suggestion-icon {
  color: var(--color-progressive, #36c);
}

.edit-check__attribution {
  margin: 0;
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.edit-check__tips {
  margin: 0;
  padding-inline-start: var(--spacing-125);
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.edit-check__tips li {
  margin-bottom: var(--spacing-35);
}

.edit-check__card {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color-base);
  border-top: 1px solid var(--border-color-base);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.edit-check__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-50);
  padding: var(--spacing-50) var(--spacing-50) var(--spacing-50) var(--spacing-100);
  border-bottom: 1px solid var(--border-color-subtle);
}

.edit-check__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-medium);
}

.edit-check__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
  padding: var(--spacing-100);
}

.edit-check__message {
  margin: 0;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.edit-check__prompt {
  margin: 0;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.edit-check__actions {
  display: flex;
  gap: var(--spacing-50);
}

.edit-check__pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-25);
  padding: var(--spacing-25) var(--spacing-50);
  border-top: 1px solid var(--border-color-subtle);
}

.edit-check__count {
  margin-right: var(--spacing-50);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
}

.edit-check__chevron-up {
  transform: rotate(180deg);
}
</style>
