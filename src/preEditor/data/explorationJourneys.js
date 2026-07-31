import { simpleEnglishOutlinesById } from '../../config/outlines/simpleEnglish.js'

const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }

  return value
}

const explorationArticle = deepFreeze({
  title: 'Exploration',
  description: {
    id: 'meta-description',
    text: 'Travel and study undertaken to learn about unfamiliar places',
    sourceIds: ['national-geographic-why-we-explore'],
  },
  sources: {
    'national-geographic-why-we-explore': {
      publisher: 'National Geographic Society',
      url: 'https://education.nationalgeographic.org/resource/why-we-explore/',
    },
    'rgs-geographical-exploration': {
      publisher: 'Royal Geographical Society',
      url: 'https://www.rgs.org/exploration/what-is-geographical-exploration',
    },
    'national-geographic-geography': {
      publisher: 'National Geographic Society',
      url: 'https://education.nationalgeographic.org/resource/geography-article/',
    },
    'national-geographic-everest': {
      publisher: 'National Geographic',
      url: 'https://www.nationalgeographic.com/adventure/article/climbing-mount-everest-1',
    },
    'esa-easter-island': {
      publisher: 'European Space Agency',
      url: 'https://www.esa.int/ESA_Multimedia/Images/2019/04/Easter_Island',
    },
    'google-earth-desktop': {
      publisher: 'Google Earth',
      url: 'https://earth.google.com/desktop/',
    },
    'nasa-mars-exploration': {
      publisher: 'NASA',
      url: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/',
    },
    'nasa-neil-armstrong': {
      publisher: 'NASA',
      url: 'https://www.nasa.gov/people/neil-a-armstrong/',
    },
    'esa-valentina-tereshkova': {
      publisher: 'European Space Agency',
      url: 'https://www.esa.int/About_Us/50_years_of_ESA/50_years_of_humans_in_space/First_woman_in_space_Valentina',
    },
    'isro-chandrayaan-3': {
      publisher: 'Indian Space Research Organisation',
      url: 'https://www.isro.gov.in/ISRO_EN/Chandrayaan3.html',
    },
    'nasa-commercial-crew-dragon': {
      publisher: 'NASA',
      url: 'https://www.nasa.gov/commercial-crew-program-press-kit/',
    },
  },
  sections: [
    {
      heading: 'Introduction',
      paragraphs: [
        {
          sentences: [
            {
              id: 'intro-definition',
              sourceIds: ['national-geographic-why-we-explore'],
              segments: [
                {
                  kind: 'text',
                  text: 'Exploration is travel over unfamiliar territory for discovery, or the careful study of something in order to learn more about it.',
                },
              ],
            },
            {
              id: 'intro-modern-practice',
              sourceIds: ['rgs-geographical-exploration'],
              segments: [
                {
                  kind: 'text',
                  text: 'Modern geographical exploration includes field research and the use of different tools and methods.',
                },
              ],
            },
            {
              id: 'intro-tools',
              sourceIds: ['national-geographic-geography'],
              segments: [
                { kind: 'context', text: 'Maps' },
                { kind: 'text', text: ' and ' },
                { kind: 'context', text: 'satellite images' },
                { kind: 'text', text: ' are among the tools used to study places.' },
              ],
            },
          ],
        },
      ],
    },
    {
      heading: 'Exploration on Earth',
      paragraphs: [
        {
          sentences: [
            {
              id: 'earth-everest',
              sourceIds: ['national-geographic-everest'],
              segments: [
                { kind: 'missing', text: 'Mount Everest', journeyKey: 'landform-mount-everest' },
                { kind: 'text', text: ' lies in the ' },
                { kind: 'context', text: 'Himalayas' },
                { kind: 'text', text: ' on the border between ' },
                { kind: 'context', text: 'Nepal' },
                { kind: 'text', text: ' and ' },
                { kind: 'context', text: 'China' },
                { kind: 'text', text: '.' },
              ],
            },
            {
              id: 'earth-easter-island',
              sourceIds: ['esa-easter-island'],
              segments: [
                { kind: 'missing', text: 'Easter Island', journeyKey: 'island-easter-island' },
                { kind: 'text', text: ', also called ' },
                { kind: 'context', text: 'Rapa Nui' },
                { kind: 'text', text: ', is a Chilean island in the ' },
                { kind: 'context', text: 'Pacific Ocean' },
                { kind: 'text', text: '.' },
              ],
            },
            {
              id: 'earth-google-earth',
              sourceIds: ['google-earth-desktop'],
              segments: [
                { kind: 'missing', text: 'Google Earth', journeyKey: 'software-google-earth' },
                {
                  kind: 'text',
                  text: ' displays satellite imagery and 3D representations of ',
                },
                { kind: 'context', text: 'terrain' },
                { kind: 'text', text: ' and ' },
                { kind: 'context', text: 'buildings' },
                { kind: 'text', text: '.' },
              ],
            },
          ],
        },
      ],
    },
    {
      heading: 'Space exploration',
      paragraphs: [
        {
          sentences: [
            {
              id: 'space-mars',
              sourceIds: ['nasa-mars-exploration'],
              segments: [
                { kind: 'missing', text: 'Mars', journeyKey: 'object-mars' },
                { kind: 'text', text: ' has been explored by robotic ' },
                { kind: 'context', text: 'orbiters' },
                { kind: 'text', text: ', ' },
                { kind: 'context', text: 'landers' },
                { kind: 'text', text: ', and ' },
                { kind: 'context', text: 'rovers' },
                { kind: 'text', text: '.' },
              ],
            },
            {
              id: 'space-armstrong',
              sourceIds: ['nasa-neil-armstrong'],
              segments: [
                {
                  kind: 'missing',
                  text: 'Neil Armstrong',
                  journeyKey: 'person-neil-armstrong',
                },
                { kind: 'text', text: ' became the first person to set foot on the ' },
                { kind: 'context', text: 'Moon' },
                { kind: 'text', text: ' on 20 July 1969.' },
              ],
            },
            {
              id: 'space-tereshkova',
              sourceIds: ['esa-valentina-tereshkova'],
              segments: [
                {
                  kind: 'missing',
                  text: 'Valentina Tereshkova',
                  journeyKey: 'person-valentina-tereshkova',
                },
                { kind: 'text', text: ' became the first woman in space when ' },
                { kind: 'context', text: 'Vostok 6' },
                { kind: 'text', text: ' launched on 16 June 1963.' },
              ],
            },
          ],
        },
        {
          sentences: [
            {
              id: 'space-chandrayaan',
              sourceIds: ['isro-chandrayaan-3'],
              segments: [
                { kind: 'text', text: 'The ' },
                {
                  kind: 'missing',
                  text: 'Chandrayaan-3 Moon landing',
                  journeyKey: 'event-chandrayaan-3-landing',
                },
                { kind: 'text', text: ' was a successful soft landing on the ' },
                { kind: 'context', text: 'Moon' },
                { kind: 'text', text: ' on 23 August 2023.' },
              ],
            },
            {
              id: 'space-spacex',
              sourceIds: ['nasa-commercial-crew-dragon'],
              segments: [
                { kind: 'missing', text: 'SpaceX', journeyKey: 'company-spacex' },
                { kind: 'text', text: ' developed the ' },
                { kind: 'context', text: 'Dragon spacecraft' },
                {
                  kind: 'text',
                  text: ', which carries crew and cargo to orbiting destinations such as the ',
                },
                { kind: 'context', text: 'International Space Station' },
                { kind: 'text', text: '.' },
              ],
            },
          ],
        },
      ],
    },
  ],
})

