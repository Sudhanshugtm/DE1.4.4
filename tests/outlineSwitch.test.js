// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { Editor } from '@tiptap/core'
import { undoDepth } from '@tiptap/pm/history'
import StarterKit from '@tiptap/starter-kit'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TextEditor from '../src/components/TextEditor.vue'
import { VERIFIED_FACTS_DEMO_ROUTE } from '../src/config/verifiedFactsDemo.js'
import { FieldBinding } from '../src/extensions/fieldBinding.js'
import { ScaffoldBindingMark } from '../src/extensions/scaffoldBindingMark.js'
import { findBoundFields } from '../src/utils/scaffoldFields.js'

const expectedBuddhismFact = Object.freeze({
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

const mocks = vi.hoisted(() => ({
  getEditor: vi.fn(),
  setEditor: vi.fn(),
  focusInsertButton: vi.fn(),
}))

vi.mock('@/components/CdxToolbar.vue', () => ({
  default: {
    name: 'CdxToolbar',
    props: ['showVerifiedFacts', 'canPublish'],
    emits: ['open-outline', 'open-verified-facts', 'publish'],
    setup(_, { expose }) {
      expose({ focusInsertButton: mocks.focusInsertButton })
    },
    template: '<div class="toolbar" />',
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
    props: ['open', 'demoLaunchPending'],
    emits: ['outline-selected', 'open-verified-facts-demo', 'update:open'],
    template: `
      <div class="settings-dialog">
        <button
          v-if="open"
          data-testid="open-verified-facts-demo"
          :disabled="demoLaunchPending"
          @click="$emit('open-verified-facts-demo')"
        >Open Verified facts demo</button>
      </div>
    `,
  },
  OutlinePopover: {
    name: 'OutlinePopover',
    props: ['open', 'initialView', 'addedItems', 'verifiedFacts', 'outlineLabel'],
    emits: ['update:open', 'update:addedItems'],
    template: '<div class="outline-popover" />',
  },
  EditorRail: {
    name: 'EditorRail',
    props: ['initialView', 'isOpen'],
    template: '<div class="editor-rail" />',
  },
  EditCheckRail: {
    name: 'EditCheckRail',
    props: ['checks', 'index'],
    template: '<div class="edit-check-rail" />',
  },
  CommunityTipsSheet: {
    name: 'CommunityTipsSheet',
    props: ['open', 'title', 'attribution', 'bullets'],
    emits: ['update:open'],
    template: '<div class="community-tips-sheet" />',
  },
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

async function mountEditor(query = {}, { realTextEditor = false, attachTo = false } = {}) {
  router = createTestRouter()
  await router.push({ name: 'editor', query })
  await router.isReady()
  const activeStubs = { ...stubs }
  if (realTextEditor) delete activeStubs.TextEditor
  wrapper = mount(EditorView, {
    ...(realTextEditor || attachTo ? { attachTo: document.body } : {}),
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

function toolbar() {
  return wrapper.findComponent({ name: 'CdxToolbar' })
}

function editorRail() {
  return wrapper.findComponent({ name: 'EditorRail' })
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

function setupState() {
  return wrapper.vm.$.setupState
}

async function seedCoordinatorState() {
  const state = setupState()
  state.addedOutlineItems = new Set(['seed:lead', 'seed:history'])
  state.pendingChecks = [
    { name: 'paste', range: { from: 1, to: 2 } },
    { name: 'completeSection', range: { from: 3, to: 4 }, fields: [] },
  ]
  state.activeCheckIndex = 1
  state.hasAuthoredText = true
  state.nextCitationNumber = 7
  state.tipSuggestion = {
    title: 'Seeded tip',
    intro: 'Seeded attribution',
    bullets: ['Seeded bullet'],
    open: true,
  }
  state.hasDismissedTip = true
  await nextTick()
}

function coordinatorSnapshot() {
  const state = setupState()
  return {
    addedOutlineItems: new Set(state.addedOutlineItems),
    pendingChecks: JSON.parse(JSON.stringify(state.pendingChecks)),
    activeCheckIndex: state.activeCheckIndex,
    hasAuthoredText: state.hasAuthoredText,
    nextCitationNumber: state.nextCitationNumber,
    tipSuggestion: state.tipSuggestion
      ? JSON.parse(JSON.stringify(state.tipSuggestion))
      : state.tipSuggestion,
    hasDismissedTip: state.hasDismissedTip,
  }
}

function expectCoordinatorReset() {
  const state = setupState()
  expect(state.addedOutlineItems).toEqual(new Set())
  expect(state.pendingChecks).toEqual([])
  expect(state.activeCheckIndex).toBe(0)
  expect(state.hasAuthoredText).toBe(false)
  expect(toolbar().props('canPublish')).toBe(false)
  expect(state.nextCitationNumber).toBe(1)
  expect(state.tipSuggestion).toBe(null)
  expect(wrapper.findComponent({ name: 'CommunityTipsSheet' }).props('open')).toBe(false)
  expect(state.hasDismissedTip).toBe(false)
}

function verifiedFactsDemoButton() {
  return wrapper.get('[data-testid="open-verified-facts-demo"]')
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
  mocks.focusInsertButton.mockReset()
})

describe('reviewed verified facts integration', () => {
  it('keeps four Portugal facts private when the demo flag is absent', async () => {
    await mountEditor({
      lang: 'en',
      variant: 'toolbar-outline',
      outline: 'country',
      title: 'Portugal',
    })

    expect(toolbar().props('showVerifiedFacts')).toBe(false)
    expect(outlinePopover().props('outlineLabel')).toBe('Country')
    expect(
      outlinePopover()
        .props('verifiedFacts')
        .map(({ id, value }) => ({ id, value })),
    ).toEqual([
      { id: 'portugal-official-name-portuguese', value: 'República Portuguesa' },
      { id: 'portugal-area-2021', value: '92,225 km²' },
      { id: 'portugal-population-2021-census', value: '10,347,892' },
      { id: 'portugal-official-language', value: 'Portuguese' },
    ])

    outlinePopover().vm.$emit('update:open', false)
    toolbar().vm.$emit('open-verified-facts')
    await nextTick()

    expect(outlinePopover().props('open')).toBe(false)
  })

  it('preserves the Buddhism fact and passes the Religion outline label', async () => {
    await mountEditor({
      lang: 'en',
      variant: 'toolbar-outline',
      outline: 'religion',
      title: 'Buddhism',
      verifiedfacts: '1',
    })

    expect(toolbar().props('showVerifiedFacts')).toBe(true)
    expect(outlinePopover().props('verifiedFacts')).toEqual([expectedBuddhismFact])
    expect(outlinePopover().props('outlineLabel')).toBe('Religion')
  })

  it('reopens a dismissed flagged toolbar sheet directly on reviewed facts', async () => {
    await mountEditor({
      lang: 'en',
      variant: 'toolbar-outline',
      outline: 'religion',
      title: 'Buddhism',
      verifiedfacts: '1',
    })
    outlinePopover().vm.$emit('update:open', false)
    await nextTick()

    toolbar().vm.$emit('open-verified-facts')
    await nextTick()

    expect(outlinePopover().props('open')).toBe(true)
    expect(outlinePopover().props('initialView')).toBe('verified-facts')
    expect(mocks.getEditor).not.toHaveBeenCalled()
  })

  it('opens reviewed facts without changing real editor content, selection, or history', async () => {
    await mountEditor(
      {
        lang: 'en',
        variant: 'toolbar-outline',
        outline: 'country',
        title: 'Portugal',
        verifiedfacts: '1',
      },
      { realTextEditor: true },
    )
    const editor = wrapper.findComponent(TextEditor).vm.editor
    editor.commands.setContent('<p>A stable plain draft remains unchanged.</p>')
    editor
      .chain()
      .focus(null, { scrollIntoView: false })
      .setTextSelection({ from: 3, to: 15 })
      .run()
    await new Promise((resolve) => requestAnimationFrame(resolve))
    await nextTick()

    expect(editor.isFocused).toBe(true)
    expect(editor.state.selection.empty).toBe(false)
    const documentBefore = editor.getJSON()
    const selectionBefore = {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    }
    const undoDepthBefore = undoDepth(editor.state)

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    toolbar().vm.$emit('open-verified-facts')
    await flushPromises()
    await nextTick()

    expect(editor.getJSON()).toEqual(documentBefore)
    expect({
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    }).toEqual(selectionBefore)
    expect(undoDepth(editor.state)).toBe(undoDepthBefore)
    expect(outlinePopover().props('open')).toBe(true)
  })

  it('fails closed when the route has no reviewed facts', async () => {
    await mountEditor({
      lang: 'en',
      variant: 'toolbar-outline',
      outline: 'religion',
      title: 'Unsupported title',
      verifiedfacts: '1',
    })

    expect(toolbar().props('showVerifiedFacts')).toBe(false)
    expect(outlinePopover().props('verifiedFacts')).toEqual([])

    outlinePopover().vm.$emit('update:open', false)
    await nextTick()
    toolbar().vm.$emit('open-verified-facts')
    await nextTick()

    expect(outlinePopover().props('open')).toBe(false)
  })

  it('opens suggested sections in toolbar mode even when a placeholder is selected', async () => {
    mocks.getEditor.mockReturnValue({
      state: { selection: { node: { type: { name: 'placeholderChip' } } } },
    })
    await mountEditor({
      lang: 'en',
      variant: 'toolbar-outline',
      outline: 'religion',
      title: 'Buddhism',
    })
    outlinePopover().vm.$emit('update:open', false)
    await nextTick()

    toolbar().vm.$emit('open-outline')
    await nextTick()

    expect(outlinePopover().props('open')).toBe(true)
    expect(outlinePopover().props('initialView')).toBe('outline')
  })

  it('preserves placeholder-selected verified facts in the non-toolbar rail', async () => {
    mocks.getEditor.mockReturnValue({
      state: { selection: { node: { type: { name: 'placeholderChip' } } } },
    })
    await mountEditor({ outline: 'person' })

    toolbar().vm.$emit('open-outline')
    await nextTick()

    expect(editorRail().props('initialView')).toBe('verified-facts')
    expect(editorRail().props('isOpen')).toBe(true)
  })
})

describe('Verified facts demo launcher', () => {
  async function seedDraftAndOpenSettings() {
    const editor = wrapper.findComponent(TextEditor).vm.editor
    editor.commands.setContent('<p>A real seeded draft must survive failed navigation.</p>')
    await seedCoordinatorState()
    await openSettings()
    verifiedFactsDemoButton().element.focus()
    return editor
  }

  function expectPreservedSession(previousEditor, previousDocument, previousCoordinator) {
    const currentEditor = wrapper.findComponent(TextEditor).vm.editor
    expect(currentEditor.instanceId).toBe(previousEditor.instanceId)
    expect(currentEditor.getJSON()).toEqual(previousDocument)
    expect(coordinatorSnapshot()).toEqual(previousCoordinator)
    expect(settingsDialog().props('open')).toBe(true)
    expect(settingsDialog().props('demoLaunchPending')).toBe(false)
    expect(verifiedFactsDemoButton().attributes('disabled')).toBeUndefined()
    expect(document.activeElement).toBe(verifiedFactsDemoButton().element)
    expect(mocks.focusInsertButton).not.toHaveBeenCalled()
  }

  it.each([
    {
      source: 'the same Country outline',
      query: {
        lang: 'en',
        variant: 'toolbar-outline',
        outline: 'country',
        title: 'Spain',
        source: 'https://example.com/source-to-drop',
      },
    },
    {
      source: 'a different Person outline',
      query: {
        lang: 'en',
        variant: 'toolbar-outline',
        outline: 'person',
        title: 'Ada Lovelace',
        extra: 'drop-me',
      },
    },
  ])('starts a clean canonical session from $source', async ({ query }) => {
    await mountEditor(query, { realTextEditor: true })
    const previousEditor = await seedDraftAndOpenSettings()
    let editorAtFocus
    mocks.focusInsertButton.mockImplementation(() => {
      editorAtFocus = wrapper.findComponent(TextEditor).vm.editor
    })
    const push = vi.spyOn(router, 'push')

    await verifiedFactsDemoButton().trigger('click')
    await flushPromises()
    await nextTick()

    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith(VERIFIED_FACTS_DEMO_ROUTE)
    expect(router.currentRoute.value.query).toEqual(VERIFIED_FACTS_DEMO_ROUTE.query)
    const currentEditor = wrapper.findComponent(TextEditor).vm.editor
    expect(currentEditor.instanceId).not.toBe(previousEditor.instanceId)
    expect(currentEditor.getText()).toBe('')
    expect(currentEditor.commands.undo()).toBe(false)
    expectCoordinatorReset()
    expect(settingsDialog().props('open')).toBe(false)
    expect(outlinePopover().props('open')).toBe(true)
    expect(outlinePopover().props('initialView')).toBe('outline')
    expect(mocks.focusInsertButton).toHaveBeenCalledTimes(1)
    expect(editorAtFocus.instanceId).toBe(currentEditor.instanceId)
  })

  it('only closes Settings on the exact canonical route regardless of query insertion order', async () => {
    const reversedCanonicalQuery = Object.fromEntries(
      Object.entries(VERIFIED_FACTS_DEMO_ROUTE.query).reverse(),
    )
    await mountEditor(reversedCanonicalQuery, { realTextEditor: true })
    const previousEditor = await seedDraftAndOpenSettings()
    const previousDocument = previousEditor.getJSON()
    const previousCoordinator = coordinatorSnapshot()
    const push = vi.spyOn(router, 'push')

    await verifiedFactsDemoButton().trigger('click')
    await flushPromises()

    expect(push).not.toHaveBeenCalled()
    expect(wrapper.findComponent(TextEditor).vm.editor.instanceId).toBe(previousEditor.instanceId)
    expect(wrapper.findComponent(TextEditor).vm.editor.getJSON()).toEqual(previousDocument)
    expect(coordinatorSnapshot()).toEqual(previousCoordinator)
    expect(settingsDialog().props('open')).toBe(false)
    expect(mocks.focusInsertButton).not.toHaveBeenCalled()
  })

  it('preserves the current session when a guard aborts the canonical launch', async () => {
    await mountEditor(
      { lang: 'en', variant: 'toolbar-outline', outline: 'person', title: 'Draft' },
      { realTextEditor: true },
    )
    const previousEditor = await seedDraftAndOpenSettings()
    const previousDocument = previousEditor.getJSON()
    const previousCoordinator = coordinatorSnapshot()
    removeGuard = router.beforeEach((to) => {
      if (to.query.title === 'Portugal') return false
    })

    await verifiedFactsDemoButton().trigger('click')
    await flushPromises()
    await nextTick()

    expectPreservedSession(previousEditor, previousDocument, previousCoordinator)
  })

  it('preserves the current session when router.push rejects', async () => {
    await mountEditor(
      { lang: 'en', variant: 'toolbar-outline', outline: 'person', title: 'Draft' },
      { realTextEditor: true },
    )
    const previousEditor = await seedDraftAndOpenSettings()
    const previousDocument = previousEditor.getJSON()
    const previousCoordinator = coordinatorSnapshot()
    vi.spyOn(router, 'push').mockRejectedValue(new Error('Navigation rejected'))

    await verifiedFactsDemoButton().trigger('click')
    await flushPromises()
    await nextTick()

    expectPreservedSession(previousEditor, previousDocument, previousCoordinator)
  })

  it('preserves the current session when a guard redirects Portugal to flagged Spain', async () => {
    await mountEditor(
      { lang: 'en', variant: 'toolbar-outline', outline: 'country', title: 'Draft' },
      { realTextEditor: true },
    )
    const previousEditor = await seedDraftAndOpenSettings()
    const previousDocument = previousEditor.getJSON()
    const previousCoordinator = coordinatorSnapshot()
    removeGuard = router.beforeEach((to) => {
      if (to.query.title === 'Portugal') {
        return { ...to, query: { ...to.query, title: 'Spain' } }
      }
    })

    await verifiedFactsDemoButton().trigger('click')
    await flushPromises()
    await nextTick()

    expect(router.currentRoute.value.query.title).toBe('Spain')
    expect(router.currentRoute.value.query.verifiedfacts).toBe('1')
    expectPreservedSession(previousEditor, previousDocument, previousCoordinator)
  })

  it('preserves the current session when push resolves without changing the route', async () => {
    await mountEditor(
      { lang: 'en', variant: 'toolbar-outline', outline: 'country', title: 'Draft' },
      { realTextEditor: true },
    )
    const previousEditor = await seedDraftAndOpenSettings()
    const previousDocument = previousEditor.getJSON()
    const previousCoordinator = coordinatorSnapshot()
    vi.spyOn(router, 'push').mockResolvedValue(undefined)

    await verifiedFactsDemoButton().trigger('click')
    await flushPromises()
    await nextTick()

    expectPreservedSession(previousEditor, previousDocument, previousCoordinator)
  })

  it('deduplicates pending launches and focuses Insert only after the editor remounts', async () => {
    await mountEditor(
      { lang: 'en', variant: 'toolbar-outline', outline: 'person', title: 'Draft' },
      { realTextEditor: true },
    )
    const previousEditor = await seedDraftAndOpenSettings()
    let resolveNavigation
    const navigationGate = new Promise((resolve) => {
      resolveNavigation = resolve
    })
    const originalPush = router.push.bind(router)
    const push = vi.spyOn(router, 'push').mockImplementation(async (location) => {
      await navigationGate
      return originalPush(location)
    })
    let editorAtFocus
    mocks.focusInsertButton.mockImplementation(() => {
      editorAtFocus = wrapper.findComponent(TextEditor).vm.editor
    })

    settingsDialog().vm.$emit('open-verified-facts-demo')
    settingsDialog().vm.$emit('open-verified-facts-demo')
    await nextTick()

    expect(push).toHaveBeenCalledTimes(1)
    expect(settingsDialog().props('demoLaunchPending')).toBe(true)
    expect(verifiedFactsDemoButton().attributes('disabled')).toBeDefined()
    expect(wrapper.findComponent(TextEditor).vm.editor.instanceId).toBe(previousEditor.instanceId)
    expect(mocks.focusInsertButton).not.toHaveBeenCalled()

    resolveNavigation()
    await flushPromises()
    await nextTick()

    const currentEditor = wrapper.findComponent(TextEditor).vm.editor
    expect(currentEditor.instanceId).not.toBe(previousEditor.instanceId)
    expect(editorAtFocus.instanceId).toBe(currentEditor.instanceId)
    expect(mocks.focusInsertButton).toHaveBeenCalledTimes(1)
  })
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
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' }, { realTextEditor: true })
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
    await mountEditor({ variant: 'toolbar-outline', outline: 'person' }, { realTextEditor: true })
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

  it('a redirected outline navigation preserves the editor, session state, and Settings', async () => {
    await mountEditor(
      { lang: 'en', variant: 'toolbar-outline', outline: 'person', title: 'Draft' },
      { realTextEditor: true },
    )
    const previousEditor = wrapper.findComponent(TextEditor).vm.editor
    previousEditor.commands.setContent('<p>Redirected outline draft</p>')
    await seedCoordinatorState()
    const previousDocument = previousEditor.getJSON()
    const previousCoordinator = coordinatorSnapshot()
    removeGuard = router.beforeEach((to) => {
      if (to.query.outline === 'city') {
        return { ...to, query: { ...to.query, outline: 'country' } }
      }
    })
    await openSettings()

    settingsDialog().vm.$emit('outline-selected', 'city')
    await flushPromises()
    await nextTick()

    expect(router.currentRoute.value.query.outline).toBe('country')
    const currentEditor = wrapper.findComponent(TextEditor).vm.editor
    expect(currentEditor.instanceId).toBe(previousEditor.instanceId)
    expect(currentEditor.getJSON()).toEqual(previousDocument)
    expect(coordinatorSnapshot()).toEqual(previousCoordinator)
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
