// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VerifiedFactsReferenceList from '../src/components/VerifiedFactsReferenceList.vue'

const buddhismInceptionFact = Object.freeze({
  id: 'buddhism-inception-range',
  label: 'Approximate origin period',
  value: 'Between 563 BCE and 483 BCE',
  qualification:
    'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
  referenceCount: 1,
  claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
})

describe('VerifiedFactsReferenceList', () => {
  it('presents referenced Wikidata information without an insertion action', () => {
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: [buddhismInceptionFact] },
    })

    expect(wrapper.text()).toContain(
      'Referenced information from Wikidata. Check the source before using it.',
    )
    expect(wrapper.text()).toContain('For your reference')
    expect(wrapper.text()).toContain('Approximate origin period')
    expect(wrapper.text()).toContain('Between 563 BCE and 483 BCE')
    expect(wrapper.text()).toContain(
      'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
    )
    expect(wrapper.text()).toContain('1 reference')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  })

  it('links to the exact Wikidata statement with external-link safeguards', () => {
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: [buddhismInceptionFact] },
    })
    const statementLink = wrapper.get('a')

    expect(statementLink.text()).toBe('View this statement on Wikidata')
    expect(statementLink.attributes('href')).toBe('https://www.wikidata.org/wiki/Q748#P571')
    expect(statementLink.attributes('target')).toBe('_blank')
    expect(statementLink.attributes('rel')).toBe('noopener')
    expect(statementLink.attributes('aria-label')).toBe(
      'View this statement on Wikidata: Approximate origin period (opens in a new tab)',
    )
  })

  it('labels each fact article with its visible fact label', () => {
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: [buddhismInceptionFact] },
    })
    const factArticle = wrapper.get('article')
    const factLabelId = 'verified-fact-buddhism-inception-range'

    expect(factArticle.attributes('aria-labelledby')).toBe(factLabelId)
    expect(wrapper.get(`#${factLabelId}`).text()).toBe('Approximate origin period')
  })

  it('keeps multiple fact labels unique and pluralizes reference counts', () => {
    const secondFact = Object.freeze({
      id: 'buddhism-founder',
      label: 'Traditionally attributed founder',
      value: 'Gautama Buddha',
      qualification: 'Wikidata identifies Gautama Buddha as the founder of Buddhism.',
      referenceCount: 2,
      claimUrl: 'https://www.wikidata.org/wiki/Q748#P112',
    })
    const wrapper = mount(VerifiedFactsReferenceList, {
      props: { facts: [buddhismInceptionFact, secondFact] },
    })
    const factArticles = wrapper.findAll('article')
    const articleLabelIds = factArticles.map((article) => article.attributes('aria-labelledby'))

    expect(articleLabelIds).toEqual([
      'verified-fact-buddhism-inception-range',
      'verified-fact-buddhism-founder',
    ])
    expect(new Set(articleLabelIds).size).toBe(2)
    expect(wrapper.get('#verified-fact-buddhism-founder').text()).toBe(
      'Traditionally attributed founder',
    )
    expect(factArticles[1].text()).toContain('2 references')
  })
})
