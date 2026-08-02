<!-- ABOUTME: Mirrors Article Guidance's selected article title, edit affordance, and type chip. -->
<!-- ABOUTME: Keeps shared article context consistent across Sources and Guidance. -->

<template>
  <!-- Title and type read as one item; Edit follows them because it edits
       the whole selection, not just the words of the title. -->
  <div class="article-guidance-subject" aria-label="Selected article subject">
    <h2 class="article-guidance-subject__title">{{ title }}</h2>
    <CdxInfoChip class="article-guidance-subject__type">{{ typeLabel }}</CdxInfoChip>
    <CdxButton
      class="article-guidance-subject__edit"
      weight="quiet"
      type="button"
      aria-label="Edit article title and type"
      @click="emit('edit')"
    >
      <CdxIcon :icon="cdxIconEdit" />
    </CdxButton>
  </div>
</template>

<script setup>
import { CdxButton, CdxIcon, CdxInfoChip } from '@wikimedia/codex'
import { cdxIconEdit } from '@wikimedia/codex-icons'

defineProps({
  title: {
    type: String,
    required: true,
  },
  typeLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['edit'])
</script>

<style scoped>
.article-guidance-subject {
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
  margin-bottom: var(--spacing-100);
}

.article-guidance-subject__title {
  margin: 0;
  border: 0;
  color: var(--color-base);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-xx-large);
}

.article-guidance-subject__edit {
  flex: 0 0 auto;
}

/* Deliberate departure from the stock chip: next to a page title the notice
   fill reads as a button, so the type wears only its outline here. */
.article-guidance-subject__type {
  flex: 0 0 auto;
  background-color: var(--background-color-transparent, transparent);
}
</style>
