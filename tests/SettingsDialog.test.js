// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'
import SettingsDialog from '../src/components/SettingsDialog.vue'

const stubs = {
  CdxDialog: {
    name: 'CdxDialog',
    props: ['open', 'title', 'useCloseButton'],
    emits: ['update:open'],
    template: '<div class="cdx-dialog"><slot /></div>',
  },
  CdxLabel: {
    name: 'CdxLabel',
    template: '<label><slot /></label>',
  },
  CdxButton: {
    name: 'CdxButton',
    props: ['action', 'disabled'],
    template: '<button :disabled="disabled"><slot /></button>',
  },
  OutlineSelector: {
    name: 'OutlineSelector',
    props: ['showIntro'],
    emits: ['select'],
    template: '<div class="outline-selector-stub" />',
  },
}

let wrapper

async function mountSettings(props = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/editor', component: { template: '<div />' } }],
  })
  await router.push('/editor?outline=country')
  await router.isReady()

  wrapper = mount(SettingsDialog, {
    props,
    global: {
      plugins: [router],
      stubs,
    },
  })
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('SettingsDialog', () => {
  it('keeps the article outline group first and preserves outline selection', async () => {
    await mountSettings()

    const groups = wrapper.findAll('.field-group')
    expect(groups[0].text()).toContain('Article outline')
    expect(groups[0].text()).toContain('Currently: Country')

    const outlineSelector = wrapper.findComponent({ name: 'OutlineSelector' })
    expect(outlineSelector.props('showIntro')).toBe(false)

    outlineSelector.vm.$emit('select', 'city')

    expect(wrapper.emitted('outline-selected')).toEqual([['city']])
  })

  it('renders the Prototype demos launcher and emits when clicked', async () => {
    await mountSettings()

    const prototypeGroup = wrapper.get('.field-group--prototype')
    expect(prototypeGroup.get('label').text()).toBe('Prototype demos')
    expect(prototypeGroup.get('.field-group__hint').text()).toBe(
      'Explore reviewed Wikidata facts using Portugal.',
    )

    const launcher = prototypeGroup.get('[data-testid="open-verified-facts-demo"]')
    expect(launcher.text()).toBe('Open Verified facts demo')

    await launcher.trigger('click')

    expect(wrapper.emitted('open-verified-facts-demo')).toHaveLength(1)
  })

  it('disables the launcher while a demo launch is pending', async () => {
    await mountSettings({ demoLaunchPending: true })

    expect(
      wrapper.get('[data-testid="open-verified-facts-demo"]').attributes('disabled'),
    ).toBeDefined()
  })
})
