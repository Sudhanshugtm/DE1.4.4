<!-- ABOUTME: Coordinates the in-memory Subject, Sources, and Guidance setup stages. -->
<!-- ABOUTME: Guards route history and hands a ready fixed Person journey to the existing editor. -->

<template>
  <ArticleGuidanceShell
    ref="shellRef"
    :step="currentStep"
    :heading="currentHeading"
    back-label="Back"
    @back="goBack"
  >
    <section v-if="currentStep === STEPS.SUBJECT" class="article-guidance-stage">
      <div class="article-guidance-field">
        <label class="article-guidance-field__label" for="article-title">Article title</label>
        <CdxTextInput
          id="article-title"
          :model-value="flowState.titleInput"
          autocomplete="off"
          @update:model-value="updateTitle"
        />
      </div>

      <section class="subject-results" aria-labelledby="subject-results-heading">
        <h2 id="subject-results-heading" class="article-guidance-stage__subheading">
          What is this?
        </h2>

        <CdxButton
          class="article-guidance-actions__back article-guidance-actions__back--subject"
          weight="quiet"
          type="button"
          @click="goBack"
        >
          Back
        </CdxButton>

        <button v-if="subjectResult" class="subject-result" type="button" @click="selectSubject">
          <span class="subject-result__title">
            <strong>{{ subjectResult.title }}</strong>
            <span> · {{ subjectResult.typeLabel }}</span>
          </span>
          <span class="subject-result__description">{{ subjectResult.description }}</span>
        </button>

        <p v-else-if="showNoResults" class="subject-results__empty" role="status">
          No subjects found for "{{ flowState.titleInput }}"
        </p>
      </section>
    </section>

    <section v-else-if="currentStep === STEPS.SOURCES" class="article-guidance-stage">
      <div class="article-guidance-subject" aria-label="Selected article subject">
        <strong>{{ personJourney.subject.title }}</strong>
        <CdxInfoChip>{{ personJourney.subject.typeLabel }}</CdxInfoChip>
      </div>

      <p class="article-guidance-stage__intro">
        Sources help readers check the facts and shows why this subject matters.
      </p>
      <p class="article-guidance-stage__requirement">
        Person articles on this wiki require sources.
      </p>

      <SourceUrlForm
        :model-value="sourceUrl"
        :error="sourceError"
        :sources="flowState.sources"
        :required-count="flowState.requiredSourceCount"
        :disabled="sourceEntryDisabled"
        @update:model-value="updateSourceUrl"
        @submit="submitSource"
        @remove="removeAcceptedSource"
      />

      <div class="article-guidance-actions">
        <CdxButton
          class="article-guidance-actions__back"
          weight="quiet"
          type="button"
          @click="goBack"
        >
          Back
        </CdxButton>
        <CdxButton
          class="article-guidance-actions__primary"
          action="progressive"
          weight="primary"
          type="button"
          :disabled="!sourcesComplete"
          @click="continueToGuidance"
        >
          Continue
        </CdxButton>
      </div>
    </section>

    <section v-else-if="currentStep === STEPS.GUIDANCE" class="article-guidance-stage">
      <div class="article-guidance-subject" aria-label="Selected article subject">
        <strong>{{ personJourney.subject.title }}</strong>
        <CdxInfoChip>{{ personJourney.subject.typeLabel }}</CdxInfoChip>
      </div>

      <p class="article-guidance-stage__intro">{{ personJourney.guidance.intro }}</p>
      <ul class="article-guidance-list">
        <li v-for="bullet in personJourney.guidance.bullets" :key="bullet">{{ bullet }}</li>
      </ul>

      <section class="source-guidance" aria-labelledby="recommended-sources-heading">
        <h2 id="recommended-sources-heading" class="article-guidance-stage__subheading">
          Recommended sources
        </h2>
        <ul class="article-guidance-list">
          <li v-for="source in personJourney.sourceRequirements.recommended" :key="source">
            {{ source }}
          </li>
        </ul>
      </section>

      <section class="source-guidance" aria-labelledby="discouraged-sources-heading">
        <h2 id="discouraged-sources-heading" class="article-guidance-stage__subheading">
          Sources to avoid
        </h2>
        <ul class="article-guidance-list">
          <li v-for="source in personJourney.sourceRequirements.discouraged" :key="source">
            {{ source }}
          </li>
        </ul>
      </section>

      <div class="article-guidance-actions">
        <CdxButton
          class="article-guidance-actions__back"
          weight="quiet"
          type="button"
          @click="goBack"
        >
          Back
        </CdxButton>
        <CdxButton
          class="article-guidance-actions__primary"
          action="progressive"
          weight="primary"
          type="button"
          @click="startWriting"
        >
          Start writing
        </CdxButton>
      </div>
    </section>
  </ArticleGuidanceShell>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CdxButton, CdxInfoChip, CdxTextInput } from '@wikimedia/codex'

