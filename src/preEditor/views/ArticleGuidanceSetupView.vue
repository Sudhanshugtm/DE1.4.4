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
      <CdxTextInput
        id="article-title"
        class="article-guidance-search-input"
        :model-value="flowState.titleInput"
        autocomplete="off"
        aria-label="Article title"
        placeholder="Article title"
        @update:model-value="updateTitle"
      />

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

        <!-- The list mirrors Special:NewArticle results: the subject plus the
             other things Wikidata would return for the same words. Only the
             subject continues; the rest are context, like the article's blue
             links. -->
        <div v-if="subjectResult" class="subject-results__list">
          <CdxCard
            v-for="result in searchResults"
            :key="`${result.title}-${result.description}`"
            class="subject-result"
            :class="{ 'subject-result--interactive': result.interactive }"
            :role="result.interactive ? 'button' : undefined"
            :tabindex="result.interactive ? 0 : undefined"
            :thumbnail="result.thumbnail?.url ? { url: result.thumbnail.url } : {}"
            :aria-label="
              result.interactive
                ? `${result.title} · ${result.typeLabel} ${result.description}`
                : undefined
            "
            @click="result.interactive && selectSubject()"
            @keydown.enter.prevent="result.interactive && selectSubject()"
            @keydown.space.prevent="result.interactive && selectSubject()"
          >
            <template #title>
              <span class="subject-result__title">
                <strong>{{ result.title }}</strong>
                <template v-if="result.typeLabel">
                  <span class="subject-result__separator">·</span>
                  <span class="subject-result__type">{{ result.typeLabel }}</span>
                </template>
              </span>
            </template>
            <template #description>
              <span class="subject-result__description">{{ result.description }}</span>
            </template>
          </CdxCard>
        </div>

        <p v-else-if="showNoResults" class="subject-results__empty" role="status">
          No subjects found for "{{ flowState.titleInput }}"
        </p>

        <p v-if="subjectResult" class="subject-results__browse">
          None of these?
          <CdxButton weight="quiet" action="progressive" class="subject-results__browse-link">
            Pick a type instead
          </CdxButton>
        </p>
      </section>
    </section>

    <section v-else-if="currentStep === STEPS.SOURCES" class="article-guidance-stage">
      <ArticleGuidanceArticleInfo
        :title="activeJourney.subject.title"
        :type-label="activeJourney.subject.typeLabel"
        @edit="editArticleTitle"
      />

      <div class="article-guidance-sources">
        <div class="article-guidance-sources__main">
          <h3 class="article-guidance-sources__heading">Add sources (optional)</h3>
          <p class="article-guidance-sources__subtitle">
            If you have sources ready, add them now. You can also add citations while writing.
          </p>

          <SourceUrlForm
            :model-value="sourceUrl"
            :error="sourceError"
            :sources="flowState.sources"
            @update:model-value="updateSourceUrl"
            @submit="submitSource"
            @remove="removeAcceptedSource"
          />
        </div>

        <ArticleGuidanceSourceTips
          :type-label="activeJourney.subject.typeLabel"
          :recommended="sourceRecommendations"
        />

        <div class="article-guidance-actions article-guidance-actions--sources">
          <span class="article-guidance-actions__helper" role="status" aria-live="polite">
            {{ sourceHelperText }}
          </span>
          <div class="article-guidance-actions__right">
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
              @click="continueToGuidance"
            >
              Continue
            </CdxButton>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="currentStep === STEPS.GUIDANCE" class="article-guidance-stage">
      <ArticleGuidanceArticleInfo
        :title="activeJourney.subject.title"
        :type-label="activeJourney.subject.typeLabel"
        @edit="editArticleTitle"
      />

      <h4 class="article-guidance-guidance__heading">
        {{ activeGuidance.guidanceHeading }}
      </h4>
      <div class="article-guidance-guidance__card">
        <p class="article-guidance-guidance__intro">{{ activeGuidance.guidanceIntro }}</p>
        <ul class="article-guidance-list">
          <li v-for="bullet in activeGuidance.guidanceBullets" :key="bullet">{{ bullet }}</li>
        </ul>
      </div>

      <div class="article-guidance-actions article-guidance-actions--guidance">
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
import { CdxButton, CdxCard, CdxTextInput } from '@wikimedia/codex'

import ArticleGuidanceArticleInfo from '../components/ArticleGuidanceArticleInfo.vue'
import ArticleGuidanceShell from '../components/ArticleGuidanceShell.vue'
import ArticleGuidanceSourceTips from '../components/ArticleGuidanceSourceTips.vue'
import SourceUrlForm from '../components/SourceUrlForm.vue'
import {
  guidanceProfilesByOutline,
  journeysByKey,
  sourceProfilesByOutline,
} from '../data/explorationJourneys.js'
import {
  STEPS,
  addSource,
  buildEditorQuery,
  canEnterStep,
  createFlowState,
  findSubject,
  removeSource,
} from '../flow/preEditorFlow.js'
import { buildSetupQuery, resolveSetupRoute } from '../flow/setupRoute.js'

