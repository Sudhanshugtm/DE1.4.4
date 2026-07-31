import { journeysByKey } from '../data/explorationJourneys.js'
import { STEPS, canEnterStep, findSubject } from './preEditorFlow.js'

const CANONICAL_SOURCE_ORIGIN = 'redlink'
const CANONICAL_VARIANT = 'toolbar-outline'
const SETUP_QUERY_KEYS = Object.freeze(['step', 'journey', 'title', 'sourceOrigin', 'variant'])
const VALID_STEPS = new Set(Object.values(STEPS))

const readScalar = (value) => (typeof value === 'string' ? value : null)

const readFirstString = (value) => {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.find((entry) => typeof entry === 'string') ?? null
  }
  return null
}

const canonicalTitle = (journey, value) => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed || findSubject(journey, trimmed)) {
    return journey.subject.title
  }
  return trimmed
}

const buildSetupQuery = (journey, step = STEPS.SUBJECT, title = journey.subject.title) => ({
  step,
  journey: journey.key,
  title: canonicalTitle(journey, title),
  sourceOrigin: CANONICAL_SOURCE_ORIGIN,
  variant: CANONICAL_VARIANT,
})

const isCanonicalQuery = (query, canonicalQuery) => {
  const queryKeys = Object.keys(query)
  return (
    queryKeys.length === SETUP_QUERY_KEYS.length &&
    SETUP_QUERY_KEYS.every((key) => Object.hasOwn(query, key) && query[key] === canonicalQuery[key])
  )
}

const articleRecovery = () => ({
  kind: 'article',
  journey: null,
  step: null,
  titleInput: '',
  canonicalQuery: null,
  needsReplace: true,
  resetFlow: true,
})

const resolveSetupRoute = (query, flowState = null) => {
  const journeyKey = readScalar(query.journey)
  const journey = journeyKey ? journeysByKey[journeyKey] : null
  if (!journey) {
    return articleRecovery()
  }

  const routeTitle = canonicalTitle(journey, readFirstString(query.title))
  const routeStep = readScalar(query.step)
  const hasValidStep = VALID_STEPS.has(routeStep)
  let step = hasValidStep ? routeStep : STEPS.SUBJECT
  let titleInput = hasValidStep ? routeTitle : journey.subject.title
  let resetFlow = !hasValidStep

  if (flowState && flowState.journeyKey !== journey.key) {
    resetFlow = true
  }

  if (step !== STEPS.SUBJECT) {
    const hasMatchingTitle = Boolean(findSubject(journey, titleInput))
    const hasReadyState =
      flowState?.journeyKey === journey.key && hasMatchingTitle && canEnterStep(flowState, step)

    if (!hasReadyState) {
      step = STEPS.SUBJECT
      titleInput = journey.subject.title
      resetFlow = true
    }
  }

  const canonicalQuery = buildSetupQuery(journey, step, titleInput)

  return {
    kind: 'setup',
    journey,
    step,
    titleInput,
    canonicalQuery,
    needsReplace: !isCanonicalQuery(query, canonicalQuery),
    resetFlow,
  }
}

export {
  CANONICAL_SOURCE_ORIGIN,
  CANONICAL_VARIANT,
  SETUP_QUERY_KEYS,
  buildSetupQuery,
  resolveSetupRoute,
}
