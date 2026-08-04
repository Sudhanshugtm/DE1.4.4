const REQUIRED_FIELDS = ['id', 'label', 'value', 'qualification', 'referenceCount', 'claimUrl']

const reviewedVerifiedFactsByContext = Object.freeze({
  'en:religion:Buddhism': Object.freeze([
    Object.freeze({
      id: 'buddhism-inception-range',
      label: 'Approximate origin period',
      value: 'Between 563 BCE and 483 BCE',
      qualification:
        'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
      referenceCount: 1,
      claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
    }),
  ]),
})

export function isReviewedVerifiedFact(fact) {
  if (!fact || typeof fact !== 'object') {
    return false
  }

  return REQUIRED_FIELDS.every((field) => {
    if (!Object.hasOwn(fact, field)) {
      return false
    }

    const value = fact[field]
    return typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined
  })
}

export function getReviewedVerifiedFacts({ language, outline, title }) {
  const contextKey = [language, outline, title].join(':')

  return (reviewedVerifiedFactsByContext[contextKey] ?? [])
    .filter(isReviewedVerifiedFact)
    .map((fact) => ({ ...fact }))
}
