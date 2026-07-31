// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'
import TextEditor from '../src/components/TextEditor.vue'

let wrapper

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/editor', component: { template: '<div />' } }],
  })
}

async function mountEditor() {
  const router = createTestRouter()
  await router.push('/editor')
  await router.isReady()
  wrapper = mount(TextEditor, {
    props: {
      showOutlineEntry: false,
      suppressAutoFocus: true,
    },
    global: {
      plugins: [router],
      stubs: {
        CdxButton: {
          template: '<button><slot /></button>',
        },
        CdxIcon: true,
      },
    },
  })
  await nextTick()

  return wrapper.vm.editor
}

function lastOutlineKeys() {
  return wrapper.emitted('outline-sections-changed').at(-1)[0]
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('TextEditor outline section state', () => {
  it('emits document-derived keyed H2 Sets after delete, undo, and redo', async () => {
    const editor = await mountEditor()

    expect(wrapper.emitted('outline-sections-changed')[0][0]).toEqual(new Set())

    editor.commands.setContent(`
      <p>Lead text</p>
      <h2 data-outline-item-key="person:history">History</h2>
      <p>History text</p>
      <h2 data-outline-item-key="person:career">Career</h2>
      <p>Career text</p>
    `)
    await nextTick()

    expect(lastOutlineKeys()).toEqual(new Set(['person:history', 'person:career']))

    await wrapper.find('[aria-label="Delete History section"]').trigger('click')

    expect(lastOutlineKeys()).toEqual(new Set(['person:career']))

    editor.commands.undo()
    await nextTick()

    expect(lastOutlineKeys()).toEqual(new Set(['person:history', 'person:career']))

    editor.commands.redo()
    await nextTick()

    expect(lastOutlineKeys()).toEqual(new Set(['person:career']))
  })
})
