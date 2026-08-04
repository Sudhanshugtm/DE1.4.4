// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import CdxToolbar from '../src/components/CdxToolbar.vue'

const stubs = {
  CdxButton: {
    name: 'CdxButton',
    template: '<button><slot /></button>',
  },
  CdxIcon: {
    name: 'CdxIcon',
    props: ['icon', 'size'],
    template: '<span class="cdx-icon" :data-size="size"></span>',
  },
}

let wrapper

function mountToolbar(props = {}) {
  wrapper = mount(CdxToolbar, {
    props: {
      showOutlineEntry: true,
      ...props,
    },
    global: { stubs },
    attachTo: document.body,
  })
}

async function openInsertMenu() {
  await wrapper.get('[aria-label="Insert"]').trigger('click')
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('CdxToolbar verified facts insert entry', () => {
  it('focuses Insert without opening its menu', async () => {
    mountToolbar()

    wrapper.vm.focusInsertButton()

    expect(document.activeElement).toBe(wrapper.get('[aria-label="Insert"]').element)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('shows Verified facts immediately after Suggested sections when enabled', async () => {
    mountToolbar({ showVerifiedFacts: true })

    await openInsertMenu()

    const menuItems = wrapper.findAll('[role="menuitem"]')
    expect(menuItems[0].text()).toBe('Suggested sections')
    expect(menuItems[1].text()).toBe('Verified facts')
    expect(menuItems[1].get('.cdx-icon').attributes('data-size')).toBe('small')
  })

  it('does not show Verified facts when disabled', async () => {
    mountToolbar({ showVerifiedFacts: false })

    await openInsertMenu()

    expect(wrapper.find('[data-testid="insert-verified-facts"]').exists()).toBe(false)
  })

  it('emits once and closes the menu when Verified facts is selected', async () => {
    mountToolbar({ showVerifiedFacts: true })
    await openInsertMenu()
    const verifiedFactsItem = wrapper.get('[data-testid="insert-verified-facts"]')

    expect(verifiedFactsItem.classes()).toContain('cdx-toolbar__insert-item--verified')

    await verifiedFactsItem.trigger('click')

    expect(wrapper.emitted('open-verified-facts')).toHaveLength(1)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })
})