const sourceProfilesByOutline = deepFreeze({
  person: {
    sourceTip:
      'Prefer substantial biographies, institutional records, academic publications, and independent journalism.',
  },
  'recent-event': {
    sourceTip:
      'Prefer established news organisations, official records, and independent expert analysis.',
  },
  'astronomical-object': {
    sourceTip:
      'Prefer astronomical catalogues, peer-reviewed research, observatory publications, and space-agency material.',
  },
  software: {
    sourceTip:
      'Prefer independent technical publications, academic work, books, and established technology journalism.',
  },
  company: {
    sourceTip:
      'Prefer independent business journalism, regulatory filings, books, and academic work.',
  },
  landform: {
    sourceTip:
      'Prefer geological surveys, academic geography, authoritative atlases, and government scientific agencies.',
  },
  island: {
    sourceTip:
      'Prefer government statistics, atlases, academic research, and reliable historical works.',
  },
})

const sharedGuidance = {
  guidanceHeading: 'Getting started with this article',
  guidanceIntro: 'Here are a few tips to help you write an article.',
}

const guidanceProfilesByOutline = deepFreeze({
  person: {
    ...sharedGuidance,
    guidanceBullets: [
      'Start with who the person is and why reliable independent sources discuss them.',
      'Write in the third person and use a neutral tone.',
      'Do not write about yourself, family, or friends.',
    ],
  },
  'recent-event': {
    ...sharedGuidance,
    guidanceBullets: [
      'State what happened, where and when it happened, and why reliable sources covered it.',
      'Present the sequence of events in chronological order.',
      'Distinguish confirmed information from attributed claims.',
    ],
  },
  'astronomical-object': {
    ...sharedGuidance,
    guidanceBullets: [
      "Identify the object's type, location, and main physical characteristics.",
      'Describe discovery and observation using published sources.',
      'Avoid speculation that is not attributed to a reliable source.',
    ],
  },
  software: {
    ...sharedGuidance,
    guidanceBullets: [
      "Explain the software's purpose, development, and notable uses.",
      "Separate independently documented use from the developer's own claims.",
      'Avoid feature lists copied from product material.',
    ],
  },
  company: {
    ...sharedGuidance,
    guidanceBullets: [
      'Explain what the company does, when it was formed, and its documented products or services.',
      'Cover significant criticism or disputes only in proportion to reliable coverage.',
      'Avoid promotional language and unsupported claims of leadership or innovation.',
    ],
  },
  landform: {
    ...sharedGuidance,
    guidanceBullets: [
      "Identify the landform's location, type, formation, and physical characteristics.",
      'Attribute measurements when sources differ.',
      'Separate scientific description from tourism or promotional claims.',
    ],
  },
  island: {
    ...sharedGuidance,
    guidanceBullets: [
      "Identify the island's location, political status, geography, and environment.",
      'Add history, population, or ecology only when relevant and sourced.',
      'Avoid travel-guide language.',
    ],
  },
})

