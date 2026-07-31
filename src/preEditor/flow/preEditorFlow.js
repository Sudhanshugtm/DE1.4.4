import { personJourney } from '../data/personJourney.js'

const STEPS = Object.freeze({
  SUBJECT: 'subject',
  SOURCES: 'sources',
  GUIDANCE: 'guidance',
})

const SOURCE_ERRORS = Object.freeze({
  INVALID: 'Enter a valid URL',
  DUPLICATE: 'This source has already been added',
})

const createFlowState = (fixture, initialTitle = fixture.subject.title) => ({
  step: STEPS.SUBJECT,
  titleInput: initialTitle,
  selectedSubject: null,
  sources: [],
  requiredSourceCount: fixture.sourceRequirements.requiredCount,
})

const findSubject = (fixture, title) => {
  if (typeof title !== 'string') {
    return null
  }

  return title.trim().toLowerCase() === fixture.subject.title.toLowerCase() ? fixture.subject : null
}

const validateSourceUrl = (value, existingSources = []) => {
  if (typeof value !== 'string' || !value.trim()) {
    return { valid: false, error: SOURCE_ERRORS.INVALID }
  }

  let parsedUrl
  try {
    parsedUrl = new URL(value.trim())
  } catch {
    return { valid: false, error: SOURCE_ERRORS.INVALID }
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, error: SOURCE_ERRORS.INVALID }
  }

  const url = parsedUrl.href
  const duplicate = existingSources.some(
    (source) => (typeof source === 'string' ? source : source.url) === url,
  )
  if (duplicate) {
    return { valid: false, error: SOURCE_ERRORS.DUPLICATE }
  }

  return { valid: true, source: { url, domain: parsedUrl.hostname } }
}

const addSource = (state, value) => {
  const result = validateSourceUrl(value, state.sources)
  if (!result.valid) {
    return { state, error: result.error }
  }

  return {
    state: { ...state, sources: [...state.sources, result.source] },
    error: '',
  }
}

const removeSource = (state, url) => ({
  ...state,
  sources: state.sources.filter((source) => source.url !== url),
})

const canEnterStep = (state, step) => {
  if (step === STEPS.SUBJECT) {
    return true
  }
  if (step === STEPS.SOURCES) {
    return Boolean(state.selectedSubject)
  }
  if (step === STEPS.GUIDANCE) {
    return Boolean(state.selectedSubject) && state.sources.length >= state.requiredSourceCount
  }
  return false
}

const buildEditorQuery = (state, fixture = personJourney) => {
  if (state.step !== STEPS.GUIDANCE || !canEnterStep(state, STEPS.GUIDANCE)) {
    throw new Error('A ready Guidance state is required to build the editor query')
  }

  return {
    ...fixture.handoff,
    title: state.selectedSubject.title,
    articleguidance: '1',
    sourceOrigin: 'redlink',
    source: state.sources.map((source) => source.url),
  }
}

export {
  SOURCE_ERRORS,
  STEPS,
  addSource,
  buildEditorQuery,
  canEnterStep,
  createFlowState,
  findSubject,
  removeSource,
  validateSourceUrl,
}
