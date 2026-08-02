// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TextEditor from '../src/components/TextEditor.vue'
import { FieldBinding } from '../src/extensions/fieldBinding.js'
import { ScaffoldBindingMark } from '../src/extensions/scaffoldBindingMark.js'
import { findBoundFields } from '../src/utils/scaffoldFields.js'

const mocks = vi.hoisted(() => ({
  getEditor: vi.fn(),
  setEditor: vi.fn(),
}))

vi.mock('@/components/CdxToolbar.vue', () => ({
  default: {
    name: 'CdxToolbar',
    template: '<div />',
  },
}))

vi.mock('@/composables/useEditorInstance', () => ({
  useEditorInstance: () => ({
    getEditor: mocks.getEditor,
    setEditor: mocks.setEditor,
  }),
}))

import EditorView from '../src/views/EditorView.vue'

const stubs = {
  TextEditor: {
    name: 'TextEditor',
    emits: ['open-settings', 'outline-sections-changed'],
    template: '<button class="open-settings" @click="$emit(\'open-settings\')" />',
  },
  SettingsDialog: {
    name: 'SettingsDialog',
    props: ['open'],
    emits: ['outline-selected', 'update:open'],
    template: '<div class="settings-dialog" />',
  },
  OutlinePopover: {
    name: 'OutlinePopover',
    props: ['open', 'initialView', 'addedItems'],
    emits: ['update:open', 'update:addedItems'],
    template: '<div class="outline-popover" />',
  },
  EditorRail: true,
  CiteDialog: true,
  SourceContextSheet: true,
  CdxIcon: true,
}

let router
let wrapper
let removeGuard
let standaloneEditor

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/editor', name: 'editor', component: EditorView }],
  })
}

async function mountEditor(query = {}, useRealTextEditor = false) {
  router = createTestRouter()
  await router.push({ name: 'editor', query })
  await router.isReady()
  const activeStubs = { ...stubs }
  if (useRealTextEditor) delete activeStubs.TextEditor
  wrapper = mount(EditorView, {
    global: {
      plugins: [router],
      stubs: activeStubs,
    },
  })
  await nextTick()
}

function settingsDialog() {
  return wrapper.findComponent({ name: 'SettingsDialog' })
}

function outlinePopover() {
  return wrapper.findComponent({ name: 'OutlinePopover' })
}

function markerCapableEditor() {
  return {
    id: 'editor',
    state: { selection: { from: 0 } },
    view: { coordsAtPos: () => ({ top: 0 }) },
  }
}

async function openSettings() {
  wrapper.findComponent({ name: 'TextEditor' }).vm.$emit('open-settings')
  await nextTick()
  expect(settingsDialog().props('open')).toBe(true)
}

afterEach(() => {
  removeGuard?.()
  removeGuard = undefined
  wrapper?.unmount()
  wrapper = undefined
  standaloneEditor?.destroy()
  standaloneEditor = undefined
  vi.restoreAllMocks()
  mocks.getEditor.mockReset()
  mocks.setEditor.mockReset()
})

