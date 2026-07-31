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

const expectedJourneys = [
  [
    'person-neil-armstrong',
    'Neil Armstrong',
    'American astronaut and aeronautical engineer',
    'Q1615',
    'exact',
    'Person',
    'Q5',
    'person',
    'neil-armstrong.jpg',
  ],
  [
    'person-valentina-tereshkova',
    'Valentina Tereshkova',
    'Soviet cosmonaut and the first woman in space',
    'Q44371',
    'exact',
    'Person',
    'Q5',
    'person',
    'valentina-tereshkova.jpg',
  ],
  [
    'event-chandrayaan-3-landing',
    'Chandrayaan-3 Moon landing',
    "2023 lunar landing by India's Chandrayaan-3 mission",
    'Q65049774',
    'related',
    'Recent Event',
    'Q108586636',
    'recent-event',
    'chandrayaan-3.png',
  ],
  [
    'object-mars',
    'Mars',
    'Fourth planet from the Sun',
    'Q111',
    'exact',
    'Astronomical Object',
    'Q6999',
    'astronomical-object',
    'mars.png',
  ],
  [
    'software-google-earth',
    'Google Earth',
    'Virtual globe and mapping software',
    'Q42274',
    'exact',
    'Software',
    'Q7397',
    'software',
    'google-earth.png',
  ],
  [
    'company-spacex',
    'SpaceX',
    'American aerospace company',
    'Q193701',
    'exact',
    'Company',
    'Q4830453',
    'company',
    'spacex.jpg',
  ],
  [
    'landform-mount-everest',
    'Mount Everest',
    "Earth's highest mountain above sea level",
    'Q513',
    'exact',
    'Landform',
    'Q271669',
    'landform',
    'mount-everest.jpg',
  ],
  [
    'island-easter-island',
    'Easter Island',
    'Island and special territory of Chile in the Pacific Ocean',
    'Q14452',
    'exact',
    'Island',
    'Q23442',
    'island',
    'easter-island.jpg',
  ],
]

const expectedSources = {
  'national-geographic-why-we-explore': {
    publisher: 'National Geographic Society',
    url: 'https://education.nationalgeographic.org/resource/why-we-explore/',
  },
  'rgs-geographical-exploration': {
    publisher: 'Royal Geographical Society',
    url: 'https://www.rgs.org/exploration/what-is-geographical-exploration',
  },
  'national-geographic-geography': {
    publisher: 'National Geographic Society',
    url: 'https://education.nationalgeographic.org/resource/geography-article/',
  },
  'national-geographic-everest': {
    publisher: 'National Geographic',
    url: 'https://www.nationalgeographic.com/adventure/article/climbing-mount-everest-1',
  },
  'esa-easter-island': {
    publisher: 'European Space Agency',
    url: 'https://www.esa.int/ESA_Multimedia/Images/2019/04/Easter_Island',
  },
  'google-earth-desktop': {
    publisher: 'Google Earth',
    url: 'https://earth.google.com/desktop/',
  },
  'nasa-mars-exploration': {
    publisher: 'NASA',
    url: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/',
  },
  'nasa-neil-armstrong': {
    publisher: 'NASA',
    url: 'https://www.nasa.gov/people/neil-a-armstrong/',
  },
  'esa-valentina-tereshkova': {
    publisher: 'European Space Agency',
    url: 'https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/First_woman_in_space_Valentina',
  },
  'isro-chandrayaan-3': {
    publisher: 'Indian Space Research Organisation',
    url: 'https://www.isro.gov.in/ISRO_EN/Chandrayaan3.html',
  },
  'nasa-commercial-crew-dragon': {
    publisher: 'NASA',
    url: 'https://www.nasa.gov/commercial-crew-program-press-kit/',
  },
}

const expectedSentenceText = {
  'intro-definition':
    'Exploration is travel over unfamiliar territory for discovery, or the careful study of something in order to learn more about it.',
  'intro-modern-practice':
    'Modern geographical exploration includes field research and the use of different tools and methods.',
  'intro-tools': 'Maps and satellite images are among the tools used to study places.',
  'earth-everest': 'Mount Everest lies in the Himalayas on the border between Nepal and China.',
  'earth-easter-island':
    'Easter Island, also called Rapa Nui, is a Chilean island in the Pacific Ocean.',
  'earth-google-earth':
    'Google Earth displays satellite imagery and 3D representations of terrain and buildings.',
  'space-mars': 'Mars has been explored by robotic orbiters, landers, and rovers.',
  'space-armstrong':
    'Neil Armstrong became the first person to set foot on the Moon on 20 July 1969.',
  'space-tereshkova':
    'Valentina Tereshkova became the first woman in space when Vostok 6 launched on 16 June 1963.',
  'space-chandrayaan':
    'The Chandrayaan-3 Moon landing was a successful soft landing on the Moon on 23 August 2023.',
  'space-spacex':
    'SpaceX developed the Dragon spacecraft, which carries crew and cargo to orbiting destinations such as the International Space Station.',
}

