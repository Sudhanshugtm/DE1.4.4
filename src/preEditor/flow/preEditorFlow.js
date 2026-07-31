const STEPS = Object.freeze({
  SUBJECT: 'subject',
  SOURCES: 'sources',
  GUIDANCE: 'guidance',
})

const SOURCE_ERRORS = Object.freeze({
  INVALID: 'Enter a valid URL',
  DUPLICATE: 'This source has already been added',
})

const normalizeTitle = (value) =>
  value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('en')

const createFlowState = (journey, initialTitle = journey.subject.title) => ({
  step: STEPS.SUBJECT,
  journeyKey: journey.key,
  titleInput: initialTitle,
  selectedSubject: null,
  sources: [],
})

const findSubject = (journey, title) => {
  if (typeof title !== 'string') {
    return null
  }

  return normalizeTitle(title) === normalizeTitle(journey.subject.title) ? journey.subject : null
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

const hasOwnSelectedSubject = (state) =>
  Boolean(state.selectedSubject) && state.selectedSubject.journeyKey === state.journeyKey

const canEnterStep = (state, step) => {
  if (step === STEPS.SUBJECT) {
    return true
  }
  if (step === STEPS.SOURCES || step === STEPS.GUIDANCE) {
    return hasOwnSelectedSubject(state)
  }
  return false
}

const buildEditorQuery = (state, journey) => {
  const hasMatchingJourney =
    journey && state.journeyKey === journey.key && state.selectedSubject?.journeyKey === journey.key

  if (
    state.step !== STEPS.GUIDANCE ||
    !hasMatchingJourney ||
    !canEnterStep(state, STEPS.GUIDANCE)
  ) {
    throw new Error('A ready Guidance state is required to build the editor query')
  }

  return {
    ...journey.handoff,
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
  normalizeTitle,
  removeSource,
  validateSourceUrl,
}