import ArticleGuidanceShell from '../components/ArticleGuidanceShell.vue'
import SourceUrlForm from '../components/SourceUrlForm.vue'
import { personJourney } from '../data/personJourney.js'
import {
  STEPS,
  addSource,
  buildEditorQuery,
  canEnterStep,
  createFlowState,
  findSubject,
  removeSource,
} from '../flow/preEditorFlow.js'

const route = useRoute()
const router = useRouter()
const initialTitle =
  typeof route.query.title === 'string' ? route.query.title : personJourney.subject.title
const flowState = ref(createFlowState(personJourney, initialTitle))
const sourceUrl = ref('')
const sourceError = ref('')
const shellRef = ref(null)
const allowedSteps = new Set(Object.values(STEPS))

const currentStep = computed(() => (typeof route.query.step === 'string' ? route.query.step : ''))
const currentHeading = computed(() => {
  if (currentStep.value === STEPS.SOURCES) {
    return 'Add sources'
  }
  if (currentStep.value === STEPS.GUIDANCE) {
    return personJourney.guidance.heading
  }
  return 'New article'
})
const subjectResult = computed(() => findSubject(personJourney, flowState.value.titleInput))
const showNoResults = computed(
  () => flowState.value.titleInput.trim().length > 0 && !subjectResult.value,
)
const sourceEntryDisabled = computed(
  () => flowState.value.sources.length >= flowState.value.requiredSourceCount,
)
const sourcesComplete = computed(
  () => flowState.value.sources.length === flowState.value.requiredSourceCount,
)

function preservedSetupQuery(step) {
  const query = {
    step,
    title: typeof route.query.title === 'string' ? route.query.title : flowState.value.titleInput,
  }

  if (typeof route.query.source === 'string') {
    query.source = route.query.source
  }
  if (typeof route.query.variant === 'string') {
    query.variant = route.query.variant
  }

  return query
}

function replaceWithSubject() {
  return router.replace({
    name: 'article-guidance',
    query: preservedSetupQuery(STEPS.SUBJECT),
  })
}

function pushStep(step) {
  return router.push({
    name: 'article-guidance',
    query: {
      ...route.query,
      step,
      title: flowState.value.titleInput,
    },
  })
}

function updateTitle(value) {
  flowState.value = {
    ...flowState.value,
    step: STEPS.SUBJECT,
    titleInput: String(value),
    selectedSubject: null,
    sources: [],
  }
  sourceUrl.value = ''
  sourceError.value = ''
}

function selectSubject() {
  if (!subjectResult.value) {
    return
  }

  flowState.value = {
    ...flowState.value,
    step: STEPS.SOURCES,
    titleInput: subjectResult.value.title,
    selectedSubject: subjectResult.value,
  }
  pushStep(STEPS.SOURCES)
}

function updateSourceUrl(value) {
  sourceUrl.value = value
  sourceError.value = ''
}

function submitSource() {
  if (sourceEntryDisabled.value) {
    return
  }

  const result = addSource(flowState.value, sourceUrl.value)
  flowState.value = result.state
  sourceError.value = result.error

  if (!result.error) {
    sourceUrl.value = ''
  }
}

