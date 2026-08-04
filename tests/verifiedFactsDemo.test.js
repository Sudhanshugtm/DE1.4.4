import { describe, expect, it } from 'vitest'
import {
  VERIFIED_FACTS_DEMO_ROUTE,
  isExactVerifiedFactsDemoRoute,
} from '../src/config/verifiedFactsDemo.js'

const canonicalQueryEntries = [
  ['lang', 'en'],
  ['variant', 'toolbar-outline'],
  ['outline', 'country'],
  ['title', 'Portugal'],
  ['articleguidance', '1'],
  ['sourceOrigin', 'redlink'],
  ['verifiedfacts', '1'],
]

function makeRoute(overrides = {}) {
  return {
    path: '/editor',
    hash: '',
    query: Object.fromEntries(canonicalQueryEntries),
    ...overrides,
  }
}

describe('verified facts demo route', () => {
  it('exports and accepts only the frozen canonical target regardless of query insertion order', () => {
    expect(VERIFIED_FACTS_DEMO_ROUTE).toEqual({
      name: 'editor',
      query: Object.fromEntries(canonicalQueryEntries),
    })
    expect(Object.isFrozen(VERIFIED_FACTS_DEMO_ROUTE)).toBe(true)
    expect(Object.isFrozen(VERIFIED_FACTS_DEMO_ROUTE.query)).toBe(true)

    expect(isExactVerifiedFactsDemoRoute(makeRoute())).toBe(true)
    expect(
      isExactVerifiedFactsDemoRoute(
        makeRoute({ query: Object.fromEntries([...canonicalQueryEntries].reverse()) }),
      ),
    ).toBe(true)
  })

  it('rejects a missing query value and an explicitly undefined query value', () => {
    const missingQuery = Object.fromEntries(canonicalQueryEntries)
    delete missingQuery.verifiedfacts

    expect(isExactVerifiedFactsDemoRoute(makeRoute({ query: missingQuery }))).toBe(false)
    expect(
      isExactVerifiedFactsDemoRoute(
        makeRoute({
          query: { ...Object.fromEntries(canonicalQueryEntries), verifiedfacts: undefined },
        }),
      ),
    ).toBe(false)
  })

  it('rejects a changed query value', () => {
    expect(
      isExactVerifiedFactsDemoRoute(
        makeRoute({ query: { ...Object.fromEntries(canonicalQueryEntries), title: 'Spain' } }),
      ),
    ).toBe(false)
  })

  it('rejects a repeated query value represented as an array', () => {
    expect(
      isExactVerifiedFactsDemoRoute(
        makeRoute({
          query: { ...Object.fromEntries(canonicalQueryEntries), verifiedfacts: ['1', '1'] },
        }),
      ),
    ).toBe(false)
  })

  it('rejects an extra query value', () => {
    expect(
      isExactVerifiedFactsDemoRoute(
        makeRoute({ query: { ...Object.fromEntries(canonicalQueryEntries), extra: '1' } }),
      ),
    ).toBe(false)
  })

  it('rejects a non-empty hash', () => {
    expect(isExactVerifiedFactsDemoRoute(makeRoute({ hash: '#facts' }))).toBe(false)
  })

  it('rejects a different path', () => {
    expect(isExactVerifiedFactsDemoRoute(makeRoute({ path: '/reading' }))).toBe(false)
  })
})
