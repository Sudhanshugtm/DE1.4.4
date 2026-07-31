<template>
  <main class="outline-lab">
    <header class="outline-lab__header">
      <p class="outline-lab__eyebrow">Prototype testing</p>
      <h1>Outline lab</h1>
      <p>Open any Simple English Wikipedia outline in the editor.</p>
    </header>

    <OutlineSelector @select="openOutline" />
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import OutlineSelector from '@/components/OutlineSelector.vue'

const router = useRouter()

function openOutline(outlineId) {
  router.push({
    name: 'editor',
    query: {
      lang: 'en',
      variant: 'toolbar-outline',
      outline: outlineId,
    },
  })
}
</script>

<style scoped>
.outline-lab {
  width: min(100%, 640px);
  min-height: 100%;
  margin: 0 auto;
  padding: var(--spacing-150) var(--spacing-100)
    calc(var(--spacing-200) + env(safe-area-inset-bottom));
}

.outline-lab__header {
  margin-bottom: var(--spacing-200);
}

.outline-lab__header h1,
.outline-lab__header p {
  margin: 0;
}

.outline-lab__header h1 {
  font-size: var(--font-size-xx-large);
  line-height: var(--line-height-xx-large);
}

.outline-lab__header > p:last-child {
  margin-top: var(--spacing-25);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.outline-lab__eyebrow {
  margin-bottom: var(--spacing-25) !important;
  color: var(--color-progressive);
  font-size: var(--font-size-x-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
