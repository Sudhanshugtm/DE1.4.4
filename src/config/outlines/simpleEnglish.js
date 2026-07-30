/**
 * Article structures from the Simple English Wikipedia Article Guidance pages.
 * Scaffold wikitext is preserved verbatim apart from surrounding whitespace.
 */

export const simpleEnglishOutlines = [
  {
    id: 'actor',
    label: 'Actor',
    articleType: 'Q33999',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Actor',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Full name]''' (born [date], [place of birth]) is a [nationality] actor known for [primary role or notable work]. {{Citation needed}} [He/She/They] is best known for [key role or achievement]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'early-life',
        title: 'Early life',
        content: `[Full name] was born on [date] in [place] and grew up in [location]. {{Citation needed}} [Brief relevant detail about background or early interest in acting if well sourced]. {{Citation needed}}`,
      },
      {
        id: 'career',
        title: 'Career',
        content: `[Full name] began [his/her/their] acting career in [year]. [Description of key roles and career milestones in chronological order, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'album',
    label: 'Album',
    articleType: 'Q482994',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Album',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''"[Album title]"''' is the [first/second…] studio album by [artist name], released on [date] through [record label]. {{Citation needed}} [One sentence on the album's context, style, or significance.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'background',
        title: 'Background',
        content: `[Description of what the artist was doing before the album, and what led to its creation. Based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'recording-and-production',
        title: 'Recording and production',
        content: `[Description of where and how the album was recorded, who produced it, and any notable aspects of the recording process.] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Album title] received [description of critical reception, based on independent reviews. Include chart performance where relevant.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'animal',
    label: 'Animal',
    articleType: 'Q729',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Animal',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `The '''[common name]''' (''[scientific name]'') is a species of [taxonomic group] in the family [family name]. {{Citation needed}} It is native to [geographic range]. {{Citation needed}} [One sentence on its most distinctive characteristic or conservation status.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'taxonomy',
        title: 'Taxonomy',
        content: `The [common name] was first described by [authority name] in [year]. {{Citation needed}} [Description of taxonomic history and classification, including any synonyms or subspecies.] {{Citation needed}}`,
      },
      {
        id: 'description',
        title: 'Description',
        content: `[Description of the animal's physical characteristics that distinguish it from closely related species.] {{Citation needed}}`,
      },
      {
        id: 'distribution-and-habitat',
        title: 'Distribution and habitat',
        content: `The [common name] is found in [geographic range]. [Description of the habitats in which the species lives.] {{Citation needed}}`,
      },
      {
        id: 'ecology-and-behaviour',
        title: 'Ecology and behaviour',
        content: `[Description of the animal's diet, reproduction, social behaviour, and interactions with its environment.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'armed-conflict',
    label: 'Armed Conflict',
    articleType: 'Q180684',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Armed_Conflict',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `The '''[conflict name]''' was [is] a [type: war / battle / insurgency / civil war] that [began / took place] in [year] [in/between] [location or parties]. {{Citation needed}} [One sentence on scale, outcome, or significance.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'background',
        title: 'Background',
        content: `[Description of the political, historical, and social context that led to the conflict, based on scholarly and independent sources.] {{Citation needed}}`,
      },
      {
        id: 'course-of-the-conflict',
        title: 'Course of the conflict',
        content: `[Chronological, factual account of the main phases and events of the conflict, based on multiple independent sources.] {{Citation needed}}`,
      },
      {
        id: 'casualties-and-displacement',
        title: 'Casualties and displacement',
        content: `[Description of documented human costs: combatant and civilian casualties, displaced persons, and destruction of infrastructure. Present all credible estimates with full attribution.] {{Citation needed}}`,
      },
      {
        id: 'international-response',
        title: 'International response',
        content: `[Description of reactions from governments, international organisations, and civil society, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'aftermath',
        title: 'Aftermath',
        content: `[Description of the consequences and legacy of the conflict, based on independent scholarly sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'astronomical-object',
    label: 'Astronomical Object',
    articleType: 'Q6999',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Astronomical_Object',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Object name]''' ([catalogue designation]) is a [type: spiral galaxy / red giant / asteroid] located [in the constellation [Name] / at a distance of approximately [distance] from Earth]. {{Citation needed}} [One sentence on its most notable characteristic or significance.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'observation',
        title: 'Observation',
        content: `[Object name] was first observed [or catalogued] by [observer] in [year]. {{Citation needed}} [Description of how the object was discovered and documented.] {{Citation needed}}`,
      },
      {
        id: 'physical-characteristics',
        title: 'Physical characteristics',
        content: `[Description of the object's key physical properties: size, mass, luminosity, temperature, spectral type, or composition, based on peer-reviewed sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'award',
    label: 'Award',
    articleType: 'Q618779',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Award',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `The '''[award name]''' is an award given [annually / periodically] by [awarding body] to [recipients: individuals / organisations] in recognition of [criterion: achievement in / contribution to / excellence in]. {{Citation needed}} [One sentence on when it was established and its significance in its field.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Description of when and why the award was established, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'selection-and-criteria',
        title: 'Selection and criteria',
        content: `[Description of how recipients are selected and what the award recognises, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'recipients',
        title: 'Recipients',
        content: `[Brief overview of notable recipients where independently documented. For long lists, link to a separate list article: {{main|List of [award name] recipients}}] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'book',
    label: 'Book',
    articleType: 'Q47461344',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Book',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Title]''' is a [type: novel / short story / poem / play] by [author name], first published in [year]. {{Citation needed}} [One sentence describing the work's genre, setting, or central subject.] {{Citation needed}} [One sentence on its critical reception or significance.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'plot',
        title: 'Plot',
        content: `[Summary of the plot in 400–700 words, written in the present tense. Include all major plot points and the ending. Do not use teaser-style descriptions that withhold information.] {{Citation needed}}`,
      },
      {
        id: 'major-themes',
        title: 'Major themes',
        content: `[Description of the work's major themes, based on what literary scholars and critics have written, not on personal interpretation.] {{Citation needed}}`,
      },
      {
        id: 'development-history',
        title: 'Development history',
        content: `[Description of how the work was written and developed, if documented in independent sources.] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Description of how the work was received by critics and readers when published, and its longer critical legacy, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'building',
    label: 'Building',
    articleType: 'Q41176',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Building',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `The '''[building name]''' is a [type: office building / theatre / stadium / factory / etc.] located in [city], [country]. {{Citation needed}}  [It was built / constructed / completed] in [year or approximate period] and was designed by [architect, if known and independently documented]. {{Citation needed}} [One sentence on its architectural, historical, or cultural significance, based on independent sources.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Description of the building's construction, commissioning, and key historical events associated with it, based on independent scholarly or journalistic sources.] {{Citation needed}}`,
      },
      {
        id: 'building',
        title: 'Building',
        content: `[description of the building, its architecture, and history if well-sourced].] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'celebrity',
    label: 'Celebrity',
    articleType: 'Q211236',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Celebrity',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Full name]''' (born [date], [place]) is a [nationality] [description of public role or social prominence]. {{Citation needed}} [He/She/They] is known for [primary reason for public recognition, supported by independent sources]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'early-life',
        title: 'Early life',
        content: `[Full name] was born on [date] in [place] and grew up in [location]. {{Citation needed}} [Brief relevant detail about background if well sourced.] {{Citation needed}}`,
      },
      {
        id: 'public-life',
        title: 'Public life',
        content: `[Description of the person's public role, social prominence, philanthropic work, or other documented activities, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'chemical-element',
    label: 'Chemical Element',
    articleType: 'Q11344',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Chemical_Element',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Element name]''' is a chemical element with symbol [X] and atomic number [N]. {{Citation needed}} It is a [physical description at standard conditions, e.g. silvery metal / colourless gas] and belongs to [group/period/block] of the periodic table. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'characteristics',
        title: 'Characteristics',
        content: `[Physical and chemical properties at standard conditions. Include allotropes if relevant.] {{Citation needed}}`,
      },
      {
        id: 'history',
        title: 'History',
        content: `[Element name] was [discovered / first isolated] by [person] in [year]. {{Citation needed}} [History of naming, early uses, and key milestones.] {{Citation needed}}`,
      },
      {
        id: 'occurrence',
        title: 'Occurrence',
        content: `[Element name] occurs [naturally / synthetically]. [Description of how and where it is found.] {{Citation needed}}`,
      },
      {
        id: 'applications',
        title: 'Applications',
        content: `[Main industrial, scientific, and biological uses.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'city',
    label: 'City',
    articleType: 'Q515',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/City',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[City name]''' is a city in [region/country]. {{Citation needed}} It has a population of approximately [population] and is the [administrative status: capital / largest city] of [region or country]. {{Citation needed}} [One sentence on its most notable characteristic, historical role, or economic significance.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[City name] was [founded/established] in [approximate period]. [Description of key milestones in the city's history, based on independent scholarly sources.] {{Citation needed}}`,
      },
      {
        id: 'geography',
        title: 'Geography',
        content: `[City name] is located at [coordinates] in [region]. [Description of the city's physical setting, climate, and geographic features.] {{Citation needed}}`,
      },
      {
        id: 'demographics',
        title: 'Demographics',
        content: `[City name] has a population of approximately [number] as of [year]. [Description of demographic features including languages, religions, and ethnic composition if well-sourced.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    articleType: 'Q4830453',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Company',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Company name]''' is a [nationality] company that [company activity].{{Citation needed}}
The company is known for [notable products, activities and achievements].{{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Company Name] was founded in [location] in [year] by [Founder Name] with the goal of [original mission or product]. It launched its first [product/service] in [year], targeting [market].{{Citation needed}}`,
      },
      {
        id: 'impact-and-legacy',
        title: 'Impact and legacy',
        content: `[Company name] is recognised for [lasting contribution or impact].{{Citation needed}}
Criticism of [Company name] has arisen from various groups concerning [criticism or controversy]. {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
      {
        id: 'external-links',
        title: 'External links',
        content: `* [Company official website]`,
      },
    ],
  },
  {
    id: 'country',
    label: 'Country',
    articleType: 'Q6256',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Country',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Country name]''', officially [official name], is a country in [region]. {{Citation needed}} It covers an area of [area] and has a population of approximately [population]. {{Citation needed}} The capital is [capital city] and the official language is [language]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Brief description of the country's historical origins and key periods, based on independent scholarly sources.] {{Citation needed}}`,
      },
      {
        id: 'geography',
        title: 'Geography',
        content: `[Country name] is located in [region], bordered by [neighbouring countries]. [Description of main geographical features and climate.] {{Citation needed}}`,
      },
      {
        id: 'politics',
        title: 'Politics',
        content: `[Country name] is a [form of government]. [Description of the current governmental system and key institutions.] {{Citation needed}}`,
      },
      {
        id: 'administrative-divisions',
        title: 'Administrative divisions',
        content: `[Country name] is divided into [type of subdivisions, e.g. provinces / states / departments]. [Overview of the main subdivisions.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'human-settlement',
    label: 'Human Settlement',
    articleType: 'Q486972',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Human_Settlement',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Settlement name]''' is a [type: town / village / hamlet] in [region], [country]. {{Citation needed}} It has a population of approximately [population] as of [year]. {{Citation needed}} [One sentence on its most notable characteristic or historical role, if applicable.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Brief description of the settlement's documented history, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'geography',
        title: 'Geography',
        content: `[Settlement name] is located at [coordinates] in [region]. [Description of the settlement's physical setting and
surroundings.] {{Citation needed}}`,
      },
      {
        id: 'demographics',
        title: 'Demographics',
        content: `[Settlement name] has a population of [number] as of [year]. [Description of demographic features where well-sourced.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'island',
    label: 'Island',
    articleType: 'Q23442',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Island',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Island name]''' is an island located in [body of water], [country or territory]. {{Citation needed}} It has an area of approximately [area] and a population of [population or uninhabited]. {{Citation needed}} [One sentence on notable characteristics such as administrative status, ecological significance, or historical role.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'geography',
        title: 'Geography',
        content: `[Island name] is situated at [coordinates] in [body of water]. [Description of the island's size, terrain, and geographic features.] {{Citation needed}}`,
      },
      {
        id: 'history',
        title: 'History',
        content: `[Description of the island's documented history, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'ecology',
        title: 'Ecology',
        content: `[Description of the island's flora, fauna, and ecological features, based on scientific sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'landform',
    label: 'Landform',
    articleType: 'Q271669',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Landform',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Feature name]''' is a [type: mountain / volcano / river / valley / lake] located in [country/region]. {{Citation needed}} It [brief description of key physical characteristics, e.g. reaches an elevation of / extends for / is the longest]. {{Citation needed}} [One sentence on any notable characteristic: ecological significance, historical role, or record.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'geography',
        title: 'Geography',
        content: `[Feature name] is situated at [coordinates] in [region]. [Description of the feature's physical characteristics: elevation, length, area, terrain, and its relation to surrounding geography.] {{Citation needed}}`,
      },
      {
        id: 'geology',
        title: 'Geology',
        content: `[Description of the feature's geological origin and composition, based on peer-reviewed sources. Include age, formation process, and rock type where relevant.] {{Citation needed}}`,
      },
      {
        id: 'ecology',
        title: 'Ecology',
        content: `[Description of the flora, fauna, and ecological significance of the feature, based on scientific sources.] {{Citation needed}}`,
      },
      {
        id: 'history',
        title: 'History',
        content: `[Description of any historical, cultural, or human significance the feature has had, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'literary-work',
    label: 'Literary Work',
    articleType: 'Q7725634',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Literary_Work',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Title]''' is a [type: novel / short story / poem / play] by [author name], first published in [year]. {{Citation needed}} [One sentence describing the work's genre, setting, or central subject.] {{Citation needed}} [One sentence on its critical reception or significance.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'plot',
        title: 'Plot',
        content: `[Summary of the plot in 400–700 words, written in the present tense. Include all major plot points and the ending. Do not use teaser-style descriptions that withhold information.] {{Citation needed}}`,
      },
      {
        id: 'major-themes',
        title: 'Major themes',
        content: `[Description of the work's major themes, based on what literary scholars and critics have written, not on personal interpretation.] {{Citation needed}}`,
      },
      {
        id: 'development-history',
        title: 'Development history',
        content: `[Description of how the work was written and developed, if documented in independent sources.] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Description of how the work was received by critics and readers when published, and its longer critical legacy, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'medical-condition',
    label: 'Medical Condition',
    articleType: 'Q103994247',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Medical_Condition',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Condition name]''' is a [acute/chronic] [type of condition] characterised by [key defining features]. {{Citation needed}} It primarily affects [affected population or body system] and is caused by [main cause or mechanism, if known]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'signs-and-symptoms',
        title: 'Signs and symptoms',
        content: `The most common signs and symptoms of [condition name] include [list key symptoms]. {{Citation needed}} In more severe cases, [complications or advanced symptoms]. {{Citation needed}}`,
      },
      {
        id: 'causes',
        title: 'Causes',
        content: `[Condition name] is caused by [main cause]. {{Citation needed}} Risk factors include [list of risk factors]. {{Citation needed}}`,
      },
      {
        id: 'diagnosis',
        title: 'Diagnosis',
        content: `[Condition name] is typically diagnosed through [diagnostic method]. {{Citation needed}}`,
      },
      {
        id: 'treatment',
        title: 'Treatment',
        content: `Treatment for [condition name] includes [main treatment approaches]. {{Citation needed}}`,
      },
      {
        id: 'epidemiology',
        title: 'Epidemiology',
        content: `[Condition name] affects approximately [number or proportion] of [population]. {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'medical-test',
    label: 'Medical Test',
    articleType: 'Q55215251',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Medical_Test',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Test name]''' is a medical test used to [purpose of the test: diagnose / screen for / monitor]. {{Citation needed}} It works by [brief description of the method or principle]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'medical-uses',
        title: 'Medical uses',
        content: `[Test name] is used to [describe the clinical indications: what conditions it diagnoses, screens for, or monitors]. {{Citation needed}}`,
      },
      {
        id: 'procedure',
        title: 'Procedure',
        content: `[Description of how the test is performed, based on clinical sources.] {{Citation needed}}`,
      },
      {
        id: 'interpretation',
        title: 'Interpretation',
        content: `[Description of what the results mean, including normal ranges and what abnormal results indicate, based on clinical sources.] {{Citation needed}}`,
      },
      {
        id: 'risks-and-limitations',
        title: 'Risks and limitations',
        content: `[Description of known limitations, false positive or negative rates, and any risks associated with the test.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'museum',
    label: 'Museum',
    articleType: 'Q33506',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Museum',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `The '''[museum name]''' is a [type:art museum / natural history museum / science museum] located in [city], [country]. {{Citation needed}} Founded in [year], it holds a collection of [brief description of collection focus]. {{Citation needed}} [One sentence on its significance or notable holdings, based on independent sources.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `The [Museum name] was founded in [year] by [founder or founding organisation]. [Description of key milestones in the museum's history, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'collection',
        title: 'Collection',
        content: `The museum's collection includes [description of the main areas of the collection, based on independent coverage rather than solely the museum's own promotional materials]. {{Citation needed}}`,
      },
      {
        id: 'building',
        title: 'Building',
        content: `The museum is housed in [description of the building, its architecture, and history if well-sourced].] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'music-genre',
    label: 'Music Genre',
    articleType: 'Q188451',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Music_Genre',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Genre name]''' is a genre of [broader category: popular music / electronic music / folk music] that emerged in [decade/period] in [place of origin]. {{Citation needed}} It is characterised by [key musical features]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'characteristics',
        title: 'Characteristics',
        content: `[Description of the musical features that define the genre: instrumentation, rhythm, tempo, lyrical themes, production style.] {{Citation needed}}`,
      },
      {
        id: 'history',
        title: 'History',
        content: `[Description of the genre's origins, development, and key moments, based on music scholarship and criticism.] {{Citation needed}}`,
      },
      {
        id: 'influence-and-legacy',
        title: 'Influence and legacy',
        content: `[Description of the genre's influence on other genres and its lasting cultural impact, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'musician',
    label: 'Musician',
    articleType: 'Q639669',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Musician',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Full name]''' (born [date], [place of birth]) is a [nationality] [musician type: singer-songwriter / guitarist / composer] known for [primary genre or notable work]. {{Citation needed}} [He/She/They] is best known for [key achievement or work]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'early-life',
        title: 'Early life',
        content: `[Full name] was born on [date] in [place]. {{Citation needed}} [Brief well-sourced background on early life and musical education or influences, if documented in independent sources.] {{Citation needed}}`,
      },
      {
        id: 'career',
        title: 'Career',
        content: `[Full name] began [his/her/their] musical career in [year]. [Description of key career milestones, recordings, and performances in chronological order, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'musical-style',
        title: 'Musical style',
        content: `[Full name]'s music is characterised by [description of style, genre, and notable musical features, based on what critics and music scholars have written.] {{Citation needed}}`,
      },
      {
        id: 'discography',
        title: 'Discography',
        content: `[Brief summary of major releases. A full discography is maintained in a separate article.]`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'person',
    label: 'Person',
    articleType: 'Q5',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Person',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Full name]''' (born [date], [place of birth]) is a [nationality] [profession] known for [primary achievement or contribution]. {{Citation needed}} [He/She/They] [brief additional notable fact, e.g., won the [Award Name] in [year] / directed [notable work] / led [organization]]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'early-life',
        title: 'Early life',
        content: `[Full name] was born on [date] in [place]. [He/She/They] grew up in [location]. {{Citation needed}} [Brief relevant detail about family background or upbringing if well sourced.]  {{Citation needed}}
[Full name] attended [school or university], where [he/she/they] studied [subject], graduating in [year]. [He/She/They] first gained wider recognition in [year] when [early notable achievement]. {{Citation needed}}`,
      },
      {
        id: 'career',
        title: 'Career',
        content: `[Full name] began [his/her/their] career in [year] as [role or position]. [Key milestone or achievement]. [He/She/They] is best known for [notable work, contribution, or event, supported by sources]. {{Citation needed}}`,
      },
      {
        id: 'legacy',
        title: 'Legacy',
        content: `[Full name] is recognised for [lasting contribution or impact]. [Any posthumous recognition or influence on the field.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'plant',
    label: 'Plant',
    articleType: 'Q756',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Plant',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `The '''[common name]''' (''[scientific name]'') is a species of [plant type, e.g. flowering plant / fern / tree] in the family [family name]. {{Citation needed}} It is native to [geographic range]. {{Citation needed}} [One sentence on its most distinctive characteristic, use, or conservation status.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'taxonomy',
        title: 'Taxonomy',
        content: `The [common name] was first formally described by [authority name] in [year]. {{Citation needed}} [Description of taxonomic history and classification.] {{Citation needed}}`,
      },
      {
        id: 'description',
        title: 'Description',
        content: `[Description of the plant's physical characteristics including growth habit, leaves, flowers, and fruit, that distinguish it from closely related species.] {{Citation needed}}`,
      },
      {
        id: 'distribution-and-habitat',
        title: 'Distribution and habitat',
        content: `The [common name] is native to [geographic range]. [Description of the habitats and conditions in which the species grows.] {{Citation needed}}`,
      },
      {
        id: 'ecology',
        title: 'Ecology',
        content: `[Description of the plant's ecological relationships, including pollinators, seed dispersers, and interactions with its environment.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'politician',
    label: 'Politician',
    articleType: 'Q82955',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Politician',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Full name]''' (born [date], [place of birth]) is a [nationality] politician who served as [highest office held] from [year] to [year]. [He/She/They] is a member of the [party name]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'early-life-and-education',
        title: 'Early life and education',
        content: `[Full name] was born on [date] in [place] and grew up in [location]. {{Citation needed}} [He/She/They] studied [subject] at [institution], graduating in [year]. {{Citation needed}} [Brief detail about pre-political career or background if well sourced.] {{Citation needed}}`,
      },
      {
        id: 'political-career',
        title: 'Political career',
        content: `[Full name] entered politics in [year] when [he/she/they] was [elected/appointed] as [first role]. [He/She/They] went on to serve as [subsequent roles, listed chronologically]. [He/She/They] is particularly associated with [key policy area, legislation, or political event]. {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'product',
    label: 'Product',
    articleType: 'Q11019',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Product',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Product name]''' is a [type of product] produced by [manufacturer]. {{Citation needed}} It was first released in [year] and is known for [key feature or purpose]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Product name] was introduced in [year] by [company]. [Description of development history and key milestones, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'features',
        title: 'Features',
        content: `[Description of the product's main features and specifications, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Product name] received [description of critical and commercial reception, based on independent reviews and sales data.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'recent-event',
    label: 'Recent Event',
    articleType: 'Q108586636',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Recent_Event',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `The '''[event name]''' was a [brief description of what happened] that took place on [date] in [location]. {{Citation needed}} [One sentence on the immediate significance or scale of the event.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'background',
        title: 'Background',
        content: `[Relevant context that helps the reader understand why the event occurred.] {{Citation needed}}`,
      },
      {
        id: 'event',
        title: 'Event',
        content: `[Factual, chronological account of what happened, sourced throughout.] {{Citation needed}}`,
      },
      {
        id: 'responses',
        title: 'Responses',
        content: `[Reactions from relevant parties: governments, organisations, affected communities.] {{Citation needed}}`,
      },
      {
        id: 'aftermath',
        title: 'Aftermath',
        content: `[Documented consequences and developments following the event.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'religion',
    label: 'Religion',
    articleType: 'Q9174',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Religion',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Religion name]''' is a [major world religion / religious tradition / new religious movement] that originated in [region] in [approximate period]. {{Citation needed}} It has approximately [number] adherents worldwide. {{Citation needed}} [One sentence on its central belief or distinguishing feature.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Description of the religion's origins and historical development, based on independent scholarly sources.] {{Citation needed}}`,
      },
      {
        id: 'beliefs-and-theology',
        title: 'Beliefs and theology',
        content: `[Description of the religion's central beliefs, doctrines, and worldview, based on what scholars of religion have documented. Written in the third person and without evaluating the truth of the beliefs.] {{Citation needed}}`,
      },
      {
        id: 'practices',
        title: 'Practices',
        content: `[Description of the religion's main practices, rituals, and observances, based on academic sources.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'school',
    label: 'School',
    articleType: 'Q112872396',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/School',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[School name]''' is a [type, e.g. state secondary school / private academy] located in [location]. {{Citation needed}} It was founded in [year] and serves [brief description of student population or age range]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[School name] was established in [year]. [Description of key milestones in the school's history, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'curriculum-and-academics',
        title: 'Curriculum and academics',
        content: `[Brief description of the curriculum and any distinctive academic programmes. Focus on aspects unique to the school and supported by sources.] {{Citation needed}}`,
      },
      {
        id: 'notable-alumni',
        title: 'Notable alumni',
        content: `*[Name], [brief description of notability], [years attended] {{Citation needed}}
*[Name], [brief description of notability], [years attended] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
      {
        id: 'external-links',
        title: 'External links',
        content: `* [https://Official-Website-URL Official Website]`,
      },
    ],
  },
  {
    id: 'social-issue',
    label: 'Social Issue',
    articleType: 'Q1920219',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Social_Issue',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Issue name]''' is a social issue characterised by [brief definition of the problem]. {{Citation needed}} It affects [affected population or communities] and has been documented across [scope: specific countries / regions / globally]. {{Citation needed}} [One sentence on scale or significance, based on research or official data.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'definition-and-scope',
        title: 'Definition and scope',
        content: `[Description of how the issue is defined in academic and policy literature, including any variation in definition across contexts or disciplines.] {{Citation needed}}`,
      },
      {
        id: 'causes',
        title: 'Causes',
        content: `[Description of the documented causes and contributing factors, based on peer-reviewed research and official reports. Where causes are contested, present the range of scholarly perspectives.] {{Citation needed}}`,
      },
      {
        id: 'effects',
        title: 'Effects',
        content: `[Description of the documented effects on individuals, communities, and society, based on research and official data.] {{Citation needed}}`,
      },
      {
        id: 'responses-and-policy',
        title: 'Responses and policy',
        content: `[Description of documented responses to the issue: government policies, international frameworks, community initiatives. Present factually and neutrally without advocating for any particular approach.] {{Citation needed}}`,
      },
      {
        id: 'prevalence-and-statistics',
        title: 'Prevalence and statistics',
        content: `[Key statistics on the scale and distribution of the issue, sourced from official government data, UN agencies, or peer-reviewed research. Include the date of the data and its source.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'software',
    label: 'Software',
    articleType: 'Q7397',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Software',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Software name]''' is a [type of software: open-source web browser / proprietary image editor] developed by [developer or organisation]. {{Citation needed}} First released in [year], it [brief description of primary function and platform]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Software name] was first released in [year] by [developer or organisation]. [Description of key milestones in the software's development history, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'features',
        title: 'Features',
        content: `[Software name] provides [description of primary features, based on independent coverage rather than developer documentation.] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Software name] received [description of critical and user reception, based on independent reviews and coverage.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'song',
    label: 'Song',
    articleType: 'Q105543609',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Song',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Song title]''' is a song by [author name]. It was released by [company] on [date] as part of [music album]. The song was written by [writer] and produced by [producer]. {{Citation needed}}

The song consists of [description of musical style and singular aspects]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'background',
        title: 'Background',
        content: `[Artist name] composed the song [circumstasnces aout the song origin] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Song title] received [critic response and key achievements signaling its relevance] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'sports-club',
    label: 'Sports Club',
    articleType: 'Q847017',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Sports_Club',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Club name]''' is a [sport] club based in [location], [country]. {{Citation needed}} Founded in [year], the club [brief description of notable history or current status: competes in the X league / is known for Y achievement]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[Club name] was founded in [year] in [location]. [Description of key milestones in the club's history, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'stadium',
        title: 'Stadium',
        content: `[Club name] plays its home matches at [stadium name], which has a capacity of [number]. {{Citation needed}} [Brief history of the ground if well sourced.] {{Citation needed}}`,
      },
      {
        id: 'honours',
        title: 'Honours',
        content: `* [Competition name]: [year(s)] {{Citation needed}}
* [Competition name]: [year(s)] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'sportsperson',
    label: 'Sportsperson',
    articleType: 'Q2066131',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Sportsperson',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Full name]''' (born [date], [place of birth]) is a [nationality] [profession] known for [primary achievement or contribution]. {{Citation needed}} [He/She/They] [brief additional notable fact, e.g., won the [Award Name] in [year] / directed [notable work] / led [organization]]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'early-life',
        title: 'Early life',
        content: `[Full name] was born on [date] in [place]. [He/She/They] grew up in [location]. {{Citation needed}} [Brief relevant detail about family background or upbringing if well sourced.]  {{Citation needed}}`,
      },
      {
        id: 'professional-career',
        title: 'Professional career',
        content: `[Describe significant steps in the career] {{Citation needed}}`,
      },
      {
        id: 'honours-and-achievements',
        title: 'Honours and achievements',
        content: `* [Competition and year]  {{Citation needed}}
* [Competition and year]  {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'television-series',
    label: 'Television Series',
    articleType: 'Q5398426',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Television_Series',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Series title]''' is a [nationality] [genre] television series [created/developed] by [creator name]. {{Citation needed}} It premiered on [network/platform] on [date]. {{Citation needed}} The series follows [brief one-sentence plot]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'plot',
        title: 'Plot',
        content: `[Brief description of the series concept, setting, and main characters. This section should be a summary, not a scene-by-scene account.] {{Citation needed}}`,
      },
      {
        id: 'cast-and-characters',
        title: 'Cast and characters',
        content: `* [Actor name] as [character name], [brief character description] {{Citation needed}}
* [Actor name] as [character name], [brief character description] {{Citation needed}}`,
      },
      {
        id: 'production',
        title: 'Production',
        content: `[Description of how the series was developed, commissioned, and made, based on independent sources. May include development, casting, and filming information.] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Series title] received [description of critical and audience reception, based on independent reviews and ratings data.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'theorem',
    label: 'Theorem',
    articleType: 'Q65943',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Theorem',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `In [field of mathematics], the '''[theorem name]''' states that [brief description of what the theorem asserts]. {{Citation needed}} It was first proved by [mathematician name] in [year]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'statement',
        title: 'Statement',
        content: `[State the theorem formally or semi-formally, using standard notation.] {{Citation needed}}`,
      },
      {
        id: 'significance-and-applications',
        title: 'Significance and applications',
        content: `The [theorem name] is significant because [explanation of importance and influence in mathematics or related fields]. {{Citation needed}} It has been applied in [fields or areas]. {{Citation needed}}`,
      },
      {
        id: 'history',
        title: 'History',
        content: `[History of the theorem's discovery, proof, and reception in the mathematical community.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'university',
    label: 'University',
    articleType: 'Q3918',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/University',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[University name]''' is a [public/private] university located in [location]. {{Citation needed}} It was founded in [year] and offers [brief description of academic programmes, e.g. undergraduate and postgraduate degrees]. {{Citation needed}}`,
    },
    sections: [
      {
        id: 'history',
        title: 'History',
        content: `[University name] was founded in [year]. [Description of key milestones in the institution's history, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'academics',
        title: 'Academics',
        content: `[Brief description of faculties, programmes, and any distinctive academic character. Include accreditation where relevant.] {{Citation needed}}`,
      },
      {
        id: 'research',
        title: 'Research',
        content: `[Description of notable research activity, centres, or outputs supported by independent sources.] {{Citation needed}}`,
      },
      {
        id: 'notable-people',
        title: 'Notable people',
        content: `*[Name], [brief description, e.g. Nobel laureate / head of state], [role: alumnus/faculty] {{Citation needed}}
*[Name], [brief description], [role] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
  {
    id: 'video-game',
    label: 'Video Game',
    articleType: 'Q7889',
    sourceUrl: 'https://simple.wikipedia.org/wiki/Wikipedia:Article_Guidance/Video_Game',
    lead: {
      id: 'introduction',
      title: 'Introduction',
      content: `'''[Game title]''' is a [year] [genre] video game developed by [developer] and published by [publisher]. {{Citation needed}} [One sentence on platform(s) and release context.] {{Citation needed}} [One sentence on reception or significance.] {{Citation needed}}`,
    },
    sections: [
      {
        id: 'gameplay',
        title: 'Gameplay',
        content: `[Description of the game's core mechanics, perspective, and player objectives, based on what independent sources have described. Do not reproduce in-game tutorials or official feature lists.] {{Citation needed}}`,
      },
      {
        id: 'plot',
        title: 'Plot',
        content: `[Summary of the game's narrative, written in the present tense. Keep to essential story beats. Avoid spoiler-style descriptions that withhold information.] {{Citation needed}}`,
      },
      {
        id: 'development',
        title: 'Development',
        content: `[Description of how the game was developed: studio, engine, development timeline, and any notable production circumstances, based on independent sources.] {{Citation needed}}`,
      },
      {
        id: 'reception',
        title: 'Reception',
        content: `[Game title] received [description of critical and commercial reception, based on independent reviews. Include aggregate review scores and notable awards where relevant.] {{Citation needed}}`,
      },
      {
        id: 'references',
        title: 'References',
        content: `<references>
$1
</references>`,
      },
    ],
  },
]

export const simpleEnglishOutlinesById = Object.fromEntries(
  simpleEnglishOutlines.map((outline) => [outline.id, outline]),
)
