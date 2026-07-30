<template>
  <section class="outline-selector" aria-labelledby="outline-selector-title">
    <div class="outline-selector__intro">
      <h2 id="outline-selector-title">Choose an article outline</h2>
      <p>Select the article type that best matches what you are writing.</p>
    </div>

    <CdxSearchInput
      v-model="searchQuery"
      class="outline-selector__search"
      placeholder="Search outlines"
      aria-label="Search article outlines"
    />

    <div v-if="filteredOutlines.length" class="outline-selector__results">
      <button
        v-for="outline in filteredOutlines"
        :key="outline.id"
        class="outline-selector__option"
        type="button"
        @click="emit('select', outline.id)"
      >
        <span class="outline-selector__label">{{ outline.label }}</span>
        <CdxIcon :icon="cdxIconNext" />
      </button>
    </div>
    <p v-else class="outline-selector__empty">No outlines match “{{ searchQuery }}”.</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CdxIcon, CdxSearchInput } from '@wikimedia/codex'
import { cdxIconNext } from '@wikimedia/codex-icons'
import { simpleEnglishOutlines } from '../config/outlines/simpleEnglish.js'

const emit = defineEmits(['select'])
const searchQuery = ref('')

const filteredOutlines = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()
  if (!query) return simpleEnglishOutlines

  return simpleEnglishOutlines.filter((outline) =>
    `${outline.label} ${outline.articleType || ''}`.toLocaleLowerCase().includes(query),
  )
})
</script>

<style scoped>
.outline-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
}

.outline-selector__intro h2,
.outline-selector__intro p {
  margin: 0;
}

.outline-selector__intro h2 {
  font-size: var(--font-size-large);
  line-height: var(--line-height-large);
}

.outline-selector__intro p {
  margin-top: var(--spacing-25);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.outline-selector__search {
  flex: 0 0 auto;
}

.outline-selector__results {
  display: flex;
  flex-direction: column;
  margin: 0 calc(var(--spacing-100) * -1);
}

.outline-selector__option {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: var(--spacing-75) var(--spacing-100);
  border: 0;
  border-bottom: 1px solid var(--border-color-subtle);
  background: var(--background-color-transparent);
  color: var(--color-base);
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.outline-selector__option:first-child {
  border-top: 1px solid var(--border-color-subtle);
}

.outline-selector__option:hover,
.outline-selector__option:focus-visible {
  background: var(--background-color-interactive-subtle);
}

.outline-selector__label {
  font-weight: var(--font-weight-bold);
}

.outline-selector__option .cdx-icon {
  flex: 0 0 auto;
  color: var(--color-subtle);
}

.outline-selector__empty {
  margin: var(--spacing-100) 0;
  color: var(--color-subtle);
  text-align: center;
}
</style>
