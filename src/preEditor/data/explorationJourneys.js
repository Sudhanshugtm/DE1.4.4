import { simpleEnglishOutlinesById } from '../../config/outlines/simpleEnglish.js'

const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }

  return value
}

// One reading article, written so that every outline in the Simple English
// catalogue appears once as a red link a reader might genuinely follow.
// Blue (context) links are inert by design; red links start a journey.
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
    'britannica-xuanzang': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/biography/Xuanzang',
    },
    'unesco-venice': {
      publisher: 'UNESCO World Heritage Centre',
      url: 'https://whc.unesco.org/en/list/394/',
    },
    'britannica-travels-of-marco-polo': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/topic/The-Travels-of-Marco-Polo',
    },
    'britannica-portugal': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/place/Portugal',
    },
    'rmg-royal-observatory': {
      publisher: 'Royal Museums Greenwich',
      url: 'https://www.rmg.co.uk/royal-observatory',
    },
    'mathworld-haversine': {
      publisher: 'Wolfram MathWorld',
      url: 'https://mathworld.wolfram.com/Haversine.html',
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
    'britannica-messner': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/biography/Reinhold-Messner',
    },
    'alpine-club': {
      publisher: 'The Alpine Club',
      url: 'https://www.alpine-club.org.uk/',
    },
    'britannica-siberian-husky': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/animal/Siberian-husky',
    },
    'npolar-svalbard': {
      publisher: 'Norwegian Polar Institute',
      url: 'https://www.npolar.no/en/',
    },
    'britannica-scurvy': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/science/scurvy',
    },
    'britannica-lemon': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/plant/lemon',
    },
    'britannica-oxygen': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/science/oxygen',
    },
    'nasa-astronauts': {
      publisher: 'NASA',
      url: 'https://www.nasa.gov/humans-in-space/astronauts/',
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
    'britannica-cold-war': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/event/Cold-War',
    },
    'jfk-library': {
      publisher: 'John F. Kennedy Presidential Library and Museum',
      url: 'https://www.jfklibrary.org/',
    },
    'esa-space-debris': {
      publisher: 'European Space Agency',
      url: 'https://www.esa.int/Space_Safety/Space_Debris',
    },
    'spri-cambridge': {
      publisher: 'Scott Polar Research Institute, University of Cambridge',
      url: 'https://www.spri.cam.ac.uk/',
    },
    'gordonstoun-school': {
      publisher: 'Gordonstoun',
      url: 'https://www.gordonstoun.org.uk/',
    },
    'airandspace-smithsonian': {
      publisher: 'Smithsonian National Air and Space Museum',
      url: 'https://airandspace.si.edu/',
    },
    'national-geographic-society': {
      publisher: 'National Geographic Society',
      url: 'https://www.nationalgeographic.org/',
    },
    'gutenberg-twenty-thousand-leagues': {
      publisher: 'Project Gutenberg',
      url: 'https://www.gutenberg.org/ebooks/164',
    },
    'britannica-star-trek': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/topic/Star-Trek',
    },
    'blue-origin': {
      publisher: 'Blue Origin',
      url: 'https://www.blueorigin.com/',
    },
    'britannica-bear-grylls': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/biography/Bear-Grylls',
    },
    'britannica-david-bowie': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/biography/David-Bowie',
    },
    'public-service-broadcasting': {
      publisher: 'Public Service Broadcasting',
      url: 'https://publicservicebroadcasting.net/',
    },
    'allmusic-space-rock': {
      publisher: 'AllMusic',
      url: 'https://www.allmusic.com/',
    },
    'britannica-holst': {
      publisher: 'Encyclopaedia Britannica',
      url: 'https://www.britannica.com/biography/Gustav-Holst',
    },
    'kerbal-space-program': {
      publisher: 'Kerbal Space Program',
      url: 'https://www.kerbalspaceprogram.com/',
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
      heading: 'Early journeys',
      paragraphs: [
        {
          sentences: [
            {
              id: 'early-xuanzang',
              sourceIds: ['britannica-xuanzang'],
              segments: [
                { kind: 'text', text: 'The monk ' },
                { kind: 'context', text: 'Xuanzang' },
                { kind: 'text', text: ' left China in the year 629 to study ' },
                { kind: 'missing', text: 'Buddhism', journeyKey: 'religion-buddhism' },
                { kind: 'text', text: ' at its source in India.' },
              ],
            },
            {
              id: 'early-venice',
              sourceIds: ['unesco-venice'],
              segments: [
                { kind: 'text', text: 'Six centuries later the merchant ' },
                { kind: 'context', text: 'Marco Polo' },
                { kind: 'text', text: ' set out from ' },
                { kind: 'missing', text: 'Venice', journeyKey: 'city-venice' },
                { kind: 'text', text: ' on a journey across Asia that lasted twenty-four years.' },
              ],
            },
            {
              id: 'early-travels-book',
              sourceIds: ['britannica-travels-of-marco-polo'],
              segments: [
                { kind: 'text', text: 'His account was written down as ' },
                {
                  kind: 'missing',
                  text: 'The Travels of Marco Polo',
                  journeyKey: 'book-the-travels-of-marco-polo',
                },
                {
                  kind: 'text',
                  text: ', which introduced many European readers to distant lands.',
                },
              ],
            },
            {
              id: 'early-portugal',
              sourceIds: ['britannica-portugal'],
              segments: [
                { kind: 'missing', text: 'Portugal', journeyKey: 'country-portugal' },
                {
                  kind: 'text',
                  text: ' organised systematic voyages of discovery along the African coast during the fifteenth century.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      heading: 'Navigation and mapping',
      paragraphs: [
        {
          sentences: [
            {
              id: 'nav-royal-observatory',
              sourceIds: ['rmg-royal-observatory'],
              segments: [
                { kind: 'text', text: 'The ' },
                {
                  kind: 'missing',
                  text: 'Royal Observatory, Greenwich',
                  journeyKey: 'building-royal-observatory',
                },
                {
                  kind: 'text',
                  text: " was founded in 1675 to solve the problem of finding a ship's position at sea.",
                },
              ],
            },
            {
              id: 'nav-chronometer',
              sourceIds: ['rmg-royal-observatory'],
              segments: [
                { kind: 'text', text: 'The ' },
                {
                  kind: 'missing',
                  text: 'marine chronometer',
                  journeyKey: 'product-marine-chronometer',
                },
                {
                  kind: 'text',
                  text: ' finally made it possible to determine longitude accurately on long voyages.',
                },
              ],
            },
            {
              id: 'nav-haversine',
              sourceIds: ['mathworld-haversine'],
              segments: [
                {
                  kind: 'text',
                  text: 'Distances between two points on a sphere can be calculated with the ',
                },
                {
                  kind: 'missing',
                  text: 'haversine formula',
                  journeyKey: 'theorem-haversine-formula',
                },
                { kind: 'text', text: ', long used in navigation tables.' },
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
        {
          sentences: [
            {
              id: 'earth-messner',
              sourceIds: ['britannica-messner'],
              segments: [
                {
                  kind: 'missing',
                  text: 'Reinhold Messner',
                  journeyKey: 'sportsperson-reinhold-messner',
                },
                { kind: 'text', text: ' and ' },
                { kind: 'context', text: 'Peter Habeler' },
                {
                  kind: 'text',
                  text: ' made the first ascent of Everest without supplemental oxygen in 1978.',
                },
              ],
            },
            {
              id: 'earth-alpine-club',
              sourceIds: ['alpine-club'],
              segments: [
                { kind: 'text', text: 'The ' },
                { kind: 'missing', text: 'Alpine Club', journeyKey: 'sports-club-alpine-club' },
                {
                  kind: 'text',
                  text: ", founded in London in 1857, was the world's first mountaineering club.",
                },
              ],
            },
            {
              id: 'earth-husky',
              sourceIds: ['britannica-siberian-husky'],
              segments: [
                { kind: 'text', text: 'Polar expeditions long depended on sled dogs such as the ' },
                { kind: 'missing', text: 'Siberian Husky', journeyKey: 'animal-siberian-husky' },
                { kind: 'text', text: '.' },
              ],
            },
            {
              id: 'earth-longyearbyen',
              sourceIds: ['npolar-svalbard'],
              segments: [
                {
                  kind: 'missing',
                  text: 'Longyearbyen',
                  journeyKey: 'human-settlement-longyearbyen',
                },
                { kind: 'text', text: ', on the Arctic archipelago of ' },
                { kind: 'context', text: 'Svalbard' },
                { kind: 'text', text: ', serves today as a base for polar research.' },
              ],
            },
          ],
        },
      ],
    },
    {
      heading: 'Health and survival',
      paragraphs: [
        {
          sentences: [
            {
              id: 'health-scurvy',
              sourceIds: ['britannica-scurvy'],
              segments: [
                { kind: 'text', text: 'Long sea voyages were haunted by ' },
                { kind: 'missing', text: 'scurvy', journeyKey: 'medical-condition-scurvy' },
                { kind: 'text', text: ', a disease caused by a lack of ' },
                { kind: 'context', text: 'vitamin C' },
                { kind: 'text', text: '.' },
              ],
            },
            {
              id: 'health-lemon',
              sourceIds: ['britannica-lemon'],
              segments: [
                { kind: 'text', text: 'The naval surgeon ' },
                { kind: 'context', text: 'James Lind' },
                { kind: 'text', text: ' showed in 1747 that citrus fruit such as the ' },
                { kind: 'missing', text: 'lemon', journeyKey: 'plant-lemon' },
                { kind: 'text', text: ' prevented it.' },
              ],
            },
            {
              id: 'health-oxygen',
              sourceIds: ['britannica-oxygen'],
              segments: [
                {
                  kind: 'text',
                  text: 'At extreme altitude and in space alike, explorers depend on supplemental ',
                },
                { kind: 'missing', text: 'oxygen', journeyKey: 'chemical-element-oxygen' },
                { kind: 'text', text: '.' },
              ],
            },
            {
              id: 'health-stress-test',
              sourceIds: ['nasa-astronauts'],
              segments: [
                {
                  kind: 'text',
                  text: 'Astronaut candidates are screened with examinations that include a ',
                },
                {
                  kind: 'missing',
                  text: 'cardiac stress test',
                  journeyKey: 'medical-test-cardiac-stress-test',
                },
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
        {
          sentences: [
            {
              id: 'space-cold-war',
              sourceIds: ['britannica-cold-war'],
              segments: [
                { kind: 'text', text: 'The ' },
                { kind: 'context', text: 'Space Race' },
                { kind: 'text', text: ' unfolded against the backdrop of the ' },
                { kind: 'missing', text: 'Cold War', journeyKey: 'armed-conflict-cold-war' },
                { kind: 'text', text: '.' },
              ],
            },
            {
              id: 'space-kennedy',
              sourceIds: ['jfk-library'],
              segments: [
                { kind: 'text', text: 'In 1962 President ' },
                {
                  kind: 'missing',
                  text: 'John F. Kennedy',
                  journeyKey: 'politician-john-f-kennedy',
                },
                {
                  kind: 'text',
                  text: ' committed the United States to reaching the Moon before the decade was out.',
                },
              ],
            },
            {
              id: 'space-debris',
              sourceIds: ['esa-space-debris'],
              segments: [
                { kind: 'text', text: 'Decades of launches have left ' },
                { kind: 'missing', text: 'space debris', journeyKey: 'social-issue-space-debris' },
                {
                  kind: 'text',
                  text: ' circling the planet, a growing problem for future missions.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      heading: 'Institutions and recognition',
      paragraphs: [
        {
          sentences: [
            {
              id: 'inst-cambridge',
              sourceIds: ['spri-cambridge'],
              segments: [
                { kind: 'text', text: 'The ' },
                { kind: 'context', text: 'Scott Polar Research Institute' },
                { kind: 'text', text: ' at the ' },
                {
                  kind: 'missing',
                  text: 'University of Cambridge',
                  journeyKey: 'university-cambridge',
                },
                { kind: 'text', text: ' has supported polar science since 1920.' },
              ],
            },
            {
              id: 'inst-gordonstoun',
              sourceIds: ['gordonstoun-school'],
              segments: [
                { kind: 'missing', text: 'Gordonstoun', journeyKey: 'school-gordonstoun' },
                {
                  kind: 'text',
                  text: ', a boarding school in Scotland, made expeditions part of its curriculum from its founding.',
                },
              ],
            },
            {
              id: 'inst-air-space-museum',
              sourceIds: ['airandspace-smithsonian'],
              segments: [
                { kind: 'text', text: 'The ' },
                {
                  kind: 'missing',
                  text: 'National Air and Space Museum',
                  journeyKey: 'museum-national-air-and-space-museum',
                },
                { kind: 'text', text: ' in Washington, D.C. displays the ' },
                { kind: 'context', text: 'Apollo 11' },
                { kind: 'text', text: ' command module Columbia.' },
              ],
            },
            {
              id: 'inst-hubbard-medal',
              sourceIds: ['national-geographic-society'],
              segments: [
                { kind: 'text', text: 'The National Geographic Society has awarded the ' },
                { kind: 'missing', text: 'Hubbard Medal', journeyKey: 'award-hubbard-medal' },
                { kind: 'text', text: ' for distinction in exploration since 1906.' },
              ],
            },
          ],
        },
      ],
    },
    {
      heading: 'Exploration in culture',
      paragraphs: [
        {
          sentences: [
            {
              id: 'culture-verne',
              sourceIds: ['gutenberg-twenty-thousand-leagues'],
              segments: [
                { kind: 'text', text: "Jules Verne's novel " },
                {
                  kind: 'missing',
                  text: 'Twenty Thousand Leagues Under the Sea',
                  journeyKey: 'literary-work-twenty-thousand-leagues',
                },
                {
                  kind: 'text',
                  text: ' imagined undersea exploration decades before it became routine.',
                },
              ],
            },
            {
              id: 'culture-star-trek',
              sourceIds: ['britannica-star-trek'],
              segments: [
                {
                  kind: 'missing',
                  text: 'Star Trek: The Original Series',
                  journeyKey: 'television-series-star-trek',
                },
                {
                  kind: 'text',
                  text: ' presented space as a frontier to a mass television audience.',
                },
              ],
            },
            {
              id: 'culture-shatner',
              sourceIds: ['blue-origin'],
              segments: [
                {
                  kind: 'missing',
                  text: 'William Shatner',
                  journeyKey: 'actor-william-shatner',
                },
                {
                  kind: 'text',
                  text: ", who played the ship's captain, flew to space himself in 2021 at the age of ninety.",
                },
              ],
            },
            {
              id: 'culture-grylls',
              sourceIds: ['britannica-bear-grylls'],
              segments: [
                { kind: 'text', text: 'Television adventurer ' },
                { kind: 'missing', text: 'Bear Grylls', journeyKey: 'celebrity-bear-grylls' },
                { kind: 'text', text: ' brought survival techniques into living rooms.' },
              ],
            },
          ],
        },
        {
          sentences: [
            {
              id: 'culture-space-oddity',
              sourceIds: ['britannica-david-bowie'],
              segments: [
                { kind: 'text', text: "David Bowie's song " },
                { kind: 'missing', text: 'Space Oddity', journeyKey: 'song-space-oddity' },
                {
                  kind: 'text',
                  text: ' was released in the same month as the first Moon landing.',
                },
              ],
            },
            {
              id: 'culture-race-for-space',
              sourceIds: ['public-service-broadcasting'],
              segments: [
                { kind: 'text', text: 'The band ' },
                { kind: 'context', text: 'Public Service Broadcasting' },
                { kind: 'text', text: ' built its album ' },
                {
                  kind: 'missing',
                  text: 'The Race for Space',
                  journeyKey: 'album-the-race-for-space',
                },
                { kind: 'text', text: ' around archive recordings from the space programme.' },
              ],
            },
            {
              id: 'culture-space-rock',
              sourceIds: ['allmusic-space-rock'],
              segments: [
                { kind: 'text', text: 'A whole genre, ' },
                { kind: 'missing', text: 'space rock', journeyKey: 'music-genre-space-rock' },
                { kind: 'text', text: ', grew up alongside real spaceflight.' },
              ],
            },
            {
              id: 'culture-holst',
              sourceIds: ['britannica-holst'],
              segments: [
                { kind: 'text', text: 'The composer ' },
                { kind: 'missing', text: 'Gustav Holst', journeyKey: 'musician-gustav-holst' },
                { kind: 'text', text: ' wrote ' },
                { kind: 'context', text: 'The Planets' },
                {
                  kind: 'text',
                  text: ', a suite that still shapes how other worlds sound in the imagination.',
                },
              ],
            },
            {
              id: 'culture-kerbal',
              sourceIds: ['kerbal-space-program'],
              segments: [
                {
                  kind: 'missing',
                  text: 'Kerbal Space Program',
                  journeyKey: 'video-game-kerbal-space-program',
                },
                {
                  kind: 'text',
                  text: ' turns orbital mechanics into play, letting anyone run their own space programme.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})

// What counts as a good source differs by article type; one line per outline.
const sourceProfilesByOutline = deepFreeze({
  actor: {
    sourceTip:
      'Prefer independent film journalism, established critics, and substantial biographical coverage.',
  },
  album: {
    sourceTip:
      'Prefer reviews in established music publications, books, and independent journalism.',
  },
  animal: {
    sourceTip:
      'Prefer peer-reviewed zoology, breed registries, and authoritative natural-history references.',
  },
  'armed-conflict': {
    sourceTip:
      'Prefer academic histories, established news archives, and official records; attribute contested claims.',
  },
  'astronomical-object': {
    sourceTip:
      'Prefer astronomical catalogues, peer-reviewed research, observatory publications, and space-agency material.',
  },
  award: {
    sourceTip:
      "Prefer the awarding body's official records alongside independent journalism about recipients.",
  },
  book: {
    sourceTip:
      'Prefer published reviews, literary scholarship, and coverage independent of the publisher.',
  },
  building: {
    sourceTip:
      'Prefer architectural surveys, heritage registers, and histories independent of the owner.',
  },
  celebrity: {
    sourceTip:
      'Prefer substantial independent journalism and biographies; avoid tabloid and promotional coverage.',
  },
  'chemical-element': {
    sourceTip:
      'Prefer peer-reviewed chemistry, standard reference works, and scientific institution publications.',
  },
  city: {
    sourceTip:
      'Prefer official statistics, academic geography and history, and established reference works.',
  },
  company: {
    sourceTip:
      'Prefer independent business journalism, regulatory filings, books, and academic work.',
  },
  country: {
    sourceTip:
      'Prefer official statistics, international organisations, and academic geography and history.',
  },
  'human-settlement': {
    sourceTip:
      'Prefer government records, census data, regional histories, and established reference works.',
  },
  island: {
    sourceTip:
      'Prefer government statistics, atlases, academic research, and reliable historical works.',
  },
  landform: {
    sourceTip:
      'Prefer geological surveys, academic geography, authoritative atlases, and government scientific agencies.',
  },
  'literary-work': {
    sourceTip:
      'Prefer literary criticism, scholarly editions, and reviews independent of the publisher.',
  },
  'medical-condition': {
    sourceTip:
      'Prefer peer-reviewed medical literature, clinical guidelines, and recognised health organisations.',
  },
  'medical-test': {
    sourceTip:
      'Prefer clinical guidelines, peer-reviewed studies, and recognised medical institutions.',
  },
  museum: {
    sourceTip:
      "Prefer independent coverage and scholarship alongside the museum's own official records.",
  },
  'music-genre': {
    sourceTip:
      'Prefer music scholarship, established critics, and histories of the scene or period.',
  },
  musician: {
    sourceTip:
      'Prefer substantial music journalism, biographies, and scholarship independent of labels.',
  },
  person: {
    sourceTip:
      'Prefer substantial biographies, institutional records, academic publications, and independent journalism.',
  },
  plant: {
    sourceTip:
      'Prefer botanical references, peer-reviewed research, and agricultural or horticultural authorities.',
  },
  politician: {
    sourceTip:
      'Prefer official records, established news organisations, and academic political history.',
  },
  product: {
    sourceTip:
      'Prefer independent testing and journalism, technical histories, and museum or archive records.',
  },
  'recent-event': {
    sourceTip:
      'Prefer established news organisations, official records, and independent expert analysis.',
  },
  religion: {
    sourceTip:
      'Prefer academic religious studies and histories; represent internal views as attributed positions.',
  },
  school: {
    sourceTip:
      'Prefer inspection reports, independent journalism, and histories beyond the school’s own site.',
  },
  'social-issue': {
    sourceTip:
      'Prefer peer-reviewed research, international bodies, and reporting from established outlets.',
  },
  software: {
    sourceTip:
      'Prefer independent technical publications, academic work, books, and established technology journalism.',
  },
  song: {
    sourceTip:
      'Prefer music journalism, chart records, and scholarship independent of the artist and label.',
  },
  'sports-club': {
    sourceTip:
      'Prefer independent sports journalism, official competition records, and club histories.',
  },
  sportsperson: {
    sourceTip:
      'Prefer official results and records, established sports journalism, and biographies.',
  },
  'television-series': {
    sourceTip:
      'Prefer reviews from established critics, industry coverage, and academic media studies.',
  },
  theorem: {
    sourceTip: 'Prefer mathematics textbooks, peer-reviewed papers, and standard reference works.',
  },
  university: {
    sourceTip:
      'Prefer independent coverage, official statistics, and histories beyond the university’s own site.',
  },
  'video-game': {
    sourceTip:
      'Prefer reviews from established games publications and coverage independent of the developer.',
  },
})

const sharedGuidance = {
  guidanceHeading: 'Getting started with this article',
  guidanceIntro: 'Here are a few tips to help you write an article.',
}

// Three bullets per outline: what to establish, how to write, what to avoid.
const guidanceProfilesByOutline = deepFreeze({
  actor: {
    ...sharedGuidance,
    guidanceBullets: [
      'Start with who the actor is and the roles reliable sources discuss in depth.',
      'Describe their career chronologically, citing independent coverage.',
      'Avoid fan commentary and uncited claims about awards or fame.',
    ],
  },
  album: {
    ...sharedGuidance,
    guidanceBullets: [
      'State who recorded the album, when it was released, and why sources covered it.',
      'Summarise recording, themes, and reception from published reviews.',
      'Avoid track-by-track commentary without sources.',
    ],
  },
  animal: {
    ...sharedGuidance,
    guidanceBullets: [
      'Identify the animal, its classification, and where it is found.',
      'Describe appearance, behaviour, and habitat from scientific sources.',
      'Avoid anecdotes and unsourced claims about temperament.',
    ],
  },
  'armed-conflict': {
    ...sharedGuidance,
    guidanceBullets: [
      'State who fought, where and when, and what reliable sources say caused it.',
      'Present events in order and attribute disputed accounts to their sources.',
      'Use neutral wording; casualty figures need reliable citations.',
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
  award: {
    ...sharedGuidance,
    guidanceBullets: [
      'State who gives the award, since when, and what it recognises.',
      'Describe criteria and notable recipients from independent coverage.',
      'Avoid listing every recipient; link or summarise instead.',
    ],
  },
  book: {
    ...sharedGuidance,
    guidanceBullets: [
      'State the author, publication date, and why sources discuss the book.',
      'Keep plot summary brief; give most space to reception and influence.',
      'Avoid your own interpretation; attribute analysis to critics.',
    ],
  },
  building: {
    ...sharedGuidance,
    guidanceBullets: [
      'Identify the building, its location, purpose, and construction date.',
      'Describe history and architecture from independent sources.',
      'Avoid promotional language from the owner or operator.',
    ],
  },
  celebrity: {
    ...sharedGuidance,
    guidanceBullets: [
      'Start with what the person is known for according to reliable sources.',
      'Write in the third person and use a neutral tone.',
      'Be especially careful with personal details about living people.',
    ],
  },
  'chemical-element': {
    ...sharedGuidance,
    guidanceBullets: [
      'State the element, its symbol, atomic number, and key properties.',
      'Describe discovery, occurrence, and uses from scientific references.',
      'Keep health or safety claims strictly sourced.',
    ],
  },
  city: {
    ...sharedGuidance,
    guidanceBullets: [
      'State where the city is, its population, and why it matters.',
      'Cover history, geography, and economy in proportion to sources.',
      'Avoid travel-guide language and promotional claims.',
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
  country: {
    ...sharedGuidance,
    guidanceBullets: [
      'State where the country is, its capital, and its form of government.',
      'Cover history, geography, and society in proportion to reliable sources.',
      'Use neutral wording for disputed territories and names.',
    ],
  },
  'human-settlement': {
    ...sharedGuidance,
    guidanceBullets: [
      'State where the settlement is, its status, and its population.',
      'Describe history and economy from records and regional histories.',
      'Avoid boosterism; keep claims sourced.',
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
  landform: {
    ...sharedGuidance,
    guidanceBullets: [
      "Identify the landform's location, type, formation, and physical characteristics.",
      'Attribute measurements when sources differ.',
      'Separate scientific description from tourism or promotional claims.',
    ],
  },
  'literary-work': {
    ...sharedGuidance,
    guidanceBullets: [
      'State the author, date, and form of the work, and why sources discuss it.',
      'Keep summary short; foreground reception and significance.',
      'Attribute interpretation to published critics.',
    ],
  },
  'medical-condition': {
    ...sharedGuidance,
    guidanceBullets: [
      'Define the condition and its documented causes and symptoms.',
      'Base everything on recognised medical sources; avoid primary studies alone.',
      'Never give advice; describe what sources report.',
    ],
  },
  'medical-test': {
    ...sharedGuidance,
    guidanceBullets: [
      'Explain what the test measures and when clinicians use it.',
      'Describe the procedure from clinical guidelines and reviews.',
      'Never give advice; describe what sources report.',
    ],
  },
  museum: {
    ...sharedGuidance,
    guidanceBullets: [
      'State where the museum is, what it holds, and when it opened.',
      'Describe the collection and history from independent coverage.',
      'Avoid promotional language and visitor-guide detail.',
    ],
  },
  'music-genre': {
    ...sharedGuidance,
    guidanceBullets: [
      'Define the genre and when and where sources say it emerged.',
      'Name characteristics and key artists as critics describe them.',
      'Avoid genre-boundary arguments without attribution.',
    ],
  },
  musician: {
    ...sharedGuidance,
    guidanceBullets: [
      'Start with who the musician is and the work sources discuss most.',
      'Describe career and style with citations to independent coverage.',
      'Avoid discographies without context; summarise instead.',
    ],
  },
  person: {
    ...sharedGuidance,
    guidanceBullets: [
      'Start with who the person is and why reliable independent sources discuss them.',
      'Write in the third person and use a neutral tone.',
      'Do not write about yourself, family, or friends.',
    ],
  },
  plant: {
    ...sharedGuidance,
    guidanceBullets: [
      'Identify the plant, its classification, and where it grows.',
      'Describe characteristics and uses from botanical sources.',
      'Keep medicinal claims strictly to recognised sources.',
    ],
  },
  politician: {
    ...sharedGuidance,
    guidanceBullets: [
      'State the offices held and the period in office, from official records.',
      'Cover policies and controversies in proportion to reliable coverage.',
      'Use neutral wording; this is a biography of a living or historical person.',
    ],
  },
  product: {
    ...sharedGuidance,
    guidanceBullets: [
      'Explain what the product is, who made it, and its documented significance.',
      'Describe development and impact from independent sources.',
      'Avoid specification lists copied from marketing material.',
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
  religion: {
    ...sharedGuidance,
    guidanceBullets: [
      'Describe origins, beliefs, and practices as scholars document them.',
      'Attribute doctrines to the tradition rather than stating them as fact.',
      'Write respectfully and neutrally about all faiths.',
    ],
  },
  school: {
    ...sharedGuidance,
    guidanceBullets: [
      'State where the school is, who attends it, and when it was founded.',
      'Describe history and programmes from independent sources.',
      'Avoid prospectus language and unsourced rankings.',
    ],
  },
  'social-issue': {
    ...sharedGuidance,
    guidanceBullets: [
      'Define the issue and its documented scope and causes.',
      'Present major viewpoints in proportion to reliable coverage.',
      'Attribute positions to those who hold them.',
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
  song: {
    ...sharedGuidance,
    guidanceBullets: [
      'State who wrote and recorded the song and when it was released.',
      'Cover composition and reception from published coverage.',
      'Do not quote lyrics beyond brief attributed fragments.',
    ],
  },
  'sports-club': {
    ...sharedGuidance,
    guidanceBullets: [
      'State the sport, home ground, and founding date from reliable records.',
      'Cover history and honours in proportion to independent coverage.',
      'Avoid supporter language; keep a neutral tone.',
    ],
  },
  sportsperson: {
    ...sharedGuidance,
    guidanceBullets: [
      'Start with the sport, key achievements, and why sources cover them.',
      'Support results and records with official or established sources.',
      'Avoid fan superlatives; let cited achievements speak.',
    ],
  },
  'television-series': {
    ...sharedGuidance,
    guidanceBullets: [
      'State who made the series, when it aired, and its premise.',
      'Keep plot brief; foreground production and reception.',
      'Attribute critical judgements to named reviewers.',
    ],
  },
  theorem: {
    ...sharedGuidance,
    guidanceBullets: [
      'State what the theorem says in plain language before any formula.',
      'Explain history and applications from textbooks and papers.',
      'Keep proofs out unless sources present them simply.',
    ],
  },
  university: {
    ...sharedGuidance,
    guidanceBullets: [
      'State where the university is, when it was founded, and its scale.',
      'Describe history and research from independent coverage.',
      'Avoid rankings and prospectus language without sources.',
    ],
  },
  'video-game': {
    ...sharedGuidance,
    guidanceBullets: [
      'State the developer, release date, and what kind of game it is.',
      'Describe gameplay briefly and reception from established critics.',
      'Avoid walkthrough detail and fan terminology.',
    ],
  },
})

// Journeys: one per red link. The subject card is the only interactive result;
// decoys are real-world homonyms that make the "What is this?" list read like
// live Wikidata search, the way Special:NewArticle results do.
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
    decoys: [
      {
        title: 'Armstrong Air and Space Museum',
        description: "Museum in Wapakoneta, Ohio, Neil Armstrong's hometown",
        typeLabel: 'Museum',
      },
      { title: 'Armstrong', description: 'Family name' },
    ],
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
    decoys: [
      {
        title: '6229 Tereshkova',
        description: 'Minor planet named after the first woman in space',
        typeLabel: 'Astronomical Object',
      },
      { title: 'Valentina', description: 'Feminine given name' },
    ],
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
    decoys: [
      { title: 'Chandrayaan-2', description: 'Indian lunar mission launched in 2019' },
      { title: 'Vikram', description: 'Lander of the Chandrayaan programme' },
    ],
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
    decoys: [
      {
        title: 'Mars, Incorporated',
        description: 'American confectionery and pet-food company',
        typeLabel: 'Company',
      },
      { title: 'Mars', description: 'Roman god of war' },
    ],
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
    decoys: [
      {
        title: 'Google Maps',
        description: 'Web mapping platform developed by Google',
        typeLabel: 'Software',
      },
      { title: 'Google LLC', description: 'American technology company', typeLabel: 'Company' },
    ],
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
    decoys: [
      { title: 'Starlink', description: 'Satellite internet constellation operated by SpaceX' },
      { title: 'Starbase', description: 'SpaceX launch site in Texas' },
    ],
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
    decoys: [
      { title: 'Everest', description: '2015 survival film' },
      {
        title: 'George Everest',
        description: 'British surveyor the mountain is named after',
        typeLabel: 'Person',
      },
    ],
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
    decoys: [
      { title: 'Moai', description: 'Monolithic statues of Rapa Nui' },
      { title: 'Easter', description: 'Christian festival' },
    ],
    sourceRequirements: { profileKey: 'island' },
    guidanceProfileKey: 'island',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'island' },
  },
  'religion-buddhism': {
    key: 'religion-buddhism',
    subject: {
      journeyKey: 'religion-buddhism',
      title: 'Buddhism',
      description: 'Indian religion founded on the teachings of Gautama Buddha',
      wikidataItemId: 'Q748',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q748',
      wikidataRelation: 'exact',
      typeLabel: 'Religion',
      articleType: 'Q9174',
    },
    decoys: [
      { title: 'Gautama Buddha', description: 'Founder of Buddhism', typeLabel: 'Person' },
      {
        title: 'Xuanzang',
        description: 'Tang-dynasty monk who travelled to India',
        typeLabel: 'Person',
      },
    ],
    sourceRequirements: { profileKey: 'religion' },
    guidanceProfileKey: 'religion',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'religion' },
  },
  'city-venice': {
    key: 'city-venice',
    subject: {
      journeyKey: 'city-venice',
      title: 'Venice',
      description: 'Capital city of Veneto, Italy',
      wikidataItemId: 'Q641',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q641',
      wikidataRelation: 'exact',
      typeLabel: 'City',
      articleType: 'Q515',
    },
    decoys: [
      {
        title: 'Venice',
        description: 'Beachfront neighborhood in Los Angeles, California',
      },
      {
        title: 'Republic of Venice',
        description: 'Former maritime republic (697–1797)',
        typeLabel: 'Country',
      },
    ],
    sourceRequirements: { profileKey: 'city' },
    guidanceProfileKey: 'city',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'city' },
  },
  'book-the-travels-of-marco-polo': {
    key: 'book-the-travels-of-marco-polo',
    subject: {
      journeyKey: 'book-the-travels-of-marco-polo',
      title: 'The Travels of Marco Polo',
      description: '13th-century travelogue of Marco Polo’s journeys across Asia',
      wikidataItemId: 'Q654562',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q654562',
      wikidataRelation: 'exact',
      typeLabel: 'Book',
      articleType: 'Q47461344',
    },
    decoys: [
      {
        title: 'Marco Polo',
        description: 'Venetian merchant and explorer (1254–1324)',
        typeLabel: 'Person',
      },
      {
        title: 'Marco Polo',
        description: '2014 Netflix television series',
        typeLabel: 'Television Series',
      },
    ],
    sourceRequirements: { profileKey: 'book' },
    guidanceProfileKey: 'book',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'book' },
  },
  'country-portugal': {
    key: 'country-portugal',
    subject: {
      journeyKey: 'country-portugal',
      title: 'Portugal',
      description: 'Country in Southwestern Europe',
      wikidataItemId: 'Q45',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q45',
      wikidataRelation: 'exact',
      typeLabel: 'Country',
      articleType: 'Q6256',
    },
    decoys: [
      {
        title: 'Portugal men’s national football team',
        description: 'National association football team',
        typeLabel: 'Sports Club',
      },
      { title: 'Portugal', description: 'Family name' },
    ],
    sourceRequirements: { profileKey: 'country' },
    guidanceProfileKey: 'country',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'country' },
  },
  'building-royal-observatory': {
    key: 'building-royal-observatory',
    subject: {
      journeyKey: 'building-royal-observatory',
      title: 'Royal Observatory, Greenwich',
      description: 'Observatory in Greenwich, London, home of the prime meridian',
      wikidataItemId: 'Q192988',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q192988',
      wikidataRelation: 'exact',
      typeLabel: 'Building',
      articleType: 'Q41176',
    },
    decoys: [
      { title: 'Prime meridian', description: 'Reference line of longitude at Greenwich' },
      { title: 'Greenwich', description: 'District of London on the River Thames' },
    ],
    sourceRequirements: { profileKey: 'building' },
    guidanceProfileKey: 'building',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'building' },
  },
  'product-marine-chronometer': {
    key: 'product-marine-chronometer',
    subject: {
      journeyKey: 'product-marine-chronometer',
      title: 'Marine chronometer',
      description: 'Portable timepiece used to determine longitude at sea',
      wikidataItemId: 'Q2307829',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q2307829',
      wikidataRelation: 'exact',
      typeLabel: 'Product',
      articleType: 'Q11019',
    },
    decoys: [
      {
        title: 'John Harrison',
        description: 'English clockmaker who solved the longitude problem',
        typeLabel: 'Person',
      },
      {
        title: 'Chronometer watch',
        description: 'Precision watch certified by a testing institute',
      },
    ],
    sourceRequirements: { profileKey: 'product' },
    guidanceProfileKey: 'product',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'product' },
  },
  'theorem-haversine-formula': {
    key: 'theorem-haversine-formula',
    subject: {
      journeyKey: 'theorem-haversine-formula',
      title: 'Haversine formula',
      description: 'Formula for the great-circle distance between two points on a sphere',
      wikidataItemId: 'Q587172',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q587172',
      wikidataRelation: 'exact',
      typeLabel: 'Theorem',
      articleType: 'Q65943',
    },
    decoys: [
      {
        title: 'Great-circle distance',
        description: 'Shortest distance between two points on a sphere',
      },
      { title: 'Versine', description: 'Trigonometric function used in old navigation tables' },
    ],
    sourceRequirements: { profileKey: 'theorem' },
    guidanceProfileKey: 'theorem',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'theorem' },
  },
  'sportsperson-reinhold-messner': {
    key: 'sportsperson-reinhold-messner',
    subject: {
      journeyKey: 'sportsperson-reinhold-messner',
      title: 'Reinhold Messner',
      description: 'Italian mountaineer, adventurer and explorer',
      wikidataItemId: 'Q189307',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q189307',
      wikidataRelation: 'exact',
      typeLabel: 'Sportsperson',
      articleType: 'Q2066131',
    },
    decoys: [
      {
        title: 'Reinhold Messner',
        description: 'Austrian Franciscan priest and philosopher',
        typeLabel: 'Person',
      },
      {
        title: 'Messner Mountain Museum',
        description: 'Museum project in South Tyrol',
        typeLabel: 'Museum',
      },
    ],
    sourceRequirements: { profileKey: 'sportsperson' },
    guidanceProfileKey: 'sportsperson',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'sportsperson' },
  },
  'sports-club-alpine-club': {
    key: 'sports-club-alpine-club',
    subject: {
      journeyKey: 'sports-club-alpine-club',
      title: 'Alpine Club',
      description: 'British club founded in London in 1857, the world’s first mountaineering club',
      wikidataItemId: 'Q795275',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q795275',
      wikidataRelation: 'exact',
      typeLabel: 'Sports Club',
      articleType: 'Q847017',
    },
    decoys: [
      {
        title: 'New Zealand Alpine Club',
        description: 'New Zealand climbing organisation',
        typeLabel: 'Sports Club',
      },
      { title: 'Alpine club hut', description: 'Mountain refuge maintained by an alpine club' },
    ],
    sourceRequirements: { profileKey: 'sports-club' },
    guidanceProfileKey: 'sports-club',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'sports-club' },
  },
  'animal-siberian-husky': {
    key: 'animal-siberian-husky',
    subject: {
      journeyKey: 'animal-siberian-husky',
      title: 'Siberian Husky',
      description: 'Working sled dog breed from Northeast Asia',
      wikidataItemId: 'Q39295',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q39295',
      wikidataRelation: 'exact',
      typeLabel: 'Animal',
      articleType: 'Q729',
    },
    decoys: [
      { title: 'Alaskan Malamute', description: 'Sled dog breed', typeLabel: 'Animal' },
      { title: 'Husky', description: 'General term for sled-type dogs' },
    ],
    sourceRequirements: { profileKey: 'animal' },
    guidanceProfileKey: 'animal',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'animal' },
  },
  'human-settlement-longyearbyen': {
    key: 'human-settlement-longyearbyen',
    subject: {
      journeyKey: 'human-settlement-longyearbyen',
      title: 'Longyearbyen',
      description: 'Town and administrative centre of Svalbard, Norway',
      wikidataItemId: 'Q25923',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q25923',
      wikidataRelation: 'exact',
      typeLabel: 'Human Settlement',
      articleType: 'Q486972',
    },
    decoys: [
      { title: 'Svalbard Airport', description: 'Airport serving Longyearbyen, Norway' },
      {
        title: 'Svalbard Global Seed Vault',
        description: 'Secure seed bank near Longyearbyen',
        typeLabel: 'Building',
      },
    ],
    sourceRequirements: { profileKey: 'human-settlement' },
    guidanceProfileKey: 'human-settlement',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'human-settlement' },
  },
  'medical-condition-scurvy': {
    key: 'medical-condition-scurvy',
    subject: {
      journeyKey: 'medical-condition-scurvy',
      title: 'Scurvy',
      description: 'Disease caused by a deficiency of vitamin C',
      wikidataItemId: 'Q163865',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q163865',
      wikidataRelation: 'exact',
      typeLabel: 'Medical Condition',
      articleType: 'Q103994247',
    },
    decoys: [
      { title: 'Vitamin C', description: 'Essential nutrient found in citrus fruit' },
      {
        title: 'James Lind',
        description: 'Scottish physician who ran an early controlled trial',
        typeLabel: 'Person',
      },
    ],
    sourceRequirements: { profileKey: 'medical-condition' },
    guidanceProfileKey: 'medical-condition',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'medical-condition' },
  },
  'plant-lemon': {
    key: 'plant-lemon',
    subject: {
      journeyKey: 'plant-lemon',
      title: 'Lemon',
      description: 'Citrus × limon, a hybrid citrus tree and its sour fruit',
      wikidataItemId: 'Q500',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q500',
      wikidataRelation: 'exact',
      typeLabel: 'Plant',
      articleType: 'Q756',
    },
    decoys: [
      { title: 'Lemon', description: '2018 single by Kenshi Yonezu', typeLabel: 'Song' },
      { title: 'LemON', description: 'Polish rock band' },
    ],
    sourceRequirements: { profileKey: 'plant' },
    guidanceProfileKey: 'plant',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'plant' },
  },
  'chemical-element-oxygen': {
    key: 'chemical-element-oxygen',
    subject: {
      journeyKey: 'chemical-element-oxygen',
      title: 'Oxygen',
      description: 'Chemical element with symbol O and atomic number 8',
      wikidataItemId: 'Q629',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q629',
      wikidataRelation: 'exact',
      typeLabel: 'Chemical Element',
      articleType: 'Q11344',
    },
    decoys: [
      { title: 'Oxygen', description: '2001 studio album by Avalon', typeLabel: 'Album' },
      { title: 'Dioxygen', description: 'Diatomic molecule of oxygen' },
    ],
    sourceRequirements: { profileKey: 'chemical-element' },
    guidanceProfileKey: 'chemical-element',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'chemical-element' },
  },
  'medical-test-cardiac-stress-test': {
    key: 'medical-test-cardiac-stress-test',
    subject: {
      journeyKey: 'medical-test-cardiac-stress-test',
      title: 'Cardiac stress test',
      description: "Test of the heart's response to controlled physical stress",
      wikidataItemId: 'Q1350700',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q1350700',
      wikidataRelation: 'exact',
      typeLabel: 'Medical Test',
      articleType: 'Q55215251',
    },
    decoys: [
      {
        title: 'Electrocardiography',
        description: "Recording of the heart's electrical activity",
        typeLabel: 'Medical Test',
      },
      { title: 'Treadmill', description: 'Exercise machine', typeLabel: 'Product' },
    ],
    sourceRequirements: { profileKey: 'medical-test' },
    guidanceProfileKey: 'medical-test',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'medical-test' },
  },
  'armed-conflict-cold-war': {
    key: 'armed-conflict-cold-war',
    subject: {
      journeyKey: 'armed-conflict-cold-war',
      title: 'Cold War',
      description: '1947–1991 geopolitical tension between the Soviet Union and the United States',
      wikidataItemId: 'Q8683',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q8683',
      wikidataRelation: 'exact',
      typeLabel: 'Armed Conflict',
      articleType: 'Q180684',
    },
    decoys: [
      { title: 'Cold War', description: '2018 Polish film' },
      { title: 'Cold War History', description: 'Academic journal' },
    ],
    sourceRequirements: { profileKey: 'armed-conflict' },
    guidanceProfileKey: 'armed-conflict',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'armed-conflict' },
  },
  'politician-john-f-kennedy': {
    key: 'politician-john-f-kennedy',
    subject: {
      journeyKey: 'politician-john-f-kennedy',
      title: 'John F. Kennedy',
      description: 'President of the United States from 1961 to 1963',
      wikidataItemId: 'Q9696',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q9696',
      wikidataRelation: 'exact',
      typeLabel: 'Politician',
      articleType: 'Q82955',
    },
    decoys: [
      {
        title: 'John F. Kennedy',
        description: 'Gerald R. Ford-class aircraft carrier',
      },
      {
        title: 'John F. Kennedy School of Government',
        description: 'School of public administration at Harvard University',
        typeLabel: 'School',
      },
    ],
    sourceRequirements: { profileKey: 'politician' },
    guidanceProfileKey: 'politician',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'politician' },
  },
  'social-issue-space-debris': {
    key: 'social-issue-space-debris',
    subject: {
      journeyKey: 'social-issue-space-debris',
      title: 'Space debris',
      description: 'Defunct artificial objects accumulating in orbit around Earth',
      wikidataItemId: 'Q275450',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q275450',
      wikidataRelation: 'exact',
      typeLabel: 'Social Issue',
      articleType: 'Q1920219',
    },
    decoys: [
      { title: 'Space Debris', description: '2000 video game', typeLabel: 'Video Game' },
      {
        title: 'Kessler syndrome',
        description: 'Proposed cascade of collisions in low Earth orbit',
      },
    ],
    sourceRequirements: { profileKey: 'social-issue' },
    guidanceProfileKey: 'social-issue',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'social-issue' },
  },
  'university-cambridge': {
    key: 'university-cambridge',
    subject: {
      journeyKey: 'university-cambridge',
      title: 'University of Cambridge',
      description: 'Collegiate public research university in Cambridge, England',
      wikidataItemId: 'Q35794',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q35794',
      wikidataRelation: 'exact',
      typeLabel: 'University',
      articleType: 'Q3918',
    },
    decoys: [
      { title: 'Cambridge', description: 'City in Cambridgeshire, England', typeLabel: 'City' },
      {
        title: 'Trinity College',
        description: 'Constituent college of the University of Cambridge',
      },
    ],
    sourceRequirements: { profileKey: 'university' },
    guidanceProfileKey: 'university',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'university' },
  },
  'school-gordonstoun': {
    key: 'school-gordonstoun',
    subject: {
      journeyKey: 'school-gordonstoun',
      title: 'Gordonstoun',
      description: 'Independent boarding school in Moray, Scotland',
      wikidataItemId: 'Q1538148',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q1538148',
      wikidataRelation: 'exact',
      typeLabel: 'School',
      articleType: 'Q112872396',
    },
    decoys: [
      {
        title: 'Kurt Hahn',
        description: 'German educator who founded Gordonstoun',
        typeLabel: 'Person',
      },
      {
        title: 'Gordonstoun Island',
        description: 'Island in Ontario, Canada',
        typeLabel: 'Island',
      },
    ],
    sourceRequirements: { profileKey: 'school' },
    guidanceProfileKey: 'school',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'school' },
  },
  'museum-national-air-and-space-museum': {
    key: 'museum-national-air-and-space-museum',
    subject: {
      journeyKey: 'museum-national-air-and-space-museum',
      title: 'National Air and Space Museum',
      description: 'Smithsonian aerospace museum in Washington, D.C.',
      wikidataItemId: 'Q752669',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q752669',
      wikidataRelation: 'exact',
      typeLabel: 'Museum',
      articleType: 'Q33506',
    },
    decoys: [
      {
        title: 'Smithsonian Institution',
        description: 'Group of museums and research centers',
      },
      {
        title: 'Michael Collins Trophy',
        description: 'Annual award of the National Air and Space Museum',
        typeLabel: 'Award',
      },
    ],
    sourceRequirements: { profileKey: 'museum' },
    guidanceProfileKey: 'museum',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'museum' },
  },
  'award-hubbard-medal': {
    key: 'award-hubbard-medal',
    subject: {
      journeyKey: 'award-hubbard-medal',
      title: 'Hubbard Medal',
      description:
        'Medal awarded by the National Geographic Society for distinction in exploration',
      wikidataItemId: 'Q4287207',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q4287207',
      wikidataRelation: 'exact',
      typeLabel: 'Award',
      articleType: 'Q618779',
    },
    decoys: [
      {
        title: 'Gardiner Greene Hubbard',
        description: 'First president of the National Geographic Society',
        typeLabel: 'Person',
      },
      {
        title: 'Hubbard Glacier',
        description: 'Glacier in Alaska and Yukon',
        typeLabel: 'Landform',
      },
    ],
    sourceRequirements: { profileKey: 'award' },
    guidanceProfileKey: 'award',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'award' },
  },
  'literary-work-twenty-thousand-leagues': {
    key: 'literary-work-twenty-thousand-leagues',
    subject: {
      journeyKey: 'literary-work-twenty-thousand-leagues',
      title: 'Twenty Thousand Leagues Under the Sea',
      description: '1870 novel by Jules Verne',
      wikidataItemId: 'Q183565',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q183565',
      wikidataRelation: 'exact',
      typeLabel: 'Literary Work',
      articleType: 'Q7725634',
    },
    decoys: [
      { title: 'Jules Verne', description: 'French novelist (1828–1905)', typeLabel: 'Person' },
      { title: 'Nautilus', description: 'Fictional submarine commanded by Captain Nemo' },
    ],
    sourceRequirements: { profileKey: 'literary-work' },
    guidanceProfileKey: 'literary-work',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'literary-work' },
  },
  'television-series-star-trek': {
    key: 'television-series-star-trek',
    subject: {
      journeyKey: 'television-series-star-trek',
      title: 'Star Trek: The Original Series',
      description: 'American science fiction television series (1966–1969)',
      wikidataItemId: 'Q1077',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q1077',
      wikidataRelation: 'exact',
      typeLabel: 'Television Series',
      articleType: 'Q5398426',
    },
    decoys: [
      {
        title: 'Star Trek',
        description: 'Novel series by James Blish',
        typeLabel: 'Book',
      },
      { title: 'USS Enterprise (NCC-1701)', description: 'Fictional starship' },
    ],
    sourceRequirements: { profileKey: 'television-series' },
    guidanceProfileKey: 'television-series',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'television-series' },
  },
  'actor-william-shatner': {
    key: 'actor-william-shatner',
    subject: {
      journeyKey: 'actor-william-shatner',
      title: 'William Shatner',
      description: 'Canadian actor, born 1931',
      wikidataItemId: 'Q16297',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q16297',
      wikidataRelation: 'exact',
      typeLabel: 'Actor',
      articleType: 'Q33999',
    },
    decoys: [
      {
        title: "William Shatner's TekWar",
        description: '1995 video game',
        typeLabel: 'Video Game',
      },
      {
        title: 'Star Trek V: The Final Frontier',
        description: '1989 film directed by William Shatner',
      },
    ],
    sourceRequirements: { profileKey: 'actor' },
    guidanceProfileKey: 'actor',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'actor' },
  },
  'celebrity-bear-grylls': {
    key: 'celebrity-bear-grylls',
    subject: {
      journeyKey: 'celebrity-bear-grylls',
      title: 'Bear Grylls',
      description: 'English adventurer, writer and television presenter',
      wikidataItemId: 'Q485365',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q485365',
      wikidataRelation: 'exact',
      typeLabel: 'Celebrity',
      articleType: 'Q211236',
    },
    decoys: [
      {
        title: 'Running Wild with Bear Grylls',
        description: 'Television series',
        typeLabel: 'Television Series',
      },
      {
        title: 'Man vs. Wild',
        description: 'Survival television series',
        typeLabel: 'Television Series',
      },
    ],
    sourceRequirements: { profileKey: 'celebrity' },
    guidanceProfileKey: 'celebrity',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'celebrity' },
  },
  'song-space-oddity': {
    key: 'song-space-oddity',
    subject: {
      journeyKey: 'song-space-oddity',
      title: 'Space Oddity',
      description: '1969 song by David Bowie',
      wikidataItemId: 'Q581952',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q581952',
      wikidataRelation: 'exact',
      typeLabel: 'Song',
      articleType: 'Q105543609',
    },
    decoys: [
      {
        title: 'David Bowie',
        description: '1969 studio album, later reissued as Space Oddity',
        typeLabel: 'Album',
      },
      { title: 'Major Tom', description: 'Fictional astronaut in David Bowie songs' },
    ],
    sourceRequirements: { profileKey: 'song' },
    guidanceProfileKey: 'song',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'song' },
  },
  'album-the-race-for-space': {
    key: 'album-the-race-for-space',
    subject: {
      journeyKey: 'album-the-race-for-space',
      title: 'The Race for Space',
      description: '2015 album by Public Service Broadcasting',
      wikidataItemId: 'Q19627530',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q19627530',
      wikidataRelation: 'exact',
      typeLabel: 'Album',
      articleType: 'Q482994',
    },
    decoys: [
      { title: 'The Race for Space', description: '1959 documentary film by David L. Wolper' },
      {
        title: 'Space Race',
        description: 'Cold War competition in spaceflight between the US and the Soviet Union',
      },
    ],
    sourceRequirements: { profileKey: 'album' },
    guidanceProfileKey: 'album',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'album' },
  },
  'music-genre-space-rock': {
    key: 'music-genre-space-rock',
    subject: {
      journeyKey: 'music-genre-space-rock',
      title: 'Space rock',
      description: 'Genre of rock music associated with themes of outer space',
      wikidataItemId: 'Q236913',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q236913',
      wikidataRelation: 'exact',
      typeLabel: 'Music Genre',
      articleType: 'Q188451',
    },
    decoys: [
      { title: 'Progressive rock', description: 'Rock music subgenre', typeLabel: 'Music Genre' },
      { title: 'Hawkwind', description: 'English space rock band' },
    ],
    sourceRequirements: { profileKey: 'music-genre' },
    guidanceProfileKey: 'music-genre',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'music-genre' },
  },
  'musician-gustav-holst': {
    key: 'musician-gustav-holst',
    subject: {
      journeyKey: 'musician-gustav-holst',
      title: 'Gustav Holst',
      description: 'British composer (1874–1934)',
      wikidataItemId: 'Q200867',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q200867',
      wikidataRelation: 'exact',
      typeLabel: 'Musician',
      articleType: 'Q639669',
    },
    decoys: [
      { title: 'The Planets', description: 'Orchestral suite by Gustav Holst' },
      { title: 'Gustav Holst', description: 'Painting by Millicent Woodforde' },
    ],
    sourceRequirements: { profileKey: 'musician' },
    guidanceProfileKey: 'musician',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'musician' },
  },
  'video-game-kerbal-space-program': {
    key: 'video-game-kerbal-space-program',
    subject: {
      journeyKey: 'video-game-kerbal-space-program',
      title: 'Kerbal Space Program',
      description: 'Sandbox-style space flight simulator game',
      wikidataItemId: 'Q1471545',
      wikidataItemUrl: 'https://www.wikidata.org/wiki/Q1471545',
      wikidataRelation: 'exact',
      typeLabel: 'Video Game',
      articleType: 'Q7889',
    },
    decoys: [
      {
        title: 'Kerbal Space Program 2',
        description: '2023 space flight simulator video game',
        typeLabel: 'Video Game',
      },
      { title: 'Orbital mechanics', description: 'Branch of physics concerning spacecraft motion' },
    ],
    sourceRequirements: { profileKey: 'video-game' },
    guidanceProfileKey: 'video-game',
    handoff: { lang: 'en', variant: 'toolbar-outline', outline: 'video-game' },
  },
})

// Every journey must hand off to an outline that actually exists, and every
// outline in the catalogue should be reachable from the article.
const linkedJourneyKeys = new Set()
for (const section of explorationArticle.sections) {
  for (const paragraph of section.paragraphs) {
    for (const sentence of paragraph.sentences) {
      for (const segment of sentence.segments) {
        if (segment.kind === 'missing') linkedJourneyKeys.add(segment.journeyKey)
      }
    }
  }
}

for (const journey of Object.values(journeysByKey)) {
  const outline = simpleEnglishOutlinesById[journey.handoff.outline]
  if (!outline || outline.articleType !== journey.subject.articleType) {
    throw new Error(`Invalid outline mapping for journey ${journey.key}`)
  }
  if (!linkedJourneyKeys.has(journey.key)) {
    throw new Error(`Journey ${journey.key} has no red link in the article`)
  }
}

for (const journeyKey of linkedJourneyKeys) {
  if (!journeysByKey[journeyKey]) {
    throw new Error(`Red link points to unknown journey ${journeyKey}`)
  }
}

const coveredOutlines = new Set(
  Object.values(journeysByKey).map((journey) => journey.handoff.outline),
)
for (const outlineId of Object.keys(simpleEnglishOutlinesById)) {
  if (!coveredOutlines.has(outlineId)) {
    throw new Error(`Outline ${outlineId} is not reachable from the exploration article`)
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
