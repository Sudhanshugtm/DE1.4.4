const REQUIRED_FIELDS = ['id', 'label', 'value', 'qualification', 'referenceCount', 'claimUrl']
const REQUIRED_TEXT_FIELDS = ['id', 'label', 'value', 'qualification']

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
  if (!fact || typeof fact !== 'object' || Array.isArray(fact)) {
    return false
  }

  if (!REQUIRED_FIELDS.every((field) => Object.hasOwn(fact, field))) {
    return false
  }

  if (
    !REQUIRED_TEXT_FIELDS.every(
      (field) => typeof fact[field] === 'string' && fact[field].trim() !== '',
    ) ||
    !Number.isInteger(fact.referenceCount) ||
    fact.referenceCount <= 0 ||
    typeof fact.claimUrl !== 'string'
  ) {
    return false
  }

  try {
    const claimUrl = new URL(fact.claimUrl)
    return (
      claimUrl.protocol === 'https:' &&
      claimUrl.hostname === 'www.wikidata.org' &&
      /^#P\d+$/.test(claimUrl.hash)
    )
  } catch {
    return false
  }
}

export function getReviewedVerifiedFacts(context) {
  if (
    !context ||
    typeof context !== 'object' ||
    Array.isArray(context) ||
    typeof context.language !== 'string' ||
    typeof context.outline !== 'string' ||
    typeof context.title !== 'string'
  ) {
    return []
  }

  const { language, outline, title } = context
  const contextKey = [language, outline, title].join(':')

  return (reviewedVerifiedFactsByContext[contextKey] ?? [])
    .filter(isReviewedVerifiedFact)
    .map((fact) => ({ ...fact }))
}
