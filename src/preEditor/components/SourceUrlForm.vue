<!-- ABOUTME: Renders the controlled source URL form, accepted source list, and progress. -->
<!-- ABOUTME: Keeps source validation and state transitions in its parent coordinator. -->

<template>
  <div class="source-url-form">
    <form class="source-url-form__form" novalidate @submit.prevent="emit('submit')">
      <div class="source-url-form__controls">
        <CdxTextInput
          id="source-url"
          class="source-url-form__input"
          :model-value="modelValue"
          input-type="url"
          autocomplete="url"
          clearable
          aria-label="Paste a link to a source"
          placeholder="Paste a link to a source"
          :status="error ? 'error' : 'default'"
          :disabled="entryDisabled"
          :aria-invalid="error ? 'true' : undefined"
          @update:model-value="emit('update:modelValue', String($event))"
        />
        <CdxButton
          class="source-url-form__add"
          type="submit"
          aria-label="Add source"
          :disabled="entryDisabled || !modelValue.trim()"
        >
          <CdxIcon :icon="cdxIconAdd" />
          <span class="source-url-form__add-label">Add source</span>
        </CdxButton>
      </div>
    </form>

    <ul v-if="sources.length" class="source-url-form__sources" aria-label="Added sources">
      <li v-for="source in sources" :key="source.url" class="source-url-form__source-item">
        <CdxMessage
          type="notice"
          class="source-url-form__source"
          allow-user-dismiss
          :dismiss-button-label="`Remove source from ${source.domain}: ${source.url}`"
          @user-dismissed="emit('remove', source.url)"
        >
          <p class="source-url-form__domain">{{ source.domain }}</p>
        </CdxMessage>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CdxButton, CdxIcon, CdxMessage, CdxTextInput } from '@wikimedia/codex'
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
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'remove'])
const entryDisabled = computed(() => props.disabled)
</script>

<style scoped>
.source-url-form {
  display: flex;
  flex-direction: column;
}

.source-url-form__controls {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: var(--spacing-25);
  border: var(--border-base);
  border-radius: var(--border-radius-base);
  background-color: var(--background-color-base);
}

.source-url-form__controls:focus-within {
  border-color: var(--border-color-progressive--focus);
}

.source-url-form__input {
  min-width: 0;
  flex: 1;
}

.source-url-form__input :deep(.cdx-text-input__input) {
  border: 0;
  border-radius: 0;
  background: transparent;
}

.source-url-form__input :deep(.cdx-text-input__input:focus) {
  box-shadow: none;
  outline: 0;
}

.source-url-form__add {
  flex: 0 0 auto;
  border: 0;
  border-inline-start: var(--border-base);
  border-radius: 0 var(--border-radius-base) var(--border-radius-base) 0;
  background-color: var(--background-color-neutral-subtle);
}

.source-url-form__add:hover:not(:disabled) {
  background-color: var(--background-color-interactive);
}

.source-url-form__add:disabled {
  background-color: var(--background-color-neutral-subtle);
}

.source-url-form__add-label {
  display: none;
}

.source-url-form__sources {
  margin-top: var(--spacing-50);
  margin-bottom: 0;
  padding: 0;
  list-style: none;
}

.source-url-form__source-item {
  margin: 0;
  padding: 0;
}

.source-url-form__source.cdx-message {
  padding: var(--spacing-75) 0;
  border: 0;
  border-bottom: var(--border-subtle);
  border-radius: 0;
  background-color: var(--background-color-base);
}

.source-url-form__source :deep(.cdx-message__content) {
  min-width: 0;
}

.source-url-form__domain {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-small);
}

@media (min-width: 1120px) {
  .source-url-form__controls {
    border: 0;
    border-radius: 0;
    background-color: transparent;
    gap: var(--spacing-50);
  }

  .source-url-form__input {
    border: var(--border-base);
    border-radius: var(--border-radius-base);
    background-color: var(--background-color-base);
  }

  .source-url-form__input:focus-within {
    border-color: var(--border-color-progressive--focus);
  }

  .source-url-form__input :deep(.cdx-text-input__input) {
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .source-url-form__add {
    border: var(--border-base);
    border-radius: var(--border-radius-base);
  }

  .source-url-form__add-label {
    display: inline;
    margin-left: var(--spacing-25);
  }
}
</style>
