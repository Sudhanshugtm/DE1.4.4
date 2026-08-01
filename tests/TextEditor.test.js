// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'
import TextEditor from '../src/components/TextEditor.vue'
import { findBoundFields } from '../src/utils/scaffoldFields.js'
import { insertOutlineContent } from '../src/utils/outlineInsertion.js'

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

function clickField(editor, field) {
  const target = editor.view.dom.querySelector(
    `[data-scaffold-binding="${field.key}"]`,
  )
  return editor.view.someProp('handleClick', (handler) =>
    handler(editor.view, field.from, { target }),
  )
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

describe('TextEditor semantic scaffold fields', () => {
  const prompt =
    '<span data-scaffold-binding="country:subject-name" data-scaffold-placeholder="[Country name]">[Country name]</span>'

  it('whole-selects an already answered linked value on click', async () => {
    const editor = await mountEditor()
    editor.commands.setContent(
      '<p><span data-scaffold-binding="country:subject-name" data-scaffold-placeholder="[Country name]">India</span></p>',
    )
    await nextTick()

    const field = findBoundFields(editor.state.doc)[0]
    expect(clickField(editor, field)).toBe(true)

    expect(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)).toBe(
      'India',
    )
  })

  it('commits an active linked field when the editor blurs', async () => {
    const editor = await mountEditor()
    editor.commands.setContent(`<p>${prompt}</p><p>${prompt}</p>`)
    await nextTick()

    const field = findBoundFields(editor.state.doc)[0]
    expect(clickField(editor, field)).toBe(true)
    editor.commands.insertContent('India')
    editor.emit('blur', { editor, event: new FocusEvent('blur') })
    await nextTick()

    expect(findBoundFields(editor.state.doc).map((field) => field.text)).toEqual([
      'India',
      'India',
    ])
    expect(editor.commands.undo()).toBe(true)
    expect(findBoundFields(editor.state.doc).map((field) => field.text)).toEqual([
      '[Country name]',
      '[Country name]',
    ])
    expect(editor.commands.redo()).toBe(true)
    expect(findBoundFields(editor.state.doc).map((field) => field.text)).toEqual([
      'India',
      'India',
    ])
  })

  it('keeps a section inserted after blur in a separate Undo event', async () => {
    const editor = await mountEditor()
    editor.commands.setContent(`<p>${prompt}</p><p>${prompt}</p>`)
    await nextTick()

    const field = findBoundFields(editor.state.doc)[0]
    expect(clickField(editor, field)).toBe(true)
    editor.commands.insertContent('India')
    editor.emit('blur', { editor, event: new FocusEvent('blur') })
    await nextTick()

    expect(
      insertOutlineContent(
        editor,
        '<h2 data-outline-item-key="country:history">History</h2><p>Unrelated section text</p>',
      ),
    ).toBe(true)
    expect(editor.getText()).toContain('Unrelated section text')

    expect(editor.commands.undo()).toBe(true)
    expect(editor.getText()).not.toContain('Unrelated section text')
    expect(findBoundFields(editor.state.doc).map((bound) => bound.text)).toEqual([
      'India',
      'India',
    ])

    expect(editor.commands.undo()).toBe(true)
    expect(findBoundFields(editor.state.doc).map((bound) => bound.text)).toEqual([
      '[Country name]',
      '[Country name]',
    ])
  })
})
