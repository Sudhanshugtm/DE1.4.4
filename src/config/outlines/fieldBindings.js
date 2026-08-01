/**
 * Explicit semantic equivalence for scaffold fields.
 *
 * Labels are verbatim and keys are scoped to one outline. Empty entries are
 * deliberate: those outlines currently contain no safely reusable fact.
 */
export const fieldBindings = Object.freeze({
  actor: {
    '[Full name]': 'actor:subject-name',
    '[date]': 'actor:birth-date',
    '[place of birth]': 'actor:birthplace',
    '[place]': 'actor:birthplace',
  },
  album: {
    '[Album title]': 'album:subject-name',
  },
  animal: {
    '[common name]': 'animal:subject-name',
    '[geographic range]': 'animal:geographic-range',
  },
  'armed-conflict': {},
  'astronomical-object': {
    '[Object name]': 'astronomical-object:subject-name',
  },
  award: {
    '[award name]': 'award:subject-name',
  },
  book: {},
  building: {},
  celebrity: {
    '[Full name]': 'celebrity:subject-name',
    '[date]': 'celebrity:birth-date',
    '[place]': 'celebrity:birthplace',
  },
  'chemical-element': {
    '[Element name]': 'chemical-element:subject-name',
  },
  city: {
    '[City name]': 'city:subject-name',
  },
  company: {
    '[Company name]': 'company:subject-name',
    '[Company Name]': 'company:subject-name',
  },
  country: {
    '[Country name]': 'country:subject-name',
  },
  'human-settlement': {
    '[Settlement name]': 'human-settlement:subject-name',
    '[region]': 'human-settlement:region',
  },
  island: {
    '[Island name]': 'island:subject-name',
    '[body of water]': 'island:body-of-water',
  },
  landform: {
    '[Feature name]': 'landform:subject-name',
  },
  'literary-work': {},
  'medical-condition': {
    '[Condition name]': 'medical-condition:subject-name',
    '[condition name]': 'medical-condition:subject-name',
  },
  'medical-test': {
    '[Test name]': 'medical-test:subject-name',
  },
  museum: {
    '[museum name]': 'museum:subject-name',
    '[Museum name]': 'museum:subject-name',
    '[year]': 'museum:founding-year',
  },
  'music-genre': {},
  musician: {
    '[Full name]': 'musician:subject-name',
    '[date]': 'musician:birth-date',
    '[place of birth]': 'musician:birthplace',
    '[place]': 'musician:birthplace',
  },
  person: {
    '[Full name]': 'person:subject-name',
    '[date]': 'person:birth-date',
    '[place of birth]': 'person:birthplace',
    '[place]': 'person:birthplace',
  },
  plant: {
    '[common name]': 'plant:subject-name',
    '[geographic range]': 'plant:geographic-range',
  },
  politician: {
    '[Full name]': 'politician:subject-name',
    '[date]': 'politician:birth-date',
    '[place of birth]': 'politician:birthplace',
    '[place]': 'politician:birthplace',
  },
  product: {
    '[Product name]': 'product:subject-name',
    '[year]': 'product:release-year',
  },
  'recent-event': {},
  religion: {},
  school: {
    '[School name]': 'school:subject-name',
    '[year]': 'school:founding-year',
  },
  'social-issue': {},
  software: {
    '[Software name]': 'software:subject-name',
    '[developer or organisation]': 'software:developer',
    '[year]': 'software:release-year',
  },
  song: {
    '[Song title]': 'song:subject-name',
  },
  'sports-club': {
    '[Club name]': 'sports-club:subject-name',
    '[year]': 'sports-club:founding-year',
  },
  sportsperson: {
    '[Full name]': 'sportsperson:subject-name',
    '[date]': 'sportsperson:birth-date',
    '[place of birth]': 'sportsperson:birthplace',
    '[place]': 'sportsperson:birthplace',
  },
  'television-series': {
    '[Series title]': 'television-series:subject-name',
  },
  theorem: {
    '[theorem name]': 'theorem:subject-name',
  },
  university: {
    '[University name]': 'university:subject-name',
    '[year]': 'university:founding-year',
  },
  'video-game': {
    '[Game title]': 'video-game:subject-name',
  },
})

export function getFieldBindingKey(outlineId, label) {
  return fieldBindings[outlineId]?.[label] ?? null
}