const route = useRoute()
const router = useRouter()
const defaultJourney = journeysByKey['person-neil-armstrong']
const activeJourney = ref(defaultJourney)
const flowState = ref(createFlowState(defaultJourney))
const sourceUrl = ref('')
const sourceError = ref('')
const shellRef = ref(null)

const currentStep = computed(() => flowState.value.step)
const currentHeading = computed(() => 'New article')
const subjectResult = computed(() => findSubject(activeJourney.value, flowState.value.titleInput))
// The subject leads the list, the way the best outline match ranks first in
// Special:NewArticle; the journey's decoys fill out the rest.
const searchResults = computed(() => {
  if (!subjectResult.value) return []
  return [
    { ...subjectResult.value, interactive: true },
    ...(activeJourney.value.decoys ?? []).map((decoy) => ({ ...decoy, interactive: false })),
  ]
})
const activeGuidance = computed(
  () => guidanceProfilesByOutline[activeJourney.value.guidanceProfileKey],
)
const sourceRecommendations = computed(() => [
  sourceProfilesByOutline[activeJourney.value.sourceRequirements.profileKey].sourceTip,
])
const showNoResults = computed(
  () => flowState.value.titleInput.trim().length > 0 && !subjectResult.value,
)
const sourceHelperText = computed(() => {
  const sourceCount = flowState.value.sources.length
  if (sourceCount === 0) {
    return 'You can continue without adding a source.'
  }
  if (sourceCount === 1) {
    return '1 source added. You can add more while writing.'
  }
  return `${sourceCount} sources added. You can add more while writing.`
})

function pushStep(step) {
  return router.push({
    name: 'article-guidance',
    query: buildSetupQuery(activeJourney.value, step, flowState.value.titleInput),
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

function editArticleTitle() {
  flowState.value = { ...flowState.value, step: STEPS.SUBJECT }
  pushStep(STEPS.SUBJECT)
}

function continueToGuidance() {
  if (!canEnterStep(flowState.value, STEPS.GUIDANCE)) {
    return
  }

  sourceUrl.value = ''
  sourceError.value = ''
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
    query: buildEditorQuery(flowState.value, activeJourney.value),
  })
}

watch(
  () => route.fullPath,
  async () => {
    const resolution = resolveSetupRoute(route.query, flowState.value)
    if (resolution.kind === 'article') {
      await router.replace({ name: 'article' })
      return
    }

    if (resolution.resetFlow || activeJourney.value.key !== resolution.journey.key) {
      activeJourney.value = resolution.journey
      flowState.value = createFlowState(resolution.journey, resolution.titleInput)
      sourceUrl.value = ''
      sourceError.value = ''
    }

    if (resolution.needsReplace) {
      await router.replace({ name: 'article-guidance', query: resolution.canonicalQuery })
      return
    }

    activeJourney.value = resolution.journey
    flowState.value = {
      ...flowState.value,
      step: resolution.step,
      titleInput: resolution.titleInput,
    }
    await nextTick()
    shellRef.value?.focusHeading()
  },
  { immediate: true, flush: 'post' },
)
</script>

<style scoped>
.article-guidance-search-input {
  width: 100%;
}

.article-guidance-search-input :deep(.cdx-text-input__input) {
  border-top: 0;
  border-right: 0;
  border-bottom: var(--border-base);
  border-left: 0;
  border-radius: 0;
  box-shadow: none;
  caret-color: var(--color-progressive);
  font-family: var(--font-family-heading-main);
  font-size: var(--font-size-x-large);
  line-height: var(--line-height-x-large);
  outline: 0;
}

.article-guidance-search-input :deep(.cdx-text-input__input:hover) {
  border-top: 0;
  border-right: 0;
  border-bottom: var(--border-base);
  border-left: 0;
  box-shadow: none;
}

.article-guidance-search-input :deep(.cdx-text-input__input:focus),
.article-guidance-search-input :deep(.cdx-text-input__input:focus-visible) {
  border-top: 0;
  border-right: 0;
  border-bottom: var(--border-width-thick) var(--border-style-base)
    var(--border-color-progressive--focus);
  border-left: 0;
  box-shadow: none;
  outline: 0;
}

.article-guidance-search-input :deep(.cdx-text-input__input::placeholder) {
  color: var(--color-subtle);
  opacity: var(--opacity-medium);
}

.subject-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-50);
  margin-top: var(--spacing-100);
}

.article-guidance-stage__subheading {
  margin: 0;
  font-size: var(--font-size-x-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-x-large);
}

.subject-results__list {
  display: grid;
  gap: var(--spacing-75, 12px);
}

.subject-result.cdx-card {
  width: 100%;
}

.subject-result.cdx-card {
  transition: background-color var(--transition-duration-medium);
}

