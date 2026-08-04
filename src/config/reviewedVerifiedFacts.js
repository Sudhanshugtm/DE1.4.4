const REQUIRED_FIELDS = [
  'id',
  'outlineId',
  'sectionId',
  'sectionLabel',
  'targetFieldId',
  'targetFieldToken',
  'fieldLabel',
  'label',
  'value',
  'qualification',
  'referenceCount',
  'claimUrl',
]
const REQUIRED_TEXT_FIELDS = REQUIRED_FIELDS.filter(
  (field) => field !== 'referenceCount' && field !== 'claimUrl',
)

const reviewedTargetContexts = Object.freeze({
  'country:introduction:official-name': Object.freeze({
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:official-name',
    targetFieldToken: '[official name]',
    fieldLabel: 'Official name',
  }),
  'country:introduction:area': Object.freeze({
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:area',
    targetFieldToken: '[area]',
    fieldLabel: 'Area',
  }),
  'country:introduction:population': Object.freeze({
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:population',
    targetFieldToken: '[population]',
    fieldLabel: 'Population',
  }),
  'country:introduction:language': Object.freeze({
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:language',
    targetFieldToken: '[language]',
    fieldLabel: 'Official language',
  }),
  'religion:introduction:approximate-period': Object.freeze({
    outlineId: 'religion',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'religion:introduction:approximate-period',
    targetFieldToken: '[approximate period]',
    fieldLabel: 'Approximate period',
  }),
})

const reviewedVerifiedFactsByContext = Object.freeze({
  'en:country:Portugal': Object.freeze([
    Object.freeze({
      id: 'portugal-official-name-portuguese',
      ...reviewedTargetContexts['country:introduction:official-name'],
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
      ...reviewedTargetContexts['country:introduction:area'],
      label: 'Area',
      value: '92,225 km²',
      qualification: 'Wikidata records this area with a point in time of 2021 and cites Pordata.',
      referenceCount: 1,
      claimUrl: 'https://www.wikidata.org/wiki/Q45#P2046',
    }),
    Object.freeze({
      id: 'portugal-population-2021-census',
      ...reviewedTargetContexts['country:introduction:population'],
      label: 'Population',
      value: '10,347,892',
      qualification:
        "The preferred Wikidata population statement is dated 2021, uses the census method, and cites Portugal's national statistics office.",
      referenceCount: 1,
      claimUrl: 'https://www.wikidata.org/wiki/Q45#P1082',
    }),
    Object.freeze({
      id: 'portugal-official-language',
      ...reviewedTargetContexts['country:introduction:language'],
      label: 'Official language',
      value: 'Portuguese',
      qualification:
        "Wikidata records Portuguese as the current normal-rank official-language value and cites section 11.3 of Portugal's constitution.",
      referenceCount: 1,
      claimUrl: 'https://www.wikidata.org/wiki/Q45#P37',
    }),
  ]),
  'en:religion:Buddhism': Object.freeze([
    Object.freeze({
      id: 'buddhism-inception-range',
      ...reviewedTargetContexts['religion:introduction:approximate-period'],
      label: 'Approximate origin period',
      value: 'Between 563 BCE and 483 BCE',
      qualification:
        'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
      referenceCount: 1,
      claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
    }),
  ]),
})

export function isReviewedVerifiedFact(fact, currentOutlineId) {
  if (
    !fact ||
    typeof fact !== 'object' ||
    Array.isArray(fact) ||
    typeof currentOutlineId !== 'string' ||
    currentOutlineId === '' ||
    !REQUIRED_FIELDS.every((field) => Object.hasOwn(fact, field))
  ) {
    return false
  }

  if (
    !REQUIRED_TEXT_FIELDS.every(
      (field) => typeof fact[field] === 'string' && fact[field].trim() !== '',
    ) ||
    !Number.isInteger(fact.referenceCount) ||
    fact.referenceCount <= 0 ||
    typeof fact.claimUrl !== 'string' ||
    !/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+#P\d+$/.test(fact.claimUrl)
  ) {
    return false
  }

  if (
    Object.hasOwn(fact, 'valueLanguage') &&
    (typeof fact.valueLanguage !== 'string' || fact.valueLanguage !== 'pt')
  ) {
    return false
  }

  if (!Object.hasOwn(reviewedTargetContexts, fact.targetFieldId)) {
    return false
  }

  const reviewedContext = reviewedTargetContexts[fact.targetFieldId]
  return (
    fact.outlineId === currentOutlineId &&
    Object.entries(reviewedContext).every(([field, value]) => fact[field] === value)
  )
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
    .filter((fact) => isReviewedVerifiedFact(fact, outline))
    .map((fact) => ({ ...fact }))
}
