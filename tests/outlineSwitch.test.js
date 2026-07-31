// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getEditor: vi.fn(),
  resetEditorContent: vi.fn(),
}))

vi.mock('@/components/CdxToolbar.vue', () => ({
  default: {
    name: 'CdxToolbar',
    template: '<div />',
  },
}))

vi.mock('@/composables/useEditorInstance', () => ({
  useEditorInstance: () => ({ getEditor: mocks.getEditor }),
}))

vi.mock('@/utils/resetEditorContent', () => ({
  resetEditorContent: mocks.resetEditorContent,
}))

import EditorView from '../src/views/EditorView.vue'

const stubs = {
  TextEditor: {
    name: 'TextEditor',
    emits: ['open-settings'],
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

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/editor', name: 'editor', component: EditorView }],
  })
}

async function mountEditor(query = {}) {
  router = createTestRouter()
  await router.push({ name: 'editor', query })
  await router.isReady()
  wrapper = mount(EditorView, {
    global: {
      plugins: [router],
      stubs,
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
  vi.restoreAllMocks()
  mocks.getEditor.mockReset()
  mocks.resetEditorContent.mockReset()
})

describe('outline switching', () => {
  it('switches outline, resets editor, closes settings, and opens outline sheet', async () => {
    const editor = { id: 'editor' }
    mocks.getEditor.mockReturnValue(editor)
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
    expect(mocks.resetEditorContent).toHaveBeenCalledWith(editor)
    expect(outlinePopover().props('addedItems')).toEqual(new Set())
    expect(settingsDialog().props('open')).toBe(false)
    expect(outlinePopover().props('open')).toBe(true)
    expect(outlinePopover().props('initialView')).toBe('outline')
  })

  it('selecting the active outline closes settings without resetting or reopening', async () => {
    mocks.getEditor.mockReturnValue({ id: 'editor' })
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' })

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'person')
    await nextTick()

    expect(mocks.resetEditorContent).not.toHaveBeenCalled()
    expect(settingsDialog().props('open')).toBe(false)
    expect(outlinePopover().props('open')).toBe(false)
  })

  it('an aborted navigation preserves editor and sheet state and leaves settings open', async () => {
    mocks.getEditor.mockReturnValue({ id: 'editor' })
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
    expect(mocks.resetEditorContent).not.toHaveBeenCalled()
    expect(outlinePopover().props('open')).toBe(false)
    expect(settingsDialog().props('open')).toBe(true)
  })

  it('a rejected navigation preserves editor and sheet state and leaves settings open', async () => {
    mocks.getEditor.mockReturnValue({ id: 'editor' })
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' })

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    const replace = vi.spyOn(router, 'replace').mockRejectedValue(new Error('Navigation rejected'))
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'city')
    await flushPromises()

    expect(replace).toHaveBeenCalled()
    expect(router.currentRoute.value.query.outline).toBe('person')
    expect(mocks.resetEditorContent).not.toHaveBeenCalled()
    expect(outlinePopover().props('open')).toBe(false)
    expect(settingsDialog().props('open')).toBe(true)
  })

  it('waits for successful navigation before resetting editor state', async () => {
    const editor = { id: 'editor' }
    mocks.getEditor.mockReturnValue(editor)
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' })

    let resolveNavigation
    const replace = vi.spyOn(router, 'replace').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveNavigation = resolve
        }),
    )
    await openSettings()
    settingsDialog().vm.$emit('outline-selected', 'city')
    await nextTick()

    expect(replace).toHaveBeenCalled()
    expect(mocks.resetEditorContent).not.toHaveBeenCalled()

    resolveNavigation()
    await flushPromises()

    expect(mocks.resetEditorContent).toHaveBeenCalledWith(editor)
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
    expect(mocks.resetEditorContent).toHaveBeenCalledWith(null)
    expect(settingsDialog().props('open')).toBe(false)
    expect(outlinePopover().props('open')).toBe(true)
    expect(outlinePopover().props('initialView')).toBe('outline')
  })
})
