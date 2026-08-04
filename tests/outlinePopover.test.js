// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import OutlinePopover from '../src/components/OutlinePopover.vue'

const reviewedFact = Object.freeze({
  id: 'buddhism-inception-range',
  label: 'Approximate origin period',
  value: 'Between 563 BCE and 483 BCE',
  qualification:
    'Wikidata records the inception date as unknown, bounded by these earliest and latest dates.',
  referenceCount: 1,
  claimUrl: 'https://www.wikidata.org/wiki/Q748#P571',
})

class ResizeObserverMock {
  observe() {}

  disconnect() {}
}

const stubs = {
  CdxPopover: {
    name: 'CdxPopover',
    props: ['open'],
    emits: ['update:open'],
    template: '<div class="cdx-popover" role="dialog" v-show="open"><slot /></div>',
  },
  CdxButton: true,
  CdxIcon: true,
  OutlineStructureList: {
    name: 'OutlineStructureList',
    props: ['outline', 'addedItems'],
    template: '<div />',
  },
  OutlineAccordionList: true,
  VerifiedFactsReferenceList: {
    name: 'VerifiedFactsReferenceList',
    props: ['facts'],
    template:
      '<div data-testid="verified-facts-reference-list" :data-fact-count="facts.length">{{ facts.map((fact) => `${fact.label}: ${fact.value}`).join(\' | \') }}</div>',
  },
  VerifiedFactsList: {
    name: 'VerifiedFactsList',
    template: '<div data-testid="legacy-verified-facts-list" />',
  },
  ReferenceSourcesList: true,
}

let router
let wrapper

async function mountPopover(props = {}) {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/editor', name: 'editor', component: { template: '<div />' } }],
  })
  await router.push({ name: 'editor', query: { outline: 'person' } })
  await router.isReady()
  wrapper = mount(OutlinePopover, {
    attachTo: document.body,
    props: {
      open: true,
      selectableOutlines: true,
      addedItems: new Set(),
      ...props,
    },
    global: {
      plugins: [router],
      stubs,
    },
  })
  await nextTick()
  await nextTick()
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.unstubAllGlobals()
})

describe('outline popover', () => {
  it('initializes an already-open sheet from the requested verified facts view', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    await mountPopover({
      initialView: 'verified-facts',
      verifiedFacts: [reviewedFact],
    })

    expect(wrapper.find('.outline-popover-header__title').text()).toContain('Verified facts')
    expect(wrapper.find('[data-testid="verified-facts-reference-list"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VerifiedFactsList' }).exists()).toBe(false)
  })

  it('names the dialog from the active sheet view', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    await mountPopover({
      initialView: 'verified-facts',
      verifiedFacts: [reviewedFact],
    })

    expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBe('Verified facts')
  })

  it('switches an open sheet when its requested view changes', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    await mountPopover({
      initialView: 'outline',
      verifiedFacts: [reviewedFact],
    })

    expect(wrapper.find('.outline-popover-header__title').text()).toContain('Suggested sections')

    await wrapper.setProps({ initialView: 'verified-facts' })
    await nextTick()

    expect(wrapper.find('.outline-popover-header__title').text()).toContain('Verified facts')
    expect(wrapper.find('[data-testid="verified-facts-reference-list"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VerifiedFactsList' }).exists()).toBe(false)
  })

  it('shows reviewed facts as a read-only reference list for selectable outlines', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    await mountPopover({
      open: false,
      initialView: 'verified-facts',
      verifiedFacts: [reviewedFact],
    })

    await wrapper.setProps({ open: true })
    await nextTick()
    await nextTick()

    expect(wrapper.find('.outline-popover-header__title').text()).toContain('Verified facts')
    const referenceList = wrapper.find('[data-testid="verified-facts-reference-list"]')
    expect(referenceList.attributes('data-fact-count')).toBe('1')
    expect(referenceList.text()).toContain('Approximate origin period: Between 563 BCE and 483 BCE')
    expect(wrapper.findComponent({ name: 'VerifiedFactsList' }).exists()).toBe(false)
  })

  it('keeps the legacy verified facts list for non-selectable outlines', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    await mountPopover({
      open: false,
      selectableOutlines: false,
      initialView: 'verified-facts',
      verifiedFacts: [reviewedFact],
    })

    await wrapper.setProps({ open: true })
    await nextTick()
    await nextTick()

    expect(wrapper.find('[data-testid="legacy-verified-facts-list"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'VerifiedFactsReferenceList' }).exists()).toBe(false)
  })

  it('resets a dismissed sheet scroll position when a new outline opens', async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    await mountPopover()

    const body = wrapper.find('.outline-popover-body').element
    body.scrollTop = 48
    body.dispatchEvent(new Event('scroll'))
    expect(body.classList.contains('is-scrolled')).toBe(true)

    await wrapper.setProps({ open: false })
    await router.replace({ name: 'editor', query: { outline: 'city' } })
    await flushPromises()
    await wrapper.setProps({ open: true })
    await nextTick()
    await nextTick()

    expect(body.scrollTop).toBe(0)
    expect(body.classList.contains('is-scrolled')).toBe(false)
  })
})
