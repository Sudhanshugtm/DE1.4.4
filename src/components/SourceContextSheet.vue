<!-- ABOUTME: Context item shown when a Source prompt in the article scaffold is tapped. -->
<!-- ABOUTME: Mirrors MWCitationNeededContextItem: preview, description, one primary action. -->

<template>
  <div v-if="open" class="source-context" role="dialog" aria-label="Citation needed">
    <div class="source-context__header">
      <span class="source-context__title">
        <CdxIcon :icon="cdxIconQuotes" size="small" />
        Citation needed
      </span>
      <CdxButton weight="quiet" aria-label="Close" @click="open = false">
        <CdxIcon :icon="cdxIconClose" />
      </CdxButton>
    </div>
    <div class="source-context__body">
      <p class="source-context__description">
        An editor has indicated that this claim needs a citation to a reliable source.
      </p>
      <p v-if="reason" class="source-context__reason">
        Reason given: <em>{{ reason }}</em>
      </p>
      <CdxButton action="progressive" weight="primary" @click="$emit('add-citation')">
        Add a citation
      </CdxButton>
    </div>
  </div>
</template>

<script setup>
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconQuotes, cdxIconClose } from '@wikimedia/codex-icons'

defineProps({
  reason: {
    type: String,
    default: '',
  },
})

defineEmits(['add-citation'])
const open = defineModel('open', { type: Boolean, default: false })
</script>

<style scoped>
.source-context {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  background-color: var(--background-color-base);
  border-top: var(--border-width-base) var(--border-style-base) var(--border-color-base);
  padding-bottom: env(safe-area-inset-bottom, 0);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.source-context__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-50) var(--spacing-50) var(--spacing-50) var(--spacing-100);
  border-bottom: var(--border-width-base) var(--border-style-base) var(--border-color-subtle);
}

.source-context__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
  font-weight: var(--font-weight-bold);
}

.source-context__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-75);
  padding: var(--spacing-100);
}

.source-context__description,
.source-context__reason {
  margin: 0;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.source-context__reason {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
}
</style>