const journeysByKey = deepFreeze({
  'person-neil-armstrong': {
    key: 'person-neil-armstrong',
    subject: {
      journeyKey: 'person-neil-armstrong',
      title: 'Neil Armstrong',
      description: 'American astronaut and aeronautical engineer',
      wikidataItemId: 'Q1615',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q1615',
      wikidataRelation: 'exact',
      typeLabel: 'Person',
      articleType: 'Q5',
      thumbnail: {
        url: new URL('../assets/subjects/neil-armstrong.jpg', import.meta.url).href,
        commonsFile: 'Neil Armstrong pose.jpg',
        commonsUrl: 'https://commons.wikimedia.org/wiki/File:Neil_Armstrong_pose.jpg',
      },
    },
    sourceRequirements: { profileKey: 'person' },
    guidanceProfileKey: 'person',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'person' },
  },
  'person-valentina-tereshkova': {
    key: 'person-valentina-tereshkova',
    subject: {
      journeyKey: 'person-valentina-tereshkova',
      title: 'Valentina Tereshkova',
      description: 'Soviet cosmonaut and the first woman in space',
      wikidataItemId: 'Q44371',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q44371',
      wikidataRelation: 'exact',
      typeLabel: 'Person',
      articleType: 'Q5',
      thumbnail: {
        url: new URL('../assets/subjects/valentina-tereshkova.jpg', import.meta.url).href,
        commonsFile: '1st meeting of 8th State Duma 07.jpg',
        commonsUrl: 'https://commons.wikimedia.org/wiki/File:1st_meeting_of_8th_State_Duma_07.jpg',
      },
    },
    sourceRequirements: { profileKey: 'person' },
    guidanceProfileKey: 'person',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'person' },
  },
  'event-chandrayaan-3-landing': {
    key: 'event-chandrayaan-3-landing',
    subject: {
      journeyKey: 'event-chandrayaan-3-landing',
      title: 'Chandrayaan-3 Moon landing',
      description: "2023 lunar landing by India's Chandrayaan-3 mission",
      wikidataItemId: 'Q65049774',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q65049774',
      wikidataRelation: 'related',
      typeLabel: 'Recent Event',
      articleType: 'Q108586636',
      thumbnail: {
        url: new URL('../assets/subjects/chandrayaan-3.png', import.meta.url).href,
        commonsFile: 'Chandrayaan-3 Integrated Module in clean-room 01.webp',
        commonsUrl:
          'https://commons.wikimedia.org/wiki/File:Chandrayaan-3_Integrated_Module_in_clean-room_01.webp',
      },
    },
    sourceRequirements: { profileKey: 'recent-event' },
    guidanceProfileKey: 'recent-event',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'recent-event' },
  },
  'object-mars': {
    key: 'object-mars',
    subject: {
      journeyKey: 'object-mars',
      title: 'Mars',
      description: 'Fourth planet from the Sun',
      wikidataItemId: 'Q111',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q111',
      wikidataRelation: 'exact',
      typeLabel: 'Astronomical Object',
      articleType: 'Q6999',
      thumbnail: {
        url: new URL('../assets/subjects/mars.png', import.meta.url).href,
        commonsFile: 'Mars - August 30 2021 - Flickr - Kevin M. Gill.png',
        commonsUrl:
          'https://commons.wikimedia.org/wiki/File:Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png',
      },
    },
    sourceRequirements: { profileKey: 'astronomical-object' },
    guidanceProfileKey: 'astronomical-object',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'astronomical-object' },
  },
  'software-google-earth': {
    key: 'software-google-earth',
    subject: {
      journeyKey: 'software-google-earth',
      title: 'Google Earth',
      description: 'Virtual globe and mapping software',
      wikidataItemId: 'Q42274',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q42274',
      wikidataRelation: 'exact',
      typeLabel: 'Software',
      articleType: 'Q7397',
      thumbnail: {
        url: new URL('../assets/subjects/google-earth.png', import.meta.url).href,
        commonsFile: 'NASA World Wind - Google Earth bar.png',
        commonsUrl:
          'https://commons.wikimedia.org/wiki/File:NASA_World_Wind_-_Google_Earth_bar.png',
      },
    },
    sourceRequirements: { profileKey: 'software' },
    guidanceProfileKey: 'software',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'software' },
  },
  'company-spacex': {
    key: 'company-spacex',
    subject: {
      journeyKey: 'company-spacex',
      title: 'SpaceX',
      description: 'American aerospace company',
      wikidataItemId: 'Q193701',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q193701',
      wikidataRelation: 'exact',
      typeLabel: 'Company',
      articleType: 'Q4830453',
      thumbnail: {
        url: new URL('../assets/subjects/spacex.jpg', import.meta.url).href,
        commonsFile: 'Entrance to SpaceX headquarters.jpg',
        commonsUrl: 'https://commons.wikimedia.org/wiki/File:Entrance_to_SpaceX_headquarters.jpg',
      },
    },
    sourceRequirements: { profileKey: 'company' },
    guidanceProfileKey: 'company',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'company' },
  },
  'landform-mount-everest': {
    key: 'landform-mount-everest',
    subject: {
      journeyKey: 'landform-mount-everest',
      title: 'Mount Everest',
      description: "Earth's highest mountain above sea level",
      wikidataItemId: 'Q513',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q513',
      wikidataRelation: 'exact',
      typeLabel: 'Landform',
      articleType: 'Q271669',
      thumbnail: {
        url: new URL('../assets/subjects/mount-everest.jpg', import.meta.url).href,
        commonsFile: 'Mount Everest as seen from Drukair2 PLW edit.jpg',
        commonsUrl:
          'https://commons.wikimedia.org/wiki/File:Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg',
      },
    },
    sourceRequirements: { profileKey: 'landform' },
    guidanceProfileKey: 'landform',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'landform' },
  },
  'island-easter-island': {
    key: 'island-easter-island',
    subject: {
      journeyKey: 'island-easter-island',
      title: 'Easter Island',
      description: 'Island and special territory of Chile in the Pacific Ocean',
      wikidataItemId: 'Q14452',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q14452',
      wikidataRelation: 'exact',
      typeLabel: 'Island',
      articleType: 'Q23442',
      thumbnail: {
        url: new URL('../assets/subjects/easter-island.jpg', import.meta.url).href,
        commonsFile: 'Easter Island 5.jpg',
        commonsUrl: 'https://commons.wikimedia.org/wiki/File:Easter_Island_5.jpg',
      },
    },
    sourceRequirements: { profileKey: 'island' },
    guidanceProfileKey: 'island',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'island' },
  },
})

