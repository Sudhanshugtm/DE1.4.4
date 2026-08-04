<template>
  <div class="verified-facts-reference-list">
    <p class="verified-facts-reference-list__intro">
      Referenced information from Wikidata. Check the source before using it.
    </p>

    <section :aria-labelledby="headingId">
      <h3 :id="headingId" class="verified-facts-reference-list__heading">For your reference</h3>

      <article
        v-for="fact in facts"
        :key="fact.id"
        class="verified-facts-reference-list__fact"
        :aria-labelledby="`verified-fact-${fact.id}`"
      >
        <p :id="`verified-fact-${fact.id}`" class="verified-facts-reference-list__label">
          {{ fact.label }}
        </p>
        <p class="verified-facts-reference-list__value">{{ fact.value }}</p>
        <p class="verified-facts-reference-list__qualification">{{ fact.qualification }}</p>

        <div class="verified-facts-reference-list__provenance">
          <span>
            {{ fact.referenceCount }}
            {{ fact.referenceCount === 1 ? 'reference' : 'references' }}
          </span>
          <a
            class="verified-facts-reference-list__link"
            :href="fact.claimUrl"
            target="_blank"
            rel="noopener"
            :aria-label="`View this statement on Wikidata: ${fact.label} (opens in a new tab)`"
          >
            View this statement on Wikidata
          </a>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { useId } from 'vue'

defineProps({
  facts: {
    type: Array,
    required: true,
  },
})

const headingId = useId()
</script>

<style scoped>
.verified-facts-reference-list {
  color: var(--color-base, #202122);
}

.verified-facts-reference-list__intro {
  margin: 0 0 var(--spacing-100, 16px);
  color: var(--color-subtle, #54595d);
  font-size: var(--font-size-medium, 16px);
  line-height: var(--line-height-medium, 26px);
}

.verified-facts-reference-list__heading {
  margin: 0 0 var(--spacing-75, 12px);
  font-size: var(--font-size-small, 14px);
  font-weight: var(--font-weight-semi-bold, 600);
  line-height: var(--line-height-small, 22px);
}

.verified-facts-reference-list__fact {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--spacing-75, 12px);
  padding: var(--spacing-100, 16px);
  border: var(--border-width-base, 1px) var(--border-style-base, solid)
    var(--border-color-subtle, #c8ccd1);
  border-radius: calc(var(--border-radius-base, 2px) * 4);
  background-color: var(--background-color-base, #fff);
  overflow-wrap: anywhere;
}

.verified-facts-reference-list__fact + .verified-facts-reference-list__fact {
  margin-top: var(--spacing-75, 12px);
}

.verified-facts-reference-list__label,
.verified-facts-reference-list__value,
.verified-facts-reference-list__qualification {
  margin: 0;
}

.verified-facts-reference-list__label {
  color: var(--color-subtle, #54595d);
  font-size: var(--font-size-small, 14px);
  font-weight: var(--font-weight-semi-bold, 600);
  line-height: var(--line-height-small, 22px);
}

.verified-facts-reference-list__value {
  font-size: var(--font-size-medium, 16px);
  font-weight: var(--font-weight-semi-bold, 600);
  line-height: var(--line-height-medium, 26px);
}

.verified-facts-reference-list__qualification,
.verified-facts-reference-list__provenance {
  color: var(--color-subtle, #54595d);
  font-size: var(--font-size-small, 14px);
  line-height: var(--line-height-small, 22px);
}

.verified-facts-reference-list__provenance {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-50, 8px) var(--spacing-75, 12px);
  padding-top: var(--spacing-75, 12px);
  border-top: var(--border-width-base, 1px) var(--border-style-base, solid)
    var(--border-color-subtle, #c8ccd1);
}

.verified-facts-reference-list__link {
  color: var(--color-progressive, #36c);
  text-decoration: underline;
}

.verified-facts-reference-list__link:hover {
  text-decoration: underline;
}

.verified-facts-reference-list__link:focus-visible {
  outline: var(--border-width-thick, 2px) var(--border-style-base, solid)
    var(--outline-color-progressive--focus, #36c);
  outline-offset: var(--spacing-12, 2px);
}
</style>