function removeAcceptedSource(normalizedUrl) {
  flowState.value = removeSource(flowState.value, normalizedUrl)
  sourceError.value = ''
}

function continueToGuidance() {
  if (!sourcesComplete.value || !canEnterStep(flowState.value, STEPS.GUIDANCE)) {
    return
  }

  flowState.value = { ...flowState.value, step: STEPS.GUIDANCE }
  pushStep(STEPS.GUIDANCE)
}

function getPreviousPath() {
  const previous = window.history.state?.back
  if (typeof previous !== 'string') {
    return ''
  }
  return new URL(previous, window.location.origin).pathname
}

function goBack() {
  if (currentStep.value !== STEPS.SUBJECT) {
    router.back()
    return
  }
  if (getPreviousPath().endsWith('/article')) {
    router.back()
  } else {
    router.replace({ name: 'article' })
  }
}

function startWriting() {
  flowState.value = { ...flowState.value, step: STEPS.GUIDANCE }
  router.push({
    name: 'editor',
    query: buildEditorQuery(flowState.value, personJourney),
  })
}

watch(
  () => route.query.step,
  async (routeStep) => {
    const requestedStep = typeof routeStep === 'string' ? routeStep : ''

    if (!allowedSteps.has(requestedStep)) {
      await replaceWithSubject()
      return
    }
    if (!canEnterStep(flowState.value, requestedStep)) {
      await replaceWithSubject()
      return
    }

    flowState.value = { ...flowState.value, step: requestedStep }
    await nextTick()
    shellRef.value?.focusHeading()
  },
  { immediate: true, flush: 'post' },
)
</script>

<style scoped>
.article-guidance-stage {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
}

.article-guidance-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-25);
}

.article-guidance-field__label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-small);
}

.subject-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

.article-guidance-stage__subheading {
  margin: var(--spacing-50) 0 0;
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-medium);
}

.subject-result {
  width: 100%;
  padding: var(--spacing-100);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-25);
  border: var(--border-base);
  border-radius: var(--border-radius-base);
  background-color: var(--background-color-base);
  color: var(--color-base);
  font: inherit;
  text-align: left;
  cursor: var(--cursor-base--hover);
}

.subject-result:hover {
  border-color: var(--border-color-progressive--hover);
  background-color: var(--background-color-interactive-subtle);
}

.subject-result:active {
  border-color: var(--border-color-progressive--active);
  background-color: var(--background-color-interactive-subtle--active);
}

.subject-result:focus-visible {
  border-color: var(--border-color-progressive--focus);
  outline: var(--border-width-thick) var(--border-style-base)
    var(--outline-color-progressive--focus);
  outline-offset: var(--spacing-12);
}

.subject-result__title {
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.subject-result__description,
.subject-results__empty,
.article-guidance-stage__intro,
.article-guidance-stage__requirement {
  margin: 0;
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.subject-result__description,
.subject-results__empty,
.article-guidance-stage__intro {
  color: var(--color-subtle);
}

.article-guidance-stage__requirement {
  font-weight: var(--font-weight-bold);
}

.article-guidance-subject {
  padding-bottom: var(--spacing-100);
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
  border-bottom: var(--border-subtle);
}

.article-guidance-list {
  margin: 0;
  padding-left: var(--spacing-150);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-50);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.source-guidance {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-75);
}

.article-guidance-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-50);
  padding-top: var(--spacing-100);
}

.article-guidance-actions__back {
  display: none;
}

.article-guidance-actions__primary {
  width: 100%;
}

@media (min-width: 640px) {
  .article-guidance-actions {
    flex-direction: row;
    align-items: center;
  }

  .article-guidance-actions__back {
    display: inline-flex;
  }

  .article-guidance-actions__back--subject {
    align-self: flex-start;
  }

  .article-guidance-actions__primary {
    width: auto;
  }
}
</style>
