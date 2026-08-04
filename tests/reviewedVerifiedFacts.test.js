import { describe, expect, it } from 'vitest'
import {
  getReviewedVerifiedFacts,
  isReviewedVerifiedFact,
} from '../src/config/reviewedVerifiedFacts.js'

describe('reviewed verified fact fixtures', () => {
  it('returns the reviewed Buddhism inception range', () => {
    const facts = getReviewedVerifiedFacts({
      language: 'en',
      outline: 'religion',
      title: 'Buddhism',
    })

    expect(facts).toHaveLength(1)
    expect(facts[0]).toMatchObject({
      id: 'buddhism-inception-range',
      label: 'Approximate origin period',
      value: 'Between 563 BCE and 483 BCE',
      referenceCount: 1,
      claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
    })
    expect(facts[0].qualification).toEqual(expect.any(String))
    expect(facts[0].qualification.trim()).not.toBe('')
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

  it('rejects facts missing qualification and claim URL', () => {
    expect(
      isReviewedVerifiedFact({
        id: 'unqualified-fact',
        label: 'Unqualified fact',
        value: 'Unknown',
        referenceCount: 1,
      }),
    ).toBe(false)
  })
})
