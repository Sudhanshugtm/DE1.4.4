<!-- ABOUTME: Renders the controlled source URL form, accepted source list, and progress. -->
<!-- ABOUTME: Keeps source validation and state transitions in its parent coordinator. -->

<template>
  <div class="source-url-form">
    <form class="source-url-form__form" novalidate @submit.prevent="emit('submit')">
      <CdxField
        class="source-url-form__field"
        :status="error ? 'error' : 'default'"
        :disabled="entryDisabled"
      >
        <template #label>Paste a link to a source</template>
        <template #description>
          <span v-if="error" class="source-url-form__error" role="alert">{{ error }}</span>
        </template>

        <div class="source-url-form__controls">
          <CdxTextInput
            id="source-url"
            class="source-url-form__input"
            :model-value="modelValue"
            input-type="url"
            autocomplete="url"
            :status="error ? 'error' : 'default'"
            :disabled="entryDisabled"
            :aria-invalid="error ? 'true' : undefined"
            @update:model-value="emit('update:modelValue', String($event))"
          />
          <CdxButton
            class="source-url-form__add"
            action="progressive"
            type="submit"
            aria-label="Add source"
            :disabled="entryDisabled"
          >
            <CdxIcon :icon="cdxIconAdd" />
            <span class="source-url-form__add-label">Add source</span>
          </CdxButton>
        </div>
      </CdxField>
    </form>

    <ul v-if="sources.length" class="source-url-form__sources" aria-label="Added sources">
      <li v-for="source in sources" :key="source.url" class="source-url-form__source">
        <div class="source-url-form__source-copy">
          <strong class="source-url-form__domain">{{ source.domain }}</strong>
          <span class="source-url-form__url">{{ source.url }}</span>
        </div>
        <CdxButton
          class="source-url-form__remove"
          weight="quiet"
          type="button"
          :aria-label="`Remove source from ${source.domain}: ${source.url}`"
          @click="emit('remove', source.url)"
        >
          Remove
        </CdxButton>
      </li>
    </ul>

    <p class="source-url-form__progress" role="status" aria-live="polite">
      {{ sources.length }} of {{ requiredCount }} sources added
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CdxButton, CdxField, CdxIcon, CdxTextInput } from '@wikimedia/codex'
import { cdxIconAdd } from '@wikimedia/codex-icons'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    required: true,
  },
  sources: {
    type: Array,
    required: true,
  },
  requiredCount: {
    type: Number,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'remove'])
const entryDisabled = computed(() => props.disabled || props.sources.length >= props.requiredCount)
</script>

<style scoped>
.source-url-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
}

.source-url-form__controls {
  display: flex;
  align-items: stretch;
}

.source-url-form__input {
  min-width: 0;
  flex: 1;
}

.source-url-form__input :deep(.cdx-text-input__input) {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}

.source-url-form__add {
  flex: 0 0 auto;
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}

.source-url-form__add-label {
  display: none;
}

.source-url-form__error {
  color: var(--color-error);
}

.source-url-form__sources {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-50);
  list-style: none;
}

.source-url-form__source {
  min-width: 0;
  padding: var(--spacing-75);
  display: flex;
  align-items: center;
  gap: var(--spacing-75);
  border: var(--border-subtle);
  border-radius: var(--border-radius-base);
}

.source-url-form__source-copy {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-12);
}

.source-url-form__domain {
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.source-url-form__url {
  overflow-wrap: anywhere;
  color: var(--color-subtle);
  font-size: var(--font-size-x-small);
  line-height: var(--line-height-x-small);
}

.source-url-form__remove {
  flex: 0 0 auto;
}

.source-url-form__progress {
  margin: 0;
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

@media (min-width: 640px) {
  .source-url-form__controls {
    gap: var(--spacing-50);
  }

  .source-url-form__input :deep(.cdx-text-input__input) {
    border-radius: var(--border-radius-base);
  }

  .source-url-form__add {
    border-radius: var(--border-radius-base);
  }

  .source-url-form__add-label {
    display: inline;
    margin-left: var(--spacing-25);
  }
}
</style>
