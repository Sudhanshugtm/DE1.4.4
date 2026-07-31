const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }

  return value
}

const personJourney = {
  article: {
    title: 'Women in the Indian space programme',
    description: 'From Wikipedia, the free encyclopedia',
    lead: "Women have worked across science, engineering, mission operations, and administration in India's space programme. Their roles became especially visible through the Mars Orbiter Mission and later lunar missions.",
    sections: [
      {
        heading: 'Notable contributors',
        paragraph: [
          { text: 'Among the notable contributors is ' },
          { text: 'Ritu Karidhal', missingLink: true },
          {
            text: ', who took leadership roles on major projects. Their work spans navigation, spacecraft operations, communications, and mission planning.',
          },
        ],
      },
    ],
  },
  subject: {
    key: 'ritu-karidhal',
    title: 'Ritu Karidhal',
    description: 'Indian scientist and aerospace engineer',
    typeLabel: 'Person',
    articleType: 'Q5',
    sitelinkCount: 8,
  },
  sourceRequirements: {
    requiredCount: 2,
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
  handoff: {
    lang: 'en',
    variant: 'toolbar-outline',
    outline: 'person',
  },
}

export { deepFreeze }
export default deepFreeze(personJourney)
