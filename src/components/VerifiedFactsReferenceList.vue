<template>
  <div class="verified-facts-reference-list">
    <p class="verified-facts-reference-list__intro">{{ summary }}</p>

    <section
      v-for="group in groupedFacts"
      :key="group.key"
      class="verified-facts-reference-list__section"
      :aria-labelledby="group.headingId"
    >
      <h3 :id="group.headingId" class="verified-facts-reference-list__heading">
        {{ group.sectionLabel }}
      </h3>

      <article
        v-for="fact in group.facts"
        :id="`verified-fact-${fact.id}`"
        :key="fact.id"
        class="verified-facts-reference-list__fact"
        :aria-labelledby="`verified-fact-${fact.id}-heading`"
      >
        <h4 :id="`verified-fact-${fact.id}-heading`" class="verified-facts-reference-list__label">
          {{ fact.fieldLabel }}
        </h4>
        <p class="verified-facts-reference-list__value" :lang="fact.valueLanguage || undefined">
          {{ fact.value }}
        </p>
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
            :aria-label="`View this statement on Wikidata: ${fact.fieldLabel} (opens in a new tab)`"
          >
            View this statement on Wikidata
          </a>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  facts: {
    type: Array,
    required: true,
  },
  outlineLabel: {
    type: String,
    required: true,
  },
})

const summary = computed(() => {
  const noun = props.facts.length === 1 ? 'fact' : 'facts'
  return `${props.facts.length} referenced ${noun} matched to the ${props.outlineLabel} outline. Check each source before using it.`
})

const groupedFacts = computed(() => {
  const groups = new Map()
  for (const fact of props.facts) {
    const key = `${fact.outlineId}:${fact.sectionId}`
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        headingId: `verified-facts-section-${fact.outlineId}-${fact.sectionId}-heading`,
        sectionLabel: fact.sectionLabel,
        facts: [],
      })
    }
    groups.get(key).facts.push(fact)
  }
  return [...groups.values()]
})
</script>

<style scoped>
.verified-facts-reference-list {
  color: var(--color-base);
}

.verified-facts-reference-list__intro {
  margin: 0 0 var(--spacing-100);
  color: var(--color-subtle);
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.verified-facts-reference-list__section + .verified-facts-reference-list__section {
  margin-top: var(--spacing-100);
}

.verified-facts-reference-list__heading {
  margin: 0 0 var(--spacing-75);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  line-height: var(--line-height-small);
}

.verified-facts-reference-list__fact {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--spacing-75);
  padding: var(--spacing-100);
  border: var(--border-width-base) var(--border-style-base) var(--border-color-subtle);
  border-radius: calc(var(--border-radius-base) * 4);
  background-color: var(--background-color-base);
  overflow-wrap: anywhere;
}

.verified-facts-reference-list__fact + .verified-facts-reference-list__fact {
  margin-top: var(--spacing-75);
}

.verified-facts-reference-list__label,
.verified-facts-reference-list__value,
.verified-facts-reference-list__qualification {
  margin: 0;
}

.verified-facts-reference-list__label {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);
  line-height: var(--line-height-small);
}

.verified-facts-reference-list__value {
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-semi-bold);
  line-height: var(--line-height-medium);
}

.verified-facts-reference-list__qualification,
.verified-facts-reference-list__provenance {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.verified-facts-reference-list__provenance {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-50) var(--spacing-75);
  padding-top: var(--spacing-75);
  border-top: var(--border-width-base) var(--border-style-base) var(--border-color-subtle);
}

.verified-facts-reference-list__link,
.verified-facts-reference-list__link:hover {
  color: var(--color-progressive);
  text-decoration: underline;
}

.verified-facts-reference-list__link:focus-visible {
  outline: var(--border-width-thick) var(--border-style-base)
    var(--outline-color-progressive--focus);
  outline-offset: var(--spacing-12);
}
</style>
