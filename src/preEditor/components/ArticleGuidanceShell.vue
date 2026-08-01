<!-- ABOUTME: Provides the shared responsive header and content measure for setup stages. -->
<!-- ABOUTME: Owns the mobile Back control and exposes deterministic heading focus. -->

<template>
  <div class="article-guidance-shell" :data-step="step">
    <header class="article-guidance-shell__header">
      <div class="article-guidance-shell__header-inner">
        <div class="article-guidance-shell__back-slot">
          <CdxButton
            class="article-guidance-shell__mobile-back"
            weight="quiet"
            type="button"
            :aria-label="backLabel"
            @click="emit('back')"
          >
            <CdxIcon :icon="cdxIconArrowPrevious" />
          </CdxButton>
        </div>

        <h1 ref="headingElement" class="article-guidance-shell__heading" tabindex="-1">
          {{ heading }}
        </h1>

        <span class="article-guidance-shell__header-spacer" aria-hidden="true" />
      </div>
    </header>

    <main class="article-guidance-shell__body">
      <div class="article-guidance-shell__content">
        <slot />
      </div>
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
  width: 100%;
  max-width: 64rem;
  min-height: 100vh;
  margin: 0 auto;
  background-color: var(--background-color-base);
  color: var(--color-base);
}

.article-guidance-shell__header {
  width: 100%;
  border-bottom: var(--border-subtle);
}

.article-guidance-shell__header-inner {
  width: 100%;
  max-width: 40rem;
  min-height: var(--min-size-interactive-touch);
  margin: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.article-guidance-shell__back-slot {
  padding: 0 var(--spacing-50);
}

.article-guidance-shell__mobile-back {
  justify-self: start;
}

.article-guidance-shell__heading {
  margin: 0;
  font-family: var(--font-family-system-sans);
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-large);
  outline: none;
  text-align: center;
}

.article-guidance-shell__header-spacer {
  justify-self: end;
}

.article-guidance-shell__body {
  width: 100%;
  padding: clamp(16px, 2vw, 24px) clamp(16px, 3vw, 32px) clamp(16px, 3vw, 32px);
}

.article-guidance-shell__content {
  width: 100%;
  max-width: 40rem;
  margin: 0;
  min-height: 50vh;
}

@media (min-width: 1120px) {
  .article-guidance-shell__header-inner {
    max-width: none;
    min-height: auto;
    display: block;
  }

  .article-guidance-shell__back-slot,
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
    padding: var(--spacing-25) 0 var(--spacing-50);
  }

  .article-guidance-shell__body {
    padding: var(--spacing-75) 0 var(--spacing-200);
  }

  .article-guidance-shell__content {
    max-width: none;
    margin: 0;
  }
}
</style>
