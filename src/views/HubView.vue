<!-- ABOUTME: Internal hub page for managing and accessing prototype builds. -->
<!-- ABOUTME: Lists baseline locale prototypes and focused design variations. -->

<template>
  <div class="hub">
    <header class="hub__header">
      <h1 class="hub__title">Article Guidance</h1>
      <p class="hub__subtitle">Design prototypes</p>
    </header>

    <main class="hub__content">
      <div class="hub__list">
        <router-link v-for="proto in prototypes" :key="proto.key" :to="proto.to" class="hub__card">
          <span class="hub__card-label">{{ proto.label }}</span>
          <span class="hub__card-description">{{ proto.description }}</span>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
// ABOUTME: Lists the active prototype builds for the current design direction.

const prototypes = [
  {
    key: 'pre-editor-journey',
    label: 'Full journey — reading to writing',
    description:
      'A reading article whose red links lead through subject, sources, and guidance into the editor.',
    to: { name: 'article' },
  },
  {
    key: 'ag-in-ve',
    label: 'Visual editor with article guidance',
    description: 'Mobile-first · suggested sections, guidance, and checks inside the editor.',
    to: { name: 'editor', query: { lang: 'en', variant: 'toolbar-outline' } },
  },
]
</script>

<style scoped>
.hub {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacing-200) var(--spacing-100);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hub__header {
  margin-bottom: var(--spacing-200);
}

.hub__title {
  font-size: var(--font-size-x-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-xxx-small);
  margin: 0;
}

.hub__subtitle {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  margin: 0;
}

.hub__content {
  flex: 1;
}

.hub__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

.hub__card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-25);
  padding: var(--spacing-100);
  border: var(--border-width-base) var(--border-style-base) var(--border-color-subtle);
  border-radius: var(--border-radius-base);
  text-decoration: none;
  color: var(--color-base);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.hub__card:hover {
  border-color: var(--color-progressive);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  text-decoration: none;
}

.hub__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hub__card-lang {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--color-subtle);
}

.hub__card-status {
  font-size: var(--font-size-x-small);
  padding: 1px var(--spacing-50);
  border-radius: var(--border-radius-pill);
}

.hub__card-status--active {
  color: var(--color-success);
  background-color: var(--background-color-success-subtle);
}

.hub__card-status--planned {
  color: var(--color-subtle);
  background-color: var(--background-color-neutral-subtle);
}

.hub__card-label {
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-bold);
}

.hub__card-description {
  font-size: var(--font-size-small);
  color: var(--color-subtle);
  line-height: var(--line-height-xx-small);
}
</style>