for (const journey of Object.values(journeysByKey)) {
  const outline = simpleEnglishOutlinesById[journey.handoff.outline]
  if (!outline || outline.articleType !== journey.subject.articleType) {
    throw new Error(`Invalid outline mapping for journey ${journey.key}`)
  }
}

// Transitional export for the existing views. Task 2 binds those views to the catalogue.
const personJourney = deepFreeze({
  key: 'ritu-karidhal',
  article: {
    title: 'Women in the Indian space programme',
    description: 'From Wikipedia, the free encyclopedia',
    sections: [
      {
        heading: '',
        paragraphs: [
          [
            {
              text: "Women have worked across science, engineering, mission operations, and administration in India's space programme. Their roles became especially visible through the Mars Orbiter Mission and later lunar missions.",
              missingLink: false,
            },
          ],
        ],
      },
      {
        heading: 'Notable contributors',
        paragraphs: [
          [
            {
              text: 'Mission teams have included engineers such as Muthayya Vanitha, Nandini Harinath, and ',
              missingLink: false,
            },
            { text: 'Ritu Karidhal', missingLink: true },
            {
              text: ', who took leadership roles on major projects. Their work spans navigation, spacecraft operations, communications, and mission planning.',
              missingLink: false,
            },
          ],
        ],
      },
    ],
  },
  subject: {
    key: 'ritu-karidhal',
    journeyKey: 'ritu-karidhal',
    title: 'Ritu Karidhal',
    description: 'Indian scientist and aerospace engineer',
    typeLabel: 'Person',
    articleType: 'Q5',
    sitelinkCount: 8,
  },
  sourceRequirements: {
    recommended: [
      'Established encyclopaedias and biographical dictionaries',
      'Official government or parliamentary records',
      'Academic or peer-reviewed publications',
      'Major newswires and outlets with editorial standards',
    ],
    discouraged: [
      'Social media platforms and posts',
      'Blogs and personal websites',
      'Fan sites and fandom wikis',
      'Promotional material, press releases, and marketing content',
    ],
  },
  guidance: {
    heading: 'Getting started with this article',
    intro: 'Here are a few tips to help you write a great article.',
    bullets: [
      'Start with who this person is and why they are notable. Use reliable, independent sources that cover the person in depth.',
      'Write in the third person and keep a neutral tone throughout.',
      "Don't write about yourself, your family, or your friends.",
    ],
  },
  handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'person' },
})

export {
  explorationArticle,
  guidanceProfilesByOutline,
  journeysByKey,
  personJourney,
  sourceProfilesByOutline,
}
