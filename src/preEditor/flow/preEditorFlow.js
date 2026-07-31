import personJourney from '../data/personJourney.js'

const STEPS = Object.freeze({
  SUBJECT: 'subject',
  SOURCES: 'sources',
  GUIDANCE: 'guidance',
})

const SOURCE_ERRORS = Object.freeze({
  INVALID: 'Enter a valid URL',
  DUPLICATE: 'This source has already been added',
})

const createFlowState = (fixture = personJourney) => ({
  step: STEPS.SUBJECT,
  titleInput: '',
  selectedSubject: null,
  sources: [],
  requiredSourceCount: fixture.sourceRequirements.requiredCount,
})

const findSubject = (title, fixture = personJourney) => {
  if (typeof title !== 'string') {
    return null
  }

  return title.trim().toLocaleLowerCase() === fixture.subject.title.toLocaleLowerCase()
    ? fixture.subject
    : null
}

const validateSourceUrl = (value, existingSources = []) => {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: SOURCE_ERRORS.INVALID }
  }

  let parsedUrl
  try {
    parsedUrl = new URL(value.trim())
  } catch (error) {
    return { error: SOURCE_ERRORS.INVALID }
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { error: SOURCE_ERRORS.INVALID }
  }

  const url = parsedUrl.href
  const duplicate = existingSources.some(
    (source) => (typeof source === 'string' ? source : source.url) === url,
  )
  if (duplicate) {
    return { error: SOURCE_ERRORS.DUPLICATE }
  }

  return { url, hostname: parsedUrl.hostname }
}

const addSource = (state, value) => {
  const source = validateSourceUrl(value, state.sources)
  if (source.error) {
    return { state, error: source.error }
  }

  return {
    state: { ...state, sources: [...state.sources, source] },
    error: null,
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