const expectedSourceIds = {
  'intro-definition': 'national-geographic-why-we-explore',
  'intro-modern-practice': 'rgs-geographical-exploration',
  'intro-tools': 'national-geographic-geography',
  'earth-everest': 'national-geographic-everest',
  'earth-easter-island': 'esa-easter-island',
  'earth-google-earth': 'google-earth-desktop',
  'space-mars': 'nasa-mars-exploration',
  'space-armstrong': 'nasa-neil-armstrong',
  'space-tereshkova': 'esa-valentina-tereshkova',
  'space-chandrayaan': 'isro-chandrayaan-3',
  'space-spacex': 'nasa-commercial-crew-dragon',
}

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

test('exploration catalogue provides the exact sourced article and eight journeys', () => {
  const { explorationArticle, guidanceProfilesByOutline, journeysByKey, sourceProfilesByOutline } =
    explorationCatalogue

  assert.equal(explorationArticle.title, 'Exploration')
  assert.deepEqual(explorationArticle.researchNote, {
    label: 'Research prototype',
    text: 'Read this short article and choose any red link that interests you. Each red link starts a different article-creation path. Link colours are simulated for this study. Blue links provide context and are not active. When asked, add any two valid web links as sources.',
  })
  assert.deepEqual(explorationArticle.description, {
    id: 'meta-description',
    text: 'Travel and study undertaken to learn about unfamiliar places',
    sourceIds: ['national-geographic-why-we-explore'],
  })
  assert.deepEqual(explorationArticle.sources, expectedSources)
  assert.deepEqual(
    explorationArticle.sections.map((section) => section.heading),
    ['Introduction', 'Exploration on Earth', 'Space exploration'],
  )

  const sentences = explorationArticle.sections.flatMap((section) =>
    section.paragraphs.flatMap((paragraph) => paragraph.sentences),
  )
  assert.equal(sentences.length, 11)
  assert.deepEqual(
    Object.fromEntries(
      sentences.map((sentence) => [
        sentence.id,
        sentence.segments.map((segment) => segment.text).join(''),
      ]),
    ),
    expectedSentenceText,
  )
  assert.deepEqual(
    Object.fromEntries(sentences.map((sentence) => [sentence.id, sentence.sourceIds[0]])),
    expectedSourceIds,
  )
  for (const sentence of sentences) {
    assert.equal(sentence.sourceIds.length, 1)
    assert.ok(explorationArticle.sources[sentence.sourceIds[0]])
    assert.ok(
      sentence.segments.every((segment) => ['text', 'context', 'missing'].includes(segment.kind)),
    )
  }

  assert.equal(Object.keys(journeysByKey).length, 8)
  assert.equal(new Set(expectedJourneys.map(([key]) => key)).size, 8)
  assert.equal(new Set(expectedJourneys.map(([, , , itemId]) => itemId)).size, 8)
  assert.equal(new Set(expectedJourneys.map((entry) => entry[7])).size, 7)

  for (const [
    key,
    title,
    description,
    itemId,
    relation,
    typeLabel,
    articleType,
    outline,
    asset,
  ] of expectedJourneys) {
    const journey = journeysByKey[key]
    assert.ok(journey)
    assert.equal(journey.key, key)
    assert.deepEqual(
      {
        journeyKey: journey.subject.journeyKey,
        title: journey.subject.title,
        description: journey.subject.description,
        wikidataItemId: journey.subject.wikidataItemId,
        wikidataItemUrl: journey.subject.wikidataItemUrl,
        wikidataRelation: journey.subject.wikidataRelation,
        typeLabel: journey.subject.typeLabel,
        articleType: journey.subject.articleType,
      },
      {
        journeyKey: key,
        title,
        description,
        wikidataItemId: itemId,
        wikidataItemUrl: `https://www.wikidata.org/wiki/${itemId}`,
        wikidataRelation: relation,
        typeLabel,
        articleType,
      },
    )
    assert.match(journey.subject.thumbnail.url, new RegExp(`/${asset.replace('.', '\\.')}$`))
    assert.equal(typeof journey.subject.thumbnail.commonsFile, 'string')
    assert.match(
      journey.subject.thumbnail.commonsUrl,
      /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
    )
    assert.deepEqual(journey.sourceRequirements, { profileKey: outline })
    assert.equal(journey.guidanceProfileKey, outline)
    assert.deepEqual(journey.handoff, {
      lang: 'en',
      variant: 'toolbar-outline',
      outline,
    })
    assert.equal(simpleEnglishOutlinesById[outline].articleType, articleType)
    assert.ok(sourceProfilesByOutline[outline])
    assert.ok(guidanceProfilesByOutline[outline])
  }

  const missingSegments = sentences.flatMap((sentence) =>
    sentence.segments.filter((segment) => segment.kind === 'missing'),
  )
  assert.equal(missingSegments.length, 8)
  assert.deepEqual(
    new Set(missingSegments.map((segment) => segment.journeyKey)),
    new Set(expectedJourneys.map(([key]) => key)),
  )

  assertDeeplyFrozen(explorationArticle)
  assertDeeplyFrozen(journeysByKey)
  assertDeeplyFrozen(sourceProfilesByOutline)
  assertDeeplyFrozen(guidanceProfilesByOutline)
})

