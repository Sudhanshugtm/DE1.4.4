// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import OutlinePopover from '../src/components/OutlinePopover.vue'

class ResizeObserverMock {
  observe() {}

  disconnect() {}
}

const stubs = {
  CdxPopover: {
    name: 'CdxPopover',
    props: ['open'],
    emits: ['update:open'],
    template: '<div class="cdx-popover" v-show="open"><slot /></div>',
  },
  CdxButton: true,
  CdxIcon: true,
  OutlineStructureList: {
    name: 'OutlineStructureList',
    props: ['outline', 'addedItems'],
    template: '<div />',
  },
  OutlineAccordionList: true,
  VerifiedFactsList: true,
  ReferenceSourcesList: true,
}

let router
let wrapper

async function mountPopover() {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/editor', name: 'editor', component: { template: '<div />' } }],
  })
  await router.push({ name: 'editor', query: { outline: 'person' } })
  await router.isReady()
  wrapper = mount(OutlinePopover, {
    props: {
      open: true,
      selectableOutlines: true,
      addedItems: new Set(),
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
