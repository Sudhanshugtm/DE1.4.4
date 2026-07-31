import assert from 'node:assert/strict'
import test from 'node:test'

import { personJourney } from '../../src/preEditor/data/personJourney.js'
import {
  SOURCE_ERRORS,
  STEPS,
  addSource,
  buildEditorQuery,
  canEnterStep,
  createFlowState,
  findSubject,
  removeSource,
  validateSourceUrl,
} from '../../src/preEditor/flow/preEditorFlow.js'

test('person journey fixture provides an immutable Ritu Karidhal journey', () => {
  assert.equal(personJourney.subject.title, 'Ritu Karidhal')
  assert.equal(personJourney.subject.articleType, 'Q5')
  assert.equal(personJourney.subject.sitelinkCount, 8)
  assert.equal(personJourney.sourceRequirements.requiredCount, 2)
  assert.equal(Object.isFrozen(personJourney), true)
  assert.equal(Object.isFrozen(personJourney.article.sections), true)
  assert.equal(Object.isFrozen(personJourney.guidance.bullets), true)
  assert.deepEqual(personJourney.article, {
    title: 'Women in the Indian space programme',
    description: 'From Wikipedia, the free encyclopedia',
    sections: [
      {
        heading: '',
        paragraphs: [
          [
            {
              text: "Women have worked across science, engineering, mission operations, and administration in India's space programme. Their roles became especially visible through the Mars Orbiter Mission and later lunar missions.",
              missingLink: false,
            },
          ],
        ],
      },
      {
        heading: 'Notable contributors',
        paragraphs: [
          [
            {
              text: 'Mission teams have included engineers such as Muthayya Vanitha, Nandini Harinath, and ',
              missingLink: false,
            },
            { text: 'Ritu Karidhal', missingLink: true },
            {
              text: ', who took leadership roles on major projects. Their work spans navigation, spacecraft operations, communications, and mission planning.',
              missingLink: false,
            },
          ],
        ],
      },
    ],
  })
})

test('findSubject matches a trimmed case-insensitive Ritu Karidhal title', () => {
  assert.equal(findSubject(personJourney, '  rItU kArIdHaL  '), personJourney.subject)
  assert.equal(findSubject(personJourney, 'Another person'), null)
  assert.equal(findSubject(personJourney, ''), null)
})

test('validateSourceUrl only accepts normalized HTTP(S) URLs', () => {
  assert.deepEqual(validateSourceUrl('example.com'), {
    valid: false,
    error: SOURCE_ERRORS.INVALID,
  })
  assert.deepEqual(validateSourceUrl('ftp://example.com/file'), {
    valid: false,
    error: SOURCE_ERRORS.INVALID,
  })
  assert.deepEqual(validateSourceUrl(' HTTPS://EXAMPLE.COM/Report '), {
    valid: true,
    source: { url: 'https://example.com/Report', domain: 'example.com' },
  })
  assert.deepEqual(validateSourceUrl('http://example.org/path'), {
    valid: true,
    source: { url: 'http://example.org/path', domain: 'example.org' },
  })
})

test('validateSourceUrl rejects normalized duplicate sources', () => {
  assert.deepEqual(validateSourceUrl('HTTPS://EXAMPLE.COM/one', ['https://example.com/one']), {
    valid: false,
    error: SOURCE_ERRORS.DUPLICATE,
  })
})

test('source changes are immutable and a removed source can be added again', () => {
  const state = createFlowState(personJourney)
  const added = addSource(state, 'https://example.com/one')
  const removed = removeSource(added.state, 'https://example.com/one')
  const readded = addSource(removed, 'https://example.com/one')

  assert.notEqual(added.state, state)
  assert.deepEqual(state.sources, [])
  assert.notEqual(removed, added.state)
  assert.deepEqual(
    added.state.sources.map((source) => source.url),
    ['https://example.com/one'],
  )
  assert.deepEqual(removed.sources, [])
  assert.equal(readded.error, '')
  assert.deepEqual(
    readded.state.sources.map((source) => source.url),
    ['https://example.com/one'],
  )
})

test('canEnterStep requires a subject and then the required sources', () => {
  const initial = createFlowState(personJourney)
  assert.equal(initial.titleInput, 'Ritu Karidhal')
  assert.equal(createFlowState(personJourney, 'Draft title').titleInput, 'Draft title')
  const subjectReady = { ...initial, selectedSubject: personJourney.subject }
  const sourceReady = {
    ...subjectReady,
    sources: [
      { url: 'https://example.com/one', domain: 'example.com' },
      { url: 'https://example.org/two', domain: 'example.org' },
    ],
  }

  assert.equal(canEnterStep(initial, STEPS.SUBJECT), true)
  assert.equal(canEnterStep(initial, STEPS.SOURCES), false)
  assert.equal(canEnterStep(subjectReady, STEPS.SOURCES), true)
  assert.equal(canEnterStep(subjectReady, STEPS.GUIDANCE), false)
  assert.equal(canEnterStep(sourceReady, STEPS.GUIDANCE), true)
})

test('canEnterStep allows backward navigation from a ready Guidance state', () => {
  const state = {
    ...createFlowState(personJourney),
    step: STEPS.GUIDANCE,
    selectedSubject: personJourney.subject,
    sources: [
      { url: 'https://example.com/one', domain: 'example.com' },
      { url: 'https://example.org/two', domain: 'example.org' },
    ],
  }

  assert.equal(canEnterStep(state, STEPS.SOURCES), true)
  assert.equal(canEnterStep(state, STEPS.SUBJECT), true)
})

test('buildEditorQuery maps a ready Guidance state to the editor handoff', () => {
  const state = {
    ...createFlowState(personJourney),
    step: STEPS.GUIDANCE,
    selectedSubject: personJourney.subject,
    sources: [
      { url: 'https://example.com/one', domain: 'example.com' },
      { url: 'https://example.org/two', domain: 'example.org' },
    ],
  }

  assert.deepEqual(buildEditorQuery(state, personJourney), {
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'person',
    title: 'Ritu Karidhal',
    articleguidance: '1',
    sourceOrigin: 'redlink',
    source: ['https://example.com/one', 'https://example.org/two'],
  })
})
