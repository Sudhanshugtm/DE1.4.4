import { describe, expect, it } from 'vitest'
import {
  getReviewedVerifiedFacts,
  isReviewedVerifiedFact,
} from '../src/config/reviewedVerifiedFacts.js'

const reviewedContext = Object.freeze({
  language: 'en',
  outline: 'religion',
  title: 'Buddhism',
})

const expectedBuddhismFact = Object.freeze({
  id: 'buddhism-inception-range',
  label: 'Approximate origin period',
  value: 'Between 563 BCE and 483 BCE',
  qualification:
    'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
  referenceCount: 1,
  claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
})

describe('reviewed verified fact fixtures', () => {
  it('returns the reviewed Buddhism inception range', () => {
    expect(getReviewedVerifiedFacts(reviewedContext)).toEqual([expectedBuddhismFact])
  })

  it('returns no facts for an unreviewed context', () => {
    expect(
      getReviewedVerifiedFacts({
        language: 'en',
        outline: 'religion',
        title: 'Christianity',
      }),
    ).toEqual([])
  })

  it.each([
    { label: 'undefined', context: undefined },
    { label: 'null', context: null },
    { label: 'an empty array', context: [] },
    { label: 'a route-key array', context: ['en:religion:Buddhism'] },
    { label: 'a symbol', context: Symbol('en:religion:Buddhism') },
    { label: 'a string', context: 'en:religion:Buddhism' },
    { label: 'a missing language', context: { outline: 'religion', title: 'Buddhism' } },
    {
      label: 'a non-string language',
      context: { language: Symbol('en'), outline: 'religion', title: 'Buddhism' },
    },
    {
      label: 'a non-string outline',
      context: { language: 'en', outline: ['religion'], title: 'Buddhism' },
    },
    {
      label: 'a non-string title',
      context: { language: 'en', outline: 'religion', title: { value: 'Buddhism' } },
    },
  ])('returns no facts without throwing for $label context', ({ context }) => {
    let result

    expect(() => {
      result = getReviewedVerifiedFacts(context)
    }).not.toThrow()
    expect(result).toEqual([])
  })

  it('returns isolated fact copies', () => {
    const firstResult = getReviewedVerifiedFacts(reviewedContext)
    firstResult[0].value = 'Changed by the caller'

    const secondResult = getReviewedVerifiedFacts(reviewedContext)

    expect(secondResult).toEqual([expectedBuddhismFact])
    expect(secondResult[0]).not.toBe(firstResult[0])
  })

  it('accepts the exact reviewed Buddhism fact', () => {
    expect(isReviewedVerifiedFact(expectedBuddhismFact)).toBe(true)
  })

  it.each([
    {
      label: 'missing qualification and claim URL',
      fact: {
        id: 'unqualified-fact',
        label: 'Unqualified fact',
        value: 'Unknown',
        referenceCount: 1,
      },
    },
    { label: 'empty id', fact: { ...expectedBuddhismFact, id: '' } },
    { label: 'blank label', fact: { ...expectedBuddhismFact, label: '   ' } },
    { label: 'non-string value', fact: { ...expectedBuddhismFact, value: 563 } },
    { label: 'non-string qualification', fact: { ...expectedBuddhismFact, qualification: null } },
    { label: 'zero references', fact: { ...expectedBuddhismFact, referenceCount: 0 } },
    { label: 'negative references', fact: { ...expectedBuddhismFact, referenceCount: -1 } },
    { label: 'fractional references', fact: { ...expectedBuddhismFact, referenceCount: 1.5 } },
    { label: 'string reference count', fact: { ...expectedBuddhismFact, referenceCount: '1' } },
    { label: 'non-string claim URL', fact: { ...expectedBuddhismFact, claimUrl: 571 } },
    { label: 'relative claim URL', fact: { ...expectedBuddhismFact, claimUrl: '/wiki/Q748#P571' } },
    {
      label: 'JavaScript claim URL',
      fact: { ...expectedBuddhismFact, claimUrl: 'javascript:alert(1)#P571' },
    },
    {
      label: 'HTTP claim URL',
      fact: { ...expectedBuddhismFact, claimUrl: 'http://www.wikidata.org/wiki/Q748#P571' },
    },
    {
      label: 'bare Wikidata hostname',
      fact: { ...expectedBuddhismFact, claimUrl: 'https://wikidata.org/wiki/Q748#P571' },
    },
    {
      label: 'lookalike Wikidata hostname',
      fact: {
        ...expectedBuddhismFact,
        claimUrl: 'https://www.wikidata.org.evil.test/wiki/Q748#P571',
      },
    },
    {
      label: 'claim URL without a hash',
      fact: { ...expectedBuddhismFact, claimUrl: 'https://www.wikidata.org/wiki/Q748' },
    },
    {
      label: 'non-property hash',
      fact: { ...expectedBuddhismFact, claimUrl: 'https://www.wikidata.org/wiki/Q748#Q571' },
    },
    {
      label: 'property hash without digits',
      fact: { ...expectedBuddhismFact, claimUrl: 'https://www.wikidata.org/wiki/Q748#P' },
    },
    {
      label: 'property hash with a suffix',
      fact: { ...expectedBuddhismFact, claimUrl: 'https://www.wikidata.org/wiki/Q748#P571-extra' },
    },
  ])('rejects $label', ({ fact }) => {
    expect(isReviewedVerifiedFact(fact)).toBe(false)
  })
})
