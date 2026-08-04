import { describe, expect, it } from 'vitest'
import {
  getReviewedVerifiedFacts,
  isReviewedVerifiedFact,
} from '../src/config/reviewedVerifiedFacts.js'

const portugalContext = Object.freeze({ language: 'en', outline: 'country', title: 'Portugal' })

const expectedPortugalFacts = Object.freeze([
  Object.freeze({
    id: 'portugal-official-name-portuguese',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:official-name',
    targetFieldToken: '[official name]',
    fieldLabel: 'Official name',
    label: 'Official name',
    value: 'República Portuguesa',
    valueLanguage: 'pt',
    qualification:
      "Wikidata records this official name in Portuguese and cites Portugal's diplomatic portal.",
    referenceCount: 1,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P1448',
  }),
  Object.freeze({
    id: 'portugal-area-2021',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:area',
    targetFieldToken: '[area]',
    fieldLabel: 'Area',
    label: 'Area',
    value: '92,225 km²',
    qualification: 'Wikidata records this area with a point in time of 2021 and cites Pordata.',
    referenceCount: 1,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P2046',
  }),
  Object.freeze({
    id: 'portugal-population-2021-census',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:population',
    targetFieldToken: '[population]',
    fieldLabel: 'Population',
    label: 'Population',
    value: '10,347,892',
    qualification:
      "The preferred Wikidata population statement is dated 2021, uses the census method, and cites Portugal's national statistics office.",
    referenceCount: 1,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P1082',
  }),
  Object.freeze({
    id: 'portugal-official-language',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:language',
    targetFieldToken: '[language]',
    fieldLabel: 'Official language',
    label: 'Official language',
    value: 'Portuguese',
    qualification:
      "Wikidata records Portuguese as the current normal-rank official-language value and cites section 11.3 of Portugal's constitution.",
    referenceCount: 1,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P37',
  }),
])

const expectedBuddhismFact = Object.freeze({
  id: 'buddhism-inception-range',
  outlineId: 'religion',
  sectionId: 'introduction',
  sectionLabel: 'Introduction',
  targetFieldId: 'religion:introduction:approximate-period',
  targetFieldToken: '[approximate period]',
  fieldLabel: 'Approximate period',
  label: 'Approximate origin period',
  value: 'Between 563 BCE and 483 BCE',
  qualification:
    'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
  referenceCount: 1,
  claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
})

describe('reviewed verified fact fixtures', () => {
  it('returns the four frozen Portugal facts in reviewed order', () => {
    expect(getReviewedVerifiedFacts(portugalContext)).toEqual(expectedPortugalFacts)
    expect(getReviewedVerifiedFacts(portugalContext).map(({ id }) => id)).toEqual([
      'portugal-official-name-portuguese',
      'portugal-area-2021',
      'portugal-population-2021-census',
      'portugal-official-language',
    ])
  })

  it('returns the context-complete Buddhism fixture', () => {
    expect(
      getReviewedVerifiedFacts({ language: 'en', outline: 'religion', title: 'Buddhism' }),
    ).toEqual([expectedBuddhismFact])
  })

  it('returns no facts for unsupported and malformed routes', () => {
    expect(
      getReviewedVerifiedFacts({ language: 'en', outline: 'country', title: 'Spain' }),
    ).toEqual([])
    expect(getReviewedVerifiedFacts({ language: 'en', outline: 'religion' })).toEqual([])
    expect(getReviewedVerifiedFacts('en:country:Portugal')).toEqual([])
  })

  it('returns isolated copies', () => {
    const first = getReviewedVerifiedFacts(portugalContext)
    first[0].value = 'Changed'
    expect(getReviewedVerifiedFacts(portugalContext)).toEqual(expectedPortugalFacts)
  })

  it('accepts reviewed tuples only for their current outline', () => {
    expect(isReviewedVerifiedFact(expectedPortugalFacts[0], 'country')).toBe(true)
    expect(isReviewedVerifiedFact(expectedPortugalFacts[0], 'religion')).toBe(false)
    expect(isReviewedVerifiedFact(expectedPortugalFacts[0])).toBe(false)
  })

  it.each([
    'outlineId',
    'sectionId',
    'sectionLabel',
    'targetFieldId',
    'targetFieldToken',
    'fieldLabel',
  ])('rejects a missing context tuple field: %s', (field) => {
    const fact = { ...expectedPortugalFacts[0] }
    delete fact[field]
    expect(isReviewedVerifiedFact(fact, 'country')).toBe(false)
  })

  it.each([
    ['outlineId', 'religion'],
    ['sectionId', 'history'],
    ['sectionLabel', 'Lead'],
    ['targetFieldId', 'country:introduction:population'],
    ['targetFieldToken', '[population]'],
    ['fieldLabel', 'Name'],
  ])('rejects a mismatched allowlisted tuple field: %s', (field, value) => {
    expect(isReviewedVerifiedFact({ ...expectedPortugalFacts[0], [field]: value }, 'country')).toBe(
      false,
    )
  })

  it('allows only an absent value language or the supported pt tag', () => {
    expect(isReviewedVerifiedFact(expectedPortugalFacts[0], 'country')).toBe(true)
    expect(isReviewedVerifiedFact(expectedPortugalFacts[1], 'country')).toBe(true)
    expect(
      isReviewedVerifiedFact({ ...expectedPortugalFacts[0], valueLanguage: '' }, 'country'),
    ).toBe(false)
    expect(
      isReviewedVerifiedFact({ ...expectedPortugalFacts[0], valueLanguage: 'en' }, 'country'),
    ).toBe(false)
  })

  it.each([
    '/wiki/Q45#P1448',
    'http://www.wikidata.org/wiki/Q45#P1448',
    'https://wikidata.org/wiki/Q45#P1448',
    'https://www.wikidata.org.evil.test/wiki/Q45#P1448',
    'https://www.wikidata.org/wiki/Special:Random#P1448',
    'https://www.wikidata.org/wiki/Q45#Q1448',
    'https://www.wikidata.org/wiki/Q45#P1448-extra',
  ])('rejects hardened claim URL case %s', (claimUrl) => {
    expect(isReviewedVerifiedFact({ ...expectedPortugalFacts[0], claimUrl }, 'country')).toBe(false)
  })

  it.each([
    ['id', ''],
    ['label', '   '],
    ['value', 45],
    ['qualification', null],
    ['referenceCount', 0],
  ])('rejects invalid required data field %s', (field, value) => {
    expect(isReviewedVerifiedFact({ ...expectedPortugalFacts[0], [field]: value }, 'country')).toBe(
      false,
    )
  })
})
