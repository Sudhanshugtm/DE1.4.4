<!-- ABOUTME: Provides the shared responsive header and content measure for setup stages. -->
<!-- ABOUTME: Owns the mobile Back control and exposes deterministic heading focus. -->

<template>
  <div class="article-guidance-shell" :data-step="step">
    <header class="article-guidance-shell__header">
      <CdxButton
        class="article-guidance-shell__mobile-back"
        weight="quiet"
        type="button"
        :aria-label="backLabel"
        @click="emit('back')"
      >
        <CdxIcon :icon="cdxIconArrowPrevious" />
      </CdxButton>

      <h1 ref="headingElement" class="article-guidance-shell__heading" tabindex="-1">
        {{ heading }}
      </h1>

      <span class="article-guidance-shell__header-spacer" aria-hidden="true" />
    </header>

    <main class="article-guidance-shell__body">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons'

defineProps({
  step: {
    type: String,
    required: true,
  },
  heading: {
    type: String,
    required: true,
  },
  backLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['back'])
const headingElement = ref(null)

function focusHeading() {
  headingElement.value?.focus()
}

defineExpose({ focusHeading })
</script>

<style scoped>
.article-guidance-shell {
  min-height: 100vh;
  background-color: var(--background-color-base);
  color: var(--color-base);
}

.article-guidance-shell__header {
  width: 100%;
  min-height: var(--min-size-interactive-touch);
  padding: 0 var(--spacing-50);
  display: grid;
  grid-template-columns:
    var(--min-size-interactive-touch) minmax(0, 1fr)
    var(--min-size-interactive-touch);
  align-items: center;
  border-bottom: var(--border-subtle);
}

.article-guidance-shell__mobile-back {
  justify-self: start;
}

.article-guidance-shell__heading {
  margin: 0;
  font-family: var(--font-family-system-sans);
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-medium);
  text-align: center;
}

.article-guidance-shell__heading:focus-visible {
  outline: var(--border-width-thick) var(--border-style-base)
    var(--outline-color-progressive--focus);
  outline-offset: var(--spacing-12);
}

.article-guidance-shell__header-spacer {
  width: var(--min-size-interactive-touch);
  height: var(--min-size-interactive-touch);
}

.article-guidance-shell__body {
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  padding: var(--spacing-150) var(--spacing-100) var(--spacing-300);
}

@media (min-width: 640px) {
  .article-guidance-shell__header {
    max-width: 40rem;
    min-height: auto;
    margin: 0 auto;
    padding: var(--spacing-300) var(--spacing-100) 0;
    display: block;
    border-bottom: 0;
  }

  .article-guidance-shell__mobile-back,
  .article-guidance-shell__header-spacer {
    display: none;
  }

  .article-guidance-shell__heading {
    font-family: var(--font-family-heading-main);
    font-size: var(--font-size-xxx-large);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-xxx-large);
    text-align: left;
  }

  .article-guidance-shell__body {
    padding-top: var(--spacing-150);
  }
}
</style>