/* Only the card that continues the flow behaves like a control; the other
   results sit inert, the way ArticleCard gates all affordances behind its
   `interactive` prop. */
.subject-result--interactive.cdx-card {
  cursor: var(--cursor-base--hover);
}

.subject-result--interactive:hover {
  background-color: var(--background-color-interactive-subtle);
}

.subject-result--interactive:active {
  background-color: var(--background-color-interactive);
}

.subject-result--interactive:focus-visible {
  outline: var(--border-width-thick) var(--border-style-base)
    var(--outline-color-progressive--focus);
  outline-offset: var(--spacing-25);
}

.subject-result :deep(.cdx-thumbnail__placeholder .cdx-icon) {
  opacity: 0.3;
}

.subject-result__title {
  display: inline;
}

.subject-result__separator {
  margin: 0 var(--spacing-25);
}

.subject-result__separator,
.subject-result__type {
  color: var(--color-placeholder);
  opacity: var(--opacity-medium);
}

.subject-result__description,
.subject-results__empty {
  margin: 0;
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.subject-result__description,
.subject-results__empty {
  color: var(--color-subtle);
}

/* "None of these?" browse line, as under the Special:NewArticle results. The
   type browser itself is outside this prototype's journeys. */
.subject-results__browse {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-25);
  margin: var(--spacing-100) 0 0;
  color: var(--color-base);
}

.subject-results__browse-link.cdx-button {
  padding: 0;
  min-height: auto;
  font-size: inherit;
  font-weight: var(--font-weight-normal);
}

.article-guidance-sources {
  display: grid;
  gap: 0;
}

.article-guidance-sources__main {
  min-width: 0;
}

.article-guidance-sources__heading {
  margin: 0 0 var(--spacing-25);
  border: 0;
  color: var(--color-base);
  font-size: var(--font-size-x-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-x-large);
}

.article-guidance-sources__subtitle {
  margin: 0 0 var(--spacing-100);
  color: var(--color-subtle);
}

.article-guidance-list {
  margin: 0;
  padding-left: var(--spacing-150);
  color: var(--color-base);
  line-height: var(--line-height-medium);
}

.article-guidance-list li + li {
  margin-top: var(--spacing-50);
}

.article-guidance-actions {
  display: flex;
  margin-top: var(--spacing-200);
}

.article-guidance-actions--sources {
  flex-direction: column-reverse;
  gap: var(--spacing-50);
  padding-top: var(--spacing-100);
  border-top: var(--border-subtle);
}

.article-guidance-actions__right {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-50);
}

.article-guidance-actions__helper {
  color: var(--color-placeholder);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
  text-align: center;
}

.article-guidance-actions__right .article-guidance-actions__back,
.article-guidance-actions--guidance .article-guidance-actions__back,
.article-guidance-actions__back--subject {
  display: none;
}

.article-guidance-actions__primary {
  width: 100%;
  max-width: 400px;
}

.article-guidance-guidance__heading {
  margin: 0 0 var(--spacing-25);
  border: 0;
  color: var(--color-emphasized);
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-large);
}

.article-guidance-guidance__intro {
  margin: 0 0 var(--spacing-75);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.article-guidance-actions--guidance {
  position: sticky;
  bottom: 0;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-50);
  padding: var(--spacing-100) 0;
  background-color: var(--background-color-base);
}

@media (min-width: 1120px) {
  .article-guidance-sources {
    grid-template-areas:
      'main tips'
      'actions tips';
    grid-template-columns: minmax(0, 1fr) minmax(0, 22em);
    column-gap: var(--spacing-200);
    row-gap: 0;
    align-items: start;
  }

  .article-guidance-sources__main {
    grid-area: main;
  }

  .article-guidance-sources > :deep(.article-guidance-source-tips) {
    grid-area: tips;
  }

  .article-guidance-actions--sources {
    grid-area: actions;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-100);
    padding-top: 0;
    border-top: 0;
  }

  .article-guidance-actions__right {
    width: auto;
    flex-direction: row;
  }

  .article-guidance-actions__right .article-guidance-actions__back,
  .article-guidance-actions--guidance .article-guidance-actions__back,
  .article-guidance-actions__back--subject {
    display: inline-flex;
  }

  .article-guidance-actions__back--subject {
    align-self: flex-start;
  }

  .article-guidance-actions__primary {
    width: auto;
    max-width: none;
  }

  .article-guidance-actions__helper {
    text-align: left;
  }

  .article-guidance-guidance__card {
    padding: var(--spacing-150);
    border: var(--border-subtle);
    border-radius: var(--border-radius-base);
    background-color: var(--background-color-neutral-subtle);
  }

  .article-guidance-guidance__intro {
    display: none;
  }

  .article-guidance-actions--guidance {
    position: static;
    flex-direction: row;
    justify-content: flex-end;
    padding: var(--spacing-100) 0;
  }
}
</style>
