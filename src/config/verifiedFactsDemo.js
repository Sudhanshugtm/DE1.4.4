const verifiedFactsDemoQuery = Object.freeze({
  lang: 'en',
  variant: 'toolbar-outline',
  outline: 'country',
  title: 'Portugal',
  articleguidance: '1',
  sourceOrigin: 'redlink',
  verifiedfacts: '1',
})

export const VERIFIED_FACTS_DEMO_ROUTE = Object.freeze({
  name: 'editor',
  query: verifiedFactsDemoQuery,
})

export function isExactVerifiedFactsDemoRoute(route) {
  if (
    !route ||
    typeof route !== 'object' ||
    route.path !== '/editor' ||
    route.hash !== '' ||
    !route.query ||
    typeof route.query !== 'object' ||
    Array.isArray(route.query)
  ) {
    return false
  }

  const queryKeys = Object.keys(route.query)
  const canonicalEntries = Object.entries(verifiedFactsDemoQuery)

  return (
    queryKeys.length === canonicalEntries.length &&
    canonicalEntries.every(
      ([key, value]) =>
        Object.hasOwn(route.query, key) &&
        typeof route.query[key] === 'string' &&
        route.query[key] === value,
    )
  )
}
