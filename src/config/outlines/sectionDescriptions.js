const DESCRIPTIONS_BY_TITLE = Object.freeze({
  Introduction: 'A short summary of the subject.',
  'Early life': 'Childhood, family, and formative experiences.',
  Career: 'Major work and career milestones.',
  References: 'Sources used to support the article.',
  Background: 'Context and events leading to the subject.',
  'Recording and production': 'How and where the album was made.',
  Reception: 'Reviews, audience response, and notable performance.',
  Taxonomy: 'Scientific naming and classification.',
  Description: 'Distinctive physical features and appearance.',
  'Distribution and habitat': 'Where the species lives and its habitats.',
  'Ecology and behaviour': 'Diet, reproduction, behaviour, and environmental relationships.',
  'Course of the conflict': 'The conflict’s main events in order.',
  'Casualties and displacement': 'Deaths, injuries, displacement, and documented destruction.',
  'International response': 'Responses from governments, organisations, and civil society.',
  Aftermath: 'Consequences and longer-term effects.',
  Observation: 'Discovery and documented observations.',
  'Physical characteristics': 'Size, composition, and other physical properties.',
  History: 'How the subject developed over time.',
  'Selection and criteria': 'How recipients are chosen and recognised.',
  Recipients: 'People or organisations that received the award.',
  Plot: 'The complete story, including its ending.',
  'Major themes': 'Ideas identified by scholars and critics.',
  'Development history': 'How the work was written and developed.',
  Building: 'Architecture, construction, and building history.',
  'Public life': 'Public roles, activities, and documented prominence.',
  Characteristics: 'Defining qualities and notable traits.',
  Occurrence: 'How and where the element is found.',
  Applications: 'Main scientific, industrial, and biological uses.',
  Geography: 'Physical location, setting, climate, and features.',
  Demographics: 'Population size and community makeup.',
  'Impact and legacy': 'Lasting contributions, influence, and documented criticism.',
  'External links': 'Relevant websites for further information.',
  Politics: 'Government system and key institutions.',
  'Administrative divisions': 'The country’s main internal divisions.',
  Ecology: 'Plants, animals, and ecological features.',
  Geology: 'Geological origin, formation, and composition.',
  'Signs and symptoms': 'Common symptoms and possible complications.',
  Causes: 'Factors that create or contribute to the subject.',
  Diagnosis: 'How the condition is identified.',
  Treatment: 'Main approaches used to manage the condition.',
  Epidemiology: 'How often the condition occurs and where.',
  'Medical uses': 'What the test diagnoses, screens, or monitors.',
  Procedure: 'How the medical test is performed.',
  Interpretation: 'What normal and abnormal results mean.',
  'Risks and limitations': 'Known risks, limits, and possible errors.',
  Collection: 'The museum’s main objects and collection areas.',
  'Influence and legacy': 'Cultural impact and influence on other genres.',
  'Musical style': 'Genre, sound, and notable musical qualities.',
  Discography: 'A summary of the musician’s major releases.',
  Legacy: 'Lasting contributions and later recognition.',
  'Early life and education': 'Childhood, studies, and early professional background.',
  'Political career': 'Political roles, milestones, and policy work.',
  Features: 'Main functions, qualities, and specifications.',
  Event: 'What happened, presented in chronological order.',
  Responses: 'Reactions from relevant groups and communities.',
  'Beliefs and theology': 'Central beliefs, doctrines, and worldview.',
  Practices: 'Main rituals, observances, and religious activities.',
  'Curriculum and academics': 'Subjects, programmes, and distinctive academic work.',
  'Notable alumni': 'Notable people who attended the school.',
  'Definition and scope': 'How research and policy sources define the issue.',
  Effects: 'Documented impacts on people and society.',
  'Responses and policy': 'Policies, frameworks, and community responses.',
  'Prevalence and statistics': 'Reliable figures showing the issue’s scale.',
  Stadium: 'The club’s home ground and its history.',
  Honours: 'Competitions and titles won by the club.',
  'Professional career': 'Important stages and milestones in the career.',
  'Honours and achievements': 'Major awards, titles, and competitive achievements.',
  'Cast and characters': 'Actors, roles, and brief character details.',
  Production: 'How the television series was developed and made.',
  Statement: 'The theorem expressed using standard notation.',
  'Significance and applications': 'Why the theorem matters and where it applies.',
  Academics: 'Faculties, programmes, and distinctive academic qualities.',
  Research: 'Notable research work, centres, and outputs.',
  'Notable people': 'Notable alumni and faculty members.',
  Gameplay: 'Core mechanics, perspective, and player objectives.',
  Development: 'How the video game was designed and produced.',
})

function genericDescription(title) {
  const normalizedTitle = String(title || '').trim()
  if (!normalizedTitle) return 'Key information for this section.'

  return `Key information about ${normalizedTitle.toLocaleLowerCase()}.`
}

/**
 * Return the supporting line shown beneath an outline item's title.
 */
export function getOutlineItemDescription(item, outline) {
  const title = String(item?.title || '').trim()

  if (title === 'Introduction') {
    const outlineLabel = String(outline?.label || '').trim()
    if (outlineLabel) return `A short summary of the ${outlineLabel.toLocaleLowerCase()}.`
  }

  return DESCRIPTIONS_BY_TITLE[title] || genericDescription(title)
}