describe('outline switching', () => {
  it('commits a linked field before Publish scans for incomplete scaffold fields', async () => {
    const calls = []
    mocks.getEditor.mockReturnValue({
      commands: {
        commitFieldBinding: () => calls.push('commit'),
        blur: () => calls.push('blur'),
      },
      state: {
        doc: {
          descendants: () => calls.push('scan'),
        },
      },
    })
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    await mountEditor({ variant: 'toolbar-outline', outline: 'country' })

    wrapper.findComponent({ name: 'CdxToolbar' }).vm.$emit('publish')
    await nextTick()

    // Publish scans twice — fields and unfinished sentences — but always
    // after the linked field has been committed and the keyboard put away.
    expect(calls).toEqual(['commit', 'blur', 'scan', 'scan'])
  })

  it('publishes through a real linked-field commit that is one Undo and Redo event', async () => {
    const prompt =
      '<span data-scaffold-binding="country:subject-name" data-scaffold-placeholder="[Country name]">[Country name]</span>'
    standaloneEditor = new Editor({
      extensions: [StarterKit, ScaffoldBindingMark, FieldBinding],
      content: `<p>${prompt}</p><p>${prompt}</p>`,
    })
    const field = findBoundFields(standaloneEditor.state.doc)[0]
    standaloneEditor.commands.setTextSelection({ from: field.from, to: field.to })
    standaloneEditor.commands.insertContent('India')
    mocks.getEditor.mockReturnValue(standaloneEditor)
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    await mountEditor({ variant: 'toolbar-outline', outline: 'country' })

    wrapper.findComponent({ name: 'CdxToolbar' }).vm.$emit('publish')
    await nextTick()

    expect(findBoundFields(standaloneEditor.state.doc).map((bound) => bound.text)).toEqual([
      'India',
      'India',
    ])
    expect(standaloneEditor.commands.undo()).toBe(true)
    expect(findBoundFields(standaloneEditor.state.doc).map((bound) => bound.text)).toEqual([
      '[Country name]',
      '[Country name]',
    ])
    expect(standaloneEditor.commands.redo()).toBe(true)
    expect(findBoundFields(standaloneEditor.state.doc).map((bound) => bound.text)).toEqual([
      'India',
      'India',
    ])
  })

  it('starts a fresh editor session so later inserts cannot restore the previous outline', async () => {
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' }, true)
    const previousEditor = wrapper.findComponent(TextEditor).vm.editor

    previousEditor.commands.setContent(`
      <h2 data-outline-item-key="person:early-life">Early life</h2>
      <p>Previous outline text</p>
    `)
    await openSettings()

    settingsDialog().vm.$emit('outline-selected', 'city')
    await flushPromises()
    await nextTick()

    const currentEditor = wrapper.findComponent(TextEditor).vm.editor
    expect(currentEditor.instanceId).not.toBe(previousEditor.instanceId)
    expect(currentEditor.getText()).toBe('')
    expect(currentEditor.commands.undo()).toBe(false)

    currentEditor.commands.insertContent(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>New outline text</p>
    `)

    expect(currentEditor.getText()).toContain('New outline text')
    expect(currentEditor.getText()).not.toContain('Previous outline text')
  })

  it('coordinates document-derived delete, undo, and redo Sets while preserving lead keys', async () => {
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' }, true)
    const textEditor = wrapper.findComponent(TextEditor)
    const editor = textEditor.vm.editor

    outlinePopover().vm.$emit(
      'update:addedItems',
      new Set(['person:lead', 'person:history', 'person:career']),
    )
    editor.commands.setContent(`
      <p>Lead text</p>
      <h2 data-outline-item-key="person:history">History</h2>
      <p>History text</p>
      <h2 data-outline-item-key="person:career">Career</h2>
      <p>Career text</p>
    `)
    await nextTick()

    await textEditor.find('[aria-label="Delete History section"]').trigger('click')

    expect(outlinePopover().props('addedItems')).toEqual(new Set(['person:lead', 'person:career']))

    editor.commands.undo()
    await nextTick()

    expect(outlinePopover().props('addedItems')).toEqual(
      new Set(['person:lead', 'person:history', 'person:career']),
    )

    editor.commands.redo()
    await nextTick()

    expect(outlinePopover().props('addedItems')).toEqual(new Set(['person:lead', 'person:career']))
  })

  it('switches outline, resets editor, closes settings, and opens outline sheet', async () => {
    await mountEditor({ lang: 'en', variant: 'toolbar-outline', outline: 'person' })

    outlinePopover().vm.$emit('update:open', false)
    outlinePopover().vm.$emit('update:addedItems', new Set(['person:lead']))
    await nextTick()
    await openSettings()

    settingsDialog().vm.$emit('outline-selected', 'city')
    await flushPromises()

    expect(router.currentRoute.value.query).toMatchObject({
      lang: 'en',
      variant: 'toolbar-outline',
      outline: 'city',
    })
    expect(outlinePopover().props('addedItems')).toEqual(new Set())
    expect(settingsDialog().props('open')).toBe(false)
    expect(outlinePopover().props('open')).toBe(true)
    expect(outlinePopover().props('initialView')).toBe('outline')
  })

  it('selecting the active outline closes settings without resetting or reopening', async () => {
    mocks.getEditor.mockReturnValue(markerCapableEditor())
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' })

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'person')
    await nextTick()

    expect(settingsDialog().props('open')).toBe(false)
    expect(outlinePopover().props('open')).toBe(false)
  })

  it('an aborted navigation preserves editor and sheet state and leaves settings open', async () => {
    mocks.getEditor.mockReturnValue(markerCapableEditor())
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' })

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    let guardReached = false
    removeGuard = router.beforeEach((to) => {
      if (to.query.outline === 'city') {
        guardReached = true
        return false
      }
    })
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'city')
    await flushPromises()

    expect(guardReached).toBe(true)
    expect(router.currentRoute.value.query.outline).toBe('person')
    expect(outlinePopover().props('open')).toBe(false)
    expect(settingsDialog().props('open')).toBe(true)
  })

  it('a rejected navigation preserves editor and sheet state and leaves settings open', async () => {
    mocks.getEditor.mockReturnValue(markerCapableEditor())
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' })

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    const replace = vi.spyOn(router, 'replace').mockRejectedValue(new Error('Navigation rejected'))
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'city')
    await flushPromises()

    expect(replace).toHaveBeenCalled()
    expect(router.currentRoute.value.query.outline).toBe('person')
    expect(outlinePopover().props('open')).toBe(false)
    expect(settingsDialog().props('open')).toBe(true)
  })

  it('waits for successful navigation before reopening the outline sheet', async () => {
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' })

    let resolveNavigation
    const navigationGate = new Promise((resolve) => {
      resolveNavigation = resolve
    })
    const originalReplace = router.replace.bind(router)
    const replace = vi.spyOn(router, 'replace').mockImplementation(async (location) => {
      await navigationGate
      return originalReplace(location)
    })
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'city')
    await nextTick()

    expect(replace).toHaveBeenCalled()
    expect(router.currentRoute.value.query.outline).toBe('person')
    expect(outlinePopover().props('open')).toBe(true)

    resolveNavigation()
    await flushPromises()

    expect(router.currentRoute.value.query.outline).toBe('city')
    expect(outlinePopover().props('open')).toBe(true)
  })

  it('switches route and sheet when no editor instance is available', async () => {
    mocks.getEditor.mockReturnValue(null)
    await mountEditor({ lang: 'en', variant: 'toolbar-outline', outline: 'person' })

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'city')
    await flushPromises()

    expect(router.currentRoute.value.query.outline).toBe('city')
    expect(settingsDialog().props('open')).toBe(false)
    expect(outlinePopover().props('open')).toBe(true)
    expect(outlinePopover().props('initialView')).toBe('outline')
  })
})