test('exploration profiles provide exact source tips and guidance copy', () => {
  const { guidanceProfilesByOutline, sourceProfilesByOutline } = explorationCatalogue
  const expectedProfiles = {
    person: {
      sourceTip:
        'Prefer substantial biographies, institutional records, academic publications, and independent journalism.',
      guidanceBullets: [
        'Start with who the person is and why reliable independent sources discuss them.',
        'Write in the third person and use a neutral tone.',
        'Do not write about yourself, family, or friends.',
      ],
    },
    'recent-event': {
      sourceTip:
        'Prefer established news organisations, official records, and independent expert analysis.',
      guidanceBullets: [
        'State what happened, where and when it happened, and why reliable sources covered it.',
        'Present the sequence of events in chronological order.',
        'Distinguish confirmed information from attributed claims.',
      ],
    },
    'astronomical-object': {
      sourceTip:
        'Prefer astronomical catalogues, peer-reviewed research, observatory publications, and space-agency material.',
      guidanceBullets: [
        "Identify the object's type, location, and main physical characteristics.",
        'Describe discovery and observation using published sources.',
        'Avoid speculation that is not attributed to a reliable source.',
      ],
    },
    software: {
      sourceTip:
        'Prefer independent technical publications, academic work, books, and established technology journalism.',
      guidanceBullets: [
        "Explain the software's purpose, development, and notable uses.",
        "Separate independently documented use from the developer's own claims.",
        'Avoid feature lists copied from product material.',
      ],
    },
    company: {
      sourceTip:
        'Prefer independent business journalism, regulatory filings, books, and academic work.',
      guidanceBullets: [
        'Explain what the company does, when it was formed, and its documented products or services.',
        'Cover significant criticism or disputes only in proportion to reliable coverage.',
        'Avoid promotional language and unsupported claims of leadership or innovation.',
      ],
    },
    landform: {
      sourceTip:
        'Prefer geological surveys, academic geography, authoritative atlases, and government scientific agencies.',
      guidanceBullets: [
        "Identify the landform's location, type, formation, and physical characteristics.",
        'Attribute measurements when sources differ.',
        'Separate scientific description from tourism or promotional claims.',
      ],
    },
    island: {
      sourceTip:
        'Prefer government statistics, atlases, academic research, and reliable historical works.',
      guidanceBullets: [
        "Identify the island's location, political status, geography, and environment.",
        'Add history, population, or ecology only when relevant and sourced.',
        'Avoid travel-guide language.',
      ],
    },
  }

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(sourceProfilesByOutline).map(([key, profile]) => [key, profile.sourceTip]),
    ),
    Object.fromEntries(
      Object.entries(expectedProfiles).map(([key, profile]) => [key, profile.sourceTip]),
    ),
  )
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(guidanceProfilesByOutline).map(([key, profile]) => [key, profile]),
    ),
    Object.fromEntries(
      Object.entries(expectedProfiles).map(([key, profile]) => [
        key,
        {
          guidanceHeading: 'Getting started with this article',
          guidanceIntro: 'Here are a few tips to help you write an article.',
          guidanceBullets: profile.guidanceBullets,
        },
      ]),
    ),
  )
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

test('all eight ready journeys hand off only their own outline, title, and entered sources', () => {
  for (const [key] of expectedJourneys) {
    const journey = explorationCatalogue.journeysByKey[key]
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
