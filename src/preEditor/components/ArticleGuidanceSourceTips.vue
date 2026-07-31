<!-- ABOUTME: Mirrors Article Guidance's expanded compact tips and static desktop tips panel. -->
<!-- ABOUTME: Uses only the deterministic Person fixture and performs no external source calls. -->

<template>
  <aside class="article-guidance-source-tips">
    <CdxAccordion
      v-model="tipsOpen"
      class="article-guidance-source-tips__accordion"
      separation="outline"
    >
      <template #title>
        <CdxIcon :icon="cdxIconInfoFilled" class="article-guidance-source-tips__icon" />
        {{ tipsTitle }}
      </template>
      <SourceTipsContent :recommended="recommended" />
    </CdxAccordion>

    <div class="article-guidance-source-tips__panel">
      <div class="article-guidance-source-tips__label">
        <CdxIcon :icon="cdxIconInfoFilled" class="article-guidance-source-tips__icon" />
        {{ tipsTitle }}
      </div>
      <SourceTipsContent :recommended="recommended" />
    </div>
  </aside>
</template>

<script setup>
import { computed, defineComponent, h, ref } from 'vue'
import { CdxAccordion, CdxIcon } from '@wikimedia/codex'
import { cdxIconInfoFilled } from '@wikimedia/codex-icons'

const props = defineProps({
  typeLabel: {
    type: String,
    required: true,
  },
  recommended: {
    type: Array,
    required: true,
  },
})

const tipsOpen = ref(true)
const tipsTitle = computed(() => `Tips for ${props.typeLabel} articles`)

const SourceTipsContent = defineComponent({
  name: 'SourceTipsContent',
  props: {
    recommended: {
      type: Array,
      required: true,
    },
  },
  setup(contentProps) {
    return () =>
      h('div', { class: 'article-guidance-source-tips__content' }, [
        h(
          'div',
          { class: 'article-guidance-source-tips__section-title' },
          'These source types work well:',
        ),
        h(
          'ul',
          { class: 'article-guidance-source-tips__list' },
          contentProps.recommended.map((item) => h('li', { key: item }, item)),
        ),
      ])
  },
})
</script>

<style scoped>
.article-guidance-source-tips,
.article-guidance-source-tips__panel {
  min-width: 0;
}

.article-guidance-source-tips__accordion {
  margin-top: var(--spacing-100);
}

.article-guidance-source-tips__accordion :deep(summary) {
  position: relative;
  padding-right: var(--spacing-200);
  background-color: var(--background-color-neutral-subtle);
}

.article-guidance-source-tips__accordion :deep(.cdx-accordion__header__title) {
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
  color: var(--color-subtle);
  font-weight: var(--font-weight-normal);
}

.article-guidance-source-tips__panel {
  display: none;
}

.article-guidance-source-tips__label {
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
  margin-bottom: var(--spacing-50);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.article-guidance-source-tips__icon {
  flex: 0 0 auto;
  color: var(--color-subtle);
}

:deep(.article-guidance-source-tips__content) {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-medium);
}

:deep(.article-guidance-source-tips__section-title) {
  margin-bottom: var(--spacing-25);
}

:deep(.article-guidance-source-tips__list) {
  margin: 0;
  padding-left: var(--spacing-100);
}

:deep(.article-guidance-source-tips__list li) {
  margin-bottom: var(--spacing-25);
}

@media (min-width: 1120px) {
  .article-guidance-source-tips__accordion {
    display: none;
  }

  .article-guidance-source-tips__panel {
    display: block;
    padding: var(--spacing-100);
    border: var(--border-subtle);
    border-radius: var(--border-radius-base);
    background-color: var(--background-color-base);
  }

  .article-guidance-source-tips__panel .article-guidance-source-tips__icon {
    color: var(--color-base);
  }

  :deep(.article-guidance-source-tips__content) {
    color: var(--color-base);
  }

  :deep(.article-guidance-source-tips__section-title) {
    color: var(--color-base);
    font-weight: var(--font-weight-bold);
  }

  :deep(.article-guidance-source-tips__list) {
    padding-left: var(--spacing-150);
  }

  :deep(.article-guidance-source-tips__list li) {
    margin-bottom: var(--spacing-50);
  }
}
</style>
