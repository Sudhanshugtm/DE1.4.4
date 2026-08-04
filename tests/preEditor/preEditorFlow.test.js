import assert from 'node:assert/strict'
import test from 'node:test'

import * as explorationCatalogue from '../../src/preEditor/data/explorationJourneys.js'
import { simpleEnglishOutlinesById } from '../../src/config/outlines/simpleEnglish.js'
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
import { buildSetupQuery, resolveSetupRoute } from '../../src/preEditor/flow/setupRoute.js'

const { personJourney } = explorationCatalogue

const assertDeeplyFrozen = (value) => {
  if (!value || typeof value !== 'object') {
    return
  }
  assert.equal(Object.isFrozen(value), true)
  Object.values(value).forEach(assertDeeplyFrozen)
}

test('person journey fixture provides an immutable Ritu Karidhal journey', () => {
  assert.equal(personJourney.subject.title, 'Ritu Karidhal')
  assert.equal(personJourney.subject.articleType, 'Q5')
  assert.equal(personJourney.subject.sitelinkCount, 8)
  assert.equal('requiredCount' in personJourney.sourceRequirements, false)
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

test('exploration catalogue reaches every outline with sourced sentences and decoys', () => {
  const { explorationArticle, guidanceProfilesByOutline, journeysByKey, sourceProfilesByOutline } =
    explorationCatalogue

  assert.equal(explorationArticle.title, 'Exploration')
  assert.equal('researchNote' in explorationArticle, false)
  assert.deepEqual(explorationArticle.description, {
    id: 'meta-description',
    text: 'Travel and study undertaken to learn about unfamiliar places',
    sourceIds: ['national-geographic-why-we-explore'],
  })

  const sentences = explorationArticle.sections.flatMap((section) =>
    section.paragraphs.flatMap((paragraph) => paragraph.sentences),
  )
  const citedSourceIds = new Set(explorationArticle.description.sourceIds)
  for (const sentence of sentences) {
    assert.equal(sentence.sourceIds.length, 1, `sentence ${sentence.id} needs one source`)
    assert.ok(
      explorationArticle.sources[sentence.sourceIds[0]],
      `sentence ${sentence.id} cites an unknown source`,
    )
    citedSourceIds.add(sentence.sourceIds[0])
    assert.ok(
      sentence.segments.every((segment) => ['text', 'context', 'missing'].includes(segment.kind)),
    )
  }
  for (const sourceId of Object.keys(explorationArticle.sources)) {
    assert.ok(citedSourceIds.has(sourceId), `source ${sourceId} is never cited`)
  }

  const missingSegments = sentences.flatMap((sentence) =>
    sentence.segments.filter((segment) => segment.kind === 'missing'),
  )
  const linkedJourneyKeys = new Set(missingSegments.map((segment) => segment.journeyKey))
  assert.equal(missingSegments.length, linkedJourneyKeys.size, 'one red link per journey')
  assert.deepEqual(linkedJourneyKeys, new Set(Object.keys(journeysByKey)))

  const outlineLabels = new Set(
    Object.values(simpleEnglishOutlinesById).map((outline) => outline.label),
  )
  for (const [key, journey] of Object.entries(journeysByKey)) {
    assert.equal(journey.key, key)
    assert.equal(journey.subject.journeyKey, key)
    const outline = simpleEnglishOutlinesById[journey.handoff.outline]
    assert.ok(outline, `journey ${key} hands off to an unknown outline`)
    assert.equal(journey.subject.articleType, outline.articleType)
    assert.equal(journey.subject.typeLabel, outline.label)
    assert.match(journey.subject.wikidataItemId, /^Q\d+$/)
    assert.equal(
      journey.subject.wikidataItemUrl,
      `https://www.wikidata.org/wiki/${journey.subject.wikidataItemId}`,
    )
    assert.ok(['exact', 'related'].includes(journey.subject.wikidataRelation))
    if (journey.subject.thumbnail) {
      assert.match(
        journey.subject.thumbnail.commonsUrl,
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
      )
    }
    assert.deepEqual(journey.sourceRequirements, { profileKey: journey.handoff.outline })
    assert.equal(journey.guidanceProfileKey, journey.handoff.outline)
    assert.equal(journey.handoff.lang, 'en')
    assert.equal(journey.handoff.variant, 'toolbar-outline')
    assert.ok(sourceProfilesByOutline[journey.handoff.outline])
    assert.ok(guidanceProfilesByOutline[journey.handoff.outline])

    assert.ok(journey.decoys.length >= 2, `journey ${key} needs decoy results`)
    for (const decoy of journey.decoys) {
      assert.ok(decoy.title.length > 0)
      assert.ok(decoy.description.length > 0)
      if (decoy.typeLabel) {
        assert.ok(
          outlineLabels.has(decoy.typeLabel),
          `decoy label ${decoy.typeLabel} is not an outline label`,
        )
      }
    }
  }

  const coveredOutlines = new Set(
    Object.values(journeysByKey).map((journey) => journey.handoff.outline),
  )
  assert.deepEqual(coveredOutlines, new Set(Object.keys(simpleEnglishOutlinesById)))

  assertDeeplyFrozen(explorationArticle)
  assertDeeplyFrozen(journeysByKey)
  assertDeeplyFrozen(sourceProfilesByOutline)
  assertDeeplyFrozen(guidanceProfilesByOutline)
})

test('every outline has a source tip and three guidance bullets', () => {
  const { guidanceProfilesByOutline, sourceProfilesByOutline } = explorationCatalogue

  assert.deepEqual(
    new Set(Object.keys(sourceProfilesByOutline)),
    new Set(Object.keys(simpleEnglishOutlinesById)),
  )
  assert.deepEqual(
    new Set(Object.keys(guidanceProfilesByOutline)),
    new Set(Object.keys(simpleEnglishOutlinesById)),
  )

  for (const profile of Object.values(sourceProfilesByOutline)) {
    assert.match(profile.sourceTip, /^Prefer .+\.$/)
  }
  for (const profile of Object.values(guidanceProfilesByOutline)) {
    assert.equal(profile.guidanceHeading, 'Getting started with this article')
    assert.equal(profile.guidanceIntro, 'Here are a few tips to help you write an article.')
    assert.equal(profile.guidanceBullets.length, 3)
    for (const bullet of profile.guidanceBullets) {
      assert.ok(bullet.length > 0)
    }
  }
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

test('validateSourceUrl refuses discouraged domains when outline context is given', () => {
  const outline = { id: 'person', label: 'Person' }

  const rejected = validateSourceUrl('https://www.imdb.com/name/nm1', [], outline)
  assert.equal(rejected.valid, false)
  assert.match(rejected.error, /discourage imdb\.com/)
  assert.match(rejected.error, /Person articles/)

  const subdomain = validateSourceUrl('https://m.facebook.com/someone', [], outline)
  assert.equal(subdomain.valid, false)
  assert.match(subdomain.error, /facebook\.com/)

  // Without outline context, the same URL passes: the rule belongs to the
  // guidance flow, not to URL validity itself.
  assert.equal(validateSourceUrl('https://www.imdb.com/name/nm1').valid, true)
  assert.equal(validateSourceUrl('https://www.britannica.com/x', [], outline).valid, true)
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

test('canEnterStep requires a journey-bound subject but no sources for Guidance', () => {
  const initial = createFlowState(personJourney)
  assert.equal(initial.titleInput, 'Ritu Karidhal')
  assert.equal(createFlowState(personJourney, 'Draft title').titleInput, 'Draft title')
  const subjectReady = { ...initial, selectedSubject: personJourney.subject }

  assert.equal('requiredSourceCount' in initial, false)
  assert.equal(canEnterStep(initial, STEPS.SUBJECT), true)
  assert.equal(canEnterStep(initial, STEPS.SOURCES), false)
  assert.equal(canEnterStep(initial, STEPS.GUIDANCE), false)
  assert.equal(canEnterStep(subjectReady, STEPS.SOURCES), true)
  assert.equal(canEnterStep(subjectReady, STEPS.GUIDANCE), true)
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
  }

  assert.deepEqual(buildEditorQuery(state, personJourney), {
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'person',
    title: 'Ritu Karidhal',
    articleguidance: '1',
    sourceOrigin: 'redlink',
    source: [],
  })
})

test('subject matching uses Unicode NFKC, collapsed whitespace, and English case folding', () => {
  const journey = explorationCatalogue.journeysByKey['person-neil-armstrong']

  assert.equal(findSubject(journey, '  nEiL   aRmStRoNg  '), journey.subject)
  assert.equal(findSubject(journey, 'Ｎｅｉｌ　Ａｒｍｓｔｒｏｎｇ'), journey.subject)
  assert.equal(findSubject(journey, 'Neil%20Armstrong'), null)
  assert.equal(findSubject(journey, 'Another person'), null)
  assert.equal(findSubject(journey, ''), null)
  assert.equal(findSubject(journey, null), null)
})

test('flow state is journey-bound and rejects a subject from another journey', () => {
  const neil = explorationCatalogue.journeysByKey['person-neil-armstrong']
  const mars = explorationCatalogue.journeysByKey['object-mars']
  const initial = createFlowState(neil)
  const crossJourney = { ...initial, selectedSubject: mars.subject }
  const ownJourney = { ...initial, selectedSubject: neil.subject }

  assert.equal(initial.journeyKey, neil.key)
  assert.equal(initial.titleInput, neil.subject.title)
  assert.equal(canEnterStep(crossJourney, STEPS.SOURCES), false)
  assert.equal(canEnterStep(ownJourney, STEPS.SOURCES), true)
  assert.throws(
    () => buildEditorQuery({ ...crossJourney, step: STEPS.GUIDANCE }, neil),
    /ready Guidance state/,
  )
})

test('every ready journey hands off only its own outline, title, and entered sources', () => {
  for (const journey of Object.values(explorationCatalogue.journeysByKey)) {
    const state = {
      ...createFlowState(journey),
      step: STEPS.GUIDANCE,
      selectedSubject: journey.subject,
      sources: [
        { url: 'https://example.com/one', domain: 'example.com' },
        { url: 'https://example.org/two', domain: 'example.org' },
      ],
    }

    assert.deepEqual(buildEditorQuery(state, journey), {
      lang: 'en',
      variant: 'toolbar-outline',
      outline: journey.handoff.outline,
      title: journey.subject.title,
      articleguidance: '1',
      sourceOrigin: 'redlink',
      source: ['https://example.com/one', 'https://example.org/two'],
    })
  }
})

test('buildSetupQuery emits only the ordered canonical setup contract', () => {
  const journey = explorationCatalogue.journeysByKey['object-mars']

  assert.deepEqual(buildSetupQuery(journey, STEPS.SOURCES, '  Mars  '), {
    step: 'sources',
    journey: 'object-mars',
    title: 'Mars',
    sourceOrigin: 'redlink',
    variant: 'toolbar-outline',
  })
})

test('setup routing keeps valid ready steps and canonicalizes decoded or repeated titles once', () => {
  const journey = explorationCatalogue.journeysByKey['person-neil-armstrong']
  const readySources = {
    ...createFlowState(journey),
    selectedSubject: journey.subject,
  }
  const canonicalQuery = buildSetupQuery(journey, STEPS.SOURCES)

  assert.deepEqual(resolveSetupRoute(canonicalQuery, readySources), {
    kind: 'setup',
    journey,
    step: STEPS.SOURCES,
    titleInput: 'Neil Armstrong',
    canonicalQuery,
    needsReplace: false,
    resetFlow: false,
  })

  const repeatedTitle = resolveSetupRoute(
    {
      ...canonicalQuery,
      step: 'subject',
      title: ['  Ｎｅｉｌ　Ａｒｍｓｔｒｏｎｇ  ', 'Ignored title'],
    },
    createFlowState(journey),
  )
  assert.equal(repeatedTitle.kind, 'setup')
  assert.equal(repeatedTitle.step, STEPS.SUBJECT)
  assert.equal(repeatedTitle.titleInput, 'Neil Armstrong')
  assert.deepEqual(repeatedTitle.canonicalQuery, buildSetupQuery(journey))
  assert.equal(repeatedTitle.needsReplace, true)
  assert.equal(repeatedTitle.resetFlow, false)

  const alreadyDecoded = resolveSetupRoute(
    { ...buildSetupQuery(journey), title: 'Neil Armstrong' },
    createFlowState(journey),
  )
  assert.equal(alreadyDecoded.titleInput, 'Neil Armstrong')

  const encodedAgain = resolveSetupRoute(
    { ...buildSetupQuery(journey), title: 'Neil%20Armstrong' },
    createFlowState(journey),
  )
  assert.equal(encodedAgain.titleInput, 'Neil%20Armstrong')
})

test('setup routing sends missing, unknown, or repeated journeys to the article', () => {
  for (const journey of [undefined, 'unknown', ['person-neil-armstrong']]) {
    assert.deepEqual(
      resolveSetupRoute({
        step: 'subject',
        journey,
        title: 'Neil Armstrong',
        sourceOrigin: 'redlink',
        variant: 'toolbar-outline',
      }),
      {
        kind: 'article',
        journey: null,
        step: null,
        titleInput: '',
        canonicalQuery: null,
        needsReplace: true,
        resetFlow: true,
      },
    )
  }
})

test('setup routing recovers invalid steps and unmet prerequisites to canonical Subject', () => {
  const journey = explorationCatalogue.journeysByKey['object-mars']
  const canonicalSubject = buildSetupQuery(journey)

  for (const step of [undefined, 'unknown', ['subject'], ['guidance', 'sources']]) {
    const resolved = resolveSetupRoute({
      ...canonicalSubject,
      step,
      title: 'Wrong title',
    })
    assert.equal(resolved.kind, 'setup')
    assert.equal(resolved.step, STEPS.SUBJECT)
    assert.equal(resolved.titleInput, journey.subject.title)
    assert.deepEqual(resolved.canonicalQuery, canonicalSubject)
    assert.equal(resolved.needsReplace, true)
    assert.equal(resolved.resetFlow, true)
  }

  for (const step of [STEPS.SOURCES, STEPS.GUIDANCE]) {
    const resolved = resolveSetupRoute({ ...canonicalSubject, step })
    assert.equal(resolved.step, STEPS.SUBJECT)
    assert.deepEqual(resolved.canonicalQuery, canonicalSubject)
    assert.equal(resolved.resetFlow, true)
  }
})

test('setup routing preserves a nonmatching Subject title and repairs provenance and unknown keys', () => {
  const journey = explorationCatalogue.journeysByKey['software-google-earth']
  const resolved = resolveSetupRoute({
    step: 'subject',
    journey: journey.key,
    title: '  Draft title  ',
    sourceOrigin: ['redlink'],
    variant: 'wrong',
    source: ['https://example.com/one', 'https://example.org/two'],
    extra: 'drop me',
  })

  assert.equal(resolved.titleInput, 'Draft title')
  assert.deepEqual(resolved.canonicalQuery, {
    step: 'subject',
    journey: journey.key,
    title: 'Draft title',
    sourceOrigin: 'redlink',
    variant: 'toolbar-outline',
  })
  assert.equal(resolved.needsReplace, true)
  assert.equal(resolved.resetFlow, false)
})

test('setup routing NFKC-normalizes an unmatched draft title before canonical output', () => {
  const journey = explorationCatalogue.journeysByKey['software-google-earth']
  const resolved = resolveSetupRoute({
    ...buildSetupQuery(journey),
    title: '  Ｄｒａｆｔ　title  ',
  })

  assert.equal(resolved.titleInput, 'Draft title')
  assert.equal(resolved.canonicalQuery.title, 'Draft title')
  assert.equal(resolved.needsReplace, true)
})

test('setup routing permits zero-source Sources and Guidance only for matching state', () => {
  const journey = explorationCatalogue.journeysByKey['island-easter-island']
  const matching = {
    ...createFlowState(journey),
    selectedSubject: journey.subject,
  }
  const otherJourney = explorationCatalogue.journeysByKey['object-mars']
  const invalidStates = [
    { label: 'missing state', state: undefined },
    {
      label: 'stale-title state',
      state: { ...matching, titleInput: 'Old draft title' },
      title: 'Old draft title',
    },
    {
      label: 'foreign selected subject',
      state: { ...matching, selectedSubject: otherJourney.subject },
    },
    {
      label: 'foreign journey state',
      state: {
        ...createFlowState(otherJourney),
        selectedSubject: otherJourney.subject,
      },
    },
  ]
  const canonicalSubject = buildSetupQuery(journey)

  for (const step of [STEPS.SOURCES, STEPS.GUIDANCE]) {
    const query = buildSetupQuery(journey, step)
    assert.deepEqual(resolveSetupRoute(query, matching), {
      kind: 'setup',
      journey,
      step,
      titleInput: journey.subject.title,
      canonicalQuery: query,
      needsReplace: false,
      resetFlow: false,
    })

    for (const { label, state, title } of invalidStates) {
      const recovered = resolveSetupRoute(
        buildSetupQuery(journey, step, title ?? journey.subject.title),
        state,
      )
      assert.deepEqual(
        recovered,
        {
          kind: 'setup',
          journey,
          step: STEPS.SUBJECT,
          titleInput: journey.subject.title,
          canonicalQuery: canonicalSubject,
          needsReplace: true,
          resetFlow: true,
        },
        `${step}: ${label}`,
      )
    }
  }
})
