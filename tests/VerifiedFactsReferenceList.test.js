// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VerifiedFactsReferenceList from '../src/components/VerifiedFactsReferenceList.vue'

const buddhismFact = Object.freeze({
  id: 'buddhism-inception-range',
  outlineId: 'religion',
  sectionId: 'introduction',
  sectionLabel: 'Introduction',
  targetFieldId: 'religion:introduction:approximate-period',
  targetFieldToken: '[approximate period]',
  fieldLabel: 'Approximate period',
  label: 'Approximate origin period',
  value: 'Between 563 BCE and 483 BCE',
  qualification:
    'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
  referenceCount: 1,
  claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
})

const portugalFacts = [
  {
    id: 'portugal-official-name-portuguese',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:official-name',
    targetFieldToken: '[official name]',
    fieldLabel: 'Official name',
    label: 'Official name',
    value: 'República Portuguesa',
    valueLanguage: 'pt',
    qualification: 'Reviewed name qualification.',
    referenceCount: 1,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P1448',
  },
  {
    id: 'portugal-area-2021',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:area',
    targetFieldToken: '[area]',
    fieldLabel: 'Area',
    label: 'Area',
    value: '92,225 km²',
    qualification: 'Reviewed area qualification.',
    referenceCount: 1,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P2046',
  },
  {
    id: 'portugal-population-2021-census',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:population',
    targetFieldToken: '[population]',
    fieldLabel: 'Population',
    label: 'Population',
    value: '10,347,892',
    qualification: 'Reviewed population qualification.',
    referenceCount: 2,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P1082',
  },
  {
    id: 'portugal-official-language',
    outlineId: 'country',
    sectionId: 'introduction',
    sectionLabel: 'Introduction',
    targetFieldId: 'country:introduction:language',
    targetFieldToken: '[language]',
    fieldLabel: 'Official language',
    label: 'Official language',
    value: 'Portuguese',
    qualification: 'Reviewed language qualification.',
    referenceCount: 1,
    claimUrl: 'https://www.wikidata.org/wiki/Q45#P37',
  },
]

describe('VerifiedFactsReferenceList', () => {
  it('summarizes plural Country matches exactly and keeps four cards read-only', () => {
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: portugalFacts, outlineLabel: 'Country' },
    })

    expect(wrapper.get('.verified-facts-reference-list__intro').text()).toBe(
      '4 referenced facts matched to the Country outline. Check each source before using it.',
    )
    expect(wrapper.findAll('article')).toHaveLength(4)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
    expect(wrapper.find('[tabindex]').exists()).toBe(false)
    expect(wrapper.find('[onclick]').exists()).toBe(false)
  })

  it('uses singular grammar and groups by outline and section in insertion order', () => {
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: [buddhismFact], outlineLabel: 'Religion' },
    })

    expect(wrapper.get('.verified-facts-reference-list__intro').text()).toBe(
      '1 referenced fact matched to the Religion outline. Check each source before using it.',
    )
    const section = wrapper.get('section')
    const heading = wrapper.get('h3')
    expect(section.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(heading.text()).toBe('Introduction')
  })

  it('labels articles from unique visible field headings and preserves value language', () => {
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: portugalFacts, outlineLabel: 'Country' },
    })
    const articles = wrapper.findAll('article')
    const ids = articles.map((article) => article.attributes('id'))
    const headingIds = articles.map((article) => article.attributes('aria-labelledby'))

    expect(new Set(ids).size).toBe(4)
    expect(new Set(headingIds).size).toBe(4)
    expect(wrapper.get(`#${headingIds[0]}`).element.tagName).toBe('H4')
    expect(wrapper.get(`#${headingIds[0]}`).text()).toBe('Official name')
    expect(wrapper.get('.verified-facts-reference-list__value').attributes('lang')).toBe('pt')
    expect(articles[2].text()).toContain('2 references')
  })

  it('keeps exact safe Wikidata links with a field-based accessible name', () => {
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: [buddhismFact], outlineLabel: 'Religion' },
    })
    const link = wrapper.get('a')

    expect(link.attributes()).toMatchObject({
      href: 'https://www.wikidata.org/wiki/Q748#P571',
      target: '_blank',
      rel: 'noopener',
      'aria-label': 'View this statement on Wikidata: Approximate period (opens in a new tab)',
    })
  })
})
