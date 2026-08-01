<template>
  <div class="editor-page">
    <CdxToolbar
      :show-outline-entry="isToolbarOutlineVariant"
      :show-cite="!isToolbarOutlineVariant"
      :highlight-outline-entry="highlightOutlineEntry"
      :can-publish="hasAuthoredText"
      @open-outline="onOpenOutline"
      @insert-menu-opened="hasOpenedInsertMenu = true"
      @cite="onOpenCiteDefault"
      @close="onClose"
      @publish="onPublish"
    />
    <div
      class="editor-wrapper"
      :class="{
        'rail-open': isRailOpen,
        'editor-wrapper--full-width': isToolbarOutlineVariant,
      }"
    >
      <div class="editor-main" @click="isRailOpen && (isRailOpen = false)">
        <TextEditor
          :key="activeOutlineId"
          :show-outline-entry="!isToolbarOutlineVariant"
          :show-placeholder="isToolbarOutlineVariant"
          :suppress-auto-focus="isToolbarOutlineVariant"
          @open-outline="onOpenOutline"
          @open-settings="settingsDialogOpen = true"
          @open-source-context="onOpenSourceContext"
          @outline-sections-changed="onOutlineSectionsChanged"
          @authored="hasAuthoredText = true"
          @editor-focused="onEditorFocused"
          @pasted="onPasted"
        />
      </div>
      <div v-if="!isToolbarOutlineVariant" class="editor-rail-column">
        <EditorRail
          :is-open="isRailOpen"
          :initial-view="initialView"
          @content-inserted="onContentInserted"
          @close="isRailOpen = false"
          @open-cite-discover="onOpenCiteDiscover"
        />
      </div>
    </div>

    <!-- Force entry point: + button in the 44px rail strip, aligned with cursor -->
    <div
      v-if="isForceButtonVisible"
      class="force-entry-point"
      :style="forceButtonStyle"
      @mousedown.prevent
      @click.stop="onForceButtonClick"
    >
      <CdxIcon :icon="cdxIconAdd" />
    </div>

    <OutlinePopover
      v-if="effectiveOutlineLocation === 'popover'"
      v-model:open="isPopoverOpen"
      v-model:added-items="addedOutlineItems"
      :initial-view="initialView"
      :selectable-outlines="isToolbarOutlineVariant"
      @content-inserted="onContentInserted"
      @open-cite-discover="onOpenCiteDiscover"
    />
    <EditCheckRail
      :checks="pendingChecks"
      :index="activeCheckIndex"
      @act="onCheckAction"
      @dismiss="onDismissChecks"
      @navigate="onNavigateChecks"
    />
    <SourceContextSheet v-model:open="sourceContextOpen" @add-citation="onAddCitationFromSource" />
    <SettingsDialog v-model:open="settingsDialogOpen" @outline-selected="onOutlineSelected" />
    <CiteDialog
      v-model:open="citeDialogOpen"
      :initial-tab="citeDialogInitialTab"
      :reusable-sources="arrivalSources"
      @citation-created="onCitationCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconAdd } from '@wikimedia/codex-icons'
import TextEditor from '@/components/TextEditor.vue'
import EditorRail from '@/components/EditorRail.vue'
import CdxToolbar from '@/components/CdxToolbar.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import CiteDialog from '@/components/CiteDialog.vue'
import OutlinePopover from '@/components/OutlinePopover.vue'
import SourceContextSheet from '@/components/SourceContextSheet.vue'
import EditCheckRail from '@/components/EditCheckRail.vue'
import { findIncompleteSentences, findScaffoldFields } from '@/utils/scaffoldFields'
import { findReferencesList } from '@/extensions/referencesList'
import { useEditorSettings } from '@/composables/useEditorSettings'
import { useEditorInstance } from '@/composables/useEditorInstance'
import { useCursorRect } from '@/composables/useCursorRect'
import { simpleEnglishOutlinesById } from '@/config/outlines/simpleEnglish'

const route = useRoute()
const router = useRouter()
const { settings } = useEditorSettings()
const isToolbarOutlineVariant = computed(() => route.query.variant === 'toolbar-outline')
const outlineLocation = computed(() => settings.value.outline.location)
const effectiveOutlineLocation = computed(() =>
  isToolbarOutlineVariant.value ? 'popover' : outlineLocation.value,
)
const entryPointStyle = computed(() => settings.value.entryPoint.style)
const activeOutlineId = computed(() => {
  const outlineId = route.query.outline
  return typeof outlineId === 'string' && Object.hasOwn(simpleEnglishOutlinesById, outlineId)
    ? outlineId
    : 'person'
})

// Force entry point
const { getEditor } = useEditorInstance()
const { cursorRect } = useCursorRect()

const isForceButtonVisible = computed(() => {
  if (isToolbarOutlineVariant.value) return false
  if (!['force', 'quiet', 'text', 'floating'].includes(entryPointStyle.value)) return false
  if (isRailOpen.value || isPopoverOpen.value) return false
  if (!cursorRect.value) return false
  return cursorRect.value.visible
})

const forceButtonStyle = computed(() => {
  if (!cursorRect.value) return {}
  const rect = cursorRect.value
  const halfLeading = (rect.lineHeight - rect.glyphHeight) / 2
  return {
    position: 'fixed',
    top: `${rect.top - halfLeading}px`,
    right: '0px',
    width: '44px',
    height: `${rect.lineHeight}px`,
  }
})

// Sources gathered before the editor opened travel in on the URL, the way the
// guidance flow hands them over. They seed the citation flow's Re-use tab.
const arrivalSources = computed(() => {
  const raw = route.query.source
  const urls = typeof raw === 'string' ? [raw] : Array.isArray(raw) ? raw : []
  return urls
    .map((url) => {
      try {
        const parsed = new URL(url)
        return { url: parsed.href, domain: parsed.hostname.replace(/^www\./, '') }
      } catch {
        return null
      }
    })
    .filter(Boolean)
})

const isRailOpen = ref(false)
// The sheet greets the editor on arrival, so the guidance is seen rather than
// waited for. The toolbar + reopens it once dismissed.
const isPopoverOpen = ref(isToolbarOutlineVariant.value)
const settingsDialogOpen = ref(false)
const citeDialogOpen = ref(false)
const citeDialogInitialTab = ref('automatic')
const initialView = ref(null)
const addedOutlineItems = ref(new Set())
const sourceContextOpen = ref(false)
const pendingSourceRange = ref(null)
const nextCitationNumber = ref(1)

// Publishing opens up once the editor has written something of their own.
// The scaffold they still have to resolve is raised at the publish moment.
const hasAuthoredText = ref(false)
const pendingChecks = ref([])
const activeCheckIndex = ref(0)

// Pasted text is raised as it happens, not held back until publishing:
// the sooner it is asked about, the less there is to unpick.
async function onPasted() {
  if (pendingChecks.value.some((check) => check.name === 'paste')) return

  // Once the paste has landed, the keyboard steps aside for the card asking
  // about it, which sits where the keyboard was.
  await nextTick()
  getEditor()?.commands.blur()

  pendingChecks.value = [
    {
      name: 'paste',
      type: 'check',
      title: 'Pasted content',
      message:
        'Please avoid copying text from other sources, even if rephrased or cited. This could be considered copyright violation or plagiarism and may result in your content being removed or your account being blocked.',
      prompt: 'Did you write this text?',
      actions: [
        { name: 'keep', label: 'Yes, keep it' },
        { name: 'remove', label: 'No, remove it' },
      ],
    },
    ...pendingChecks.value,
  ]
  activeCheckIndex.value = 0
}

function onPublish() {
  const editor = getEditor()
  if (!editor) return

  // Checks are answered, not typed into, and their card sits at the foot of
  // the screen. The keyboard steps aside so it is not left behind it.
  editor.commands.blur()

  const fields = findScaffoldFields(editor.state.doc)
  activeCheckIndex.value = 0

  // Anything already waiting stays waiting; publishing adds to the list.
  const carried = pendingChecks.value.filter((check) => check.name !== 'completeSection')

  // Unfilled fields are one thing to put right, however many there are.
  pendingChecks.value = fields.length
    ? [
        ...carried,
        {
          name: 'completeSection',
          type: 'check',
          title: 'Complete section',
          message:
            'Fields in templates cannot be empty. Before publishing, replace them with real content, or delete the sentences holding them.',
          actions: [
            { name: 'review', label: 'Review' },
            { name: 'delete', label: 'Delete' },
          ],
          fields,
        },
      ]
    : carried

  if (!pendingChecks.value.length) {
    // Nothing left to resolve; a real editor would save here.
    window.alert('Published')
  }
}

function onNavigateChecks(nextIndex) {
  activeCheckIndex.value = Math.max(0, Math.min(nextIndex, pendingChecks.value.length - 1))
}

// Review walks the fields one at a time; Delete clears the ones still empty.
const reviewedFieldIndex = ref(0)

function onCheckAction({ action, check }) {
  const editor = getEditor()
  if (!editor) return

  if (check?.name === 'paste') {
    if (action === 'remove') editor.chain().focus().undo().run()
    pendingChecks.value = pendingChecks.value.filter((pending) => pending.name !== 'paste')
    activeCheckIndex.value = 0
    return
  }

  if (!check?.fields?.length) return

  if (action === 'review') {
    const field = check.fields[reviewedFieldIndex.value % check.fields.length]
    reviewedFieldIndex.value += 1
    editor
      .chain()
      .focus()
      .setTextSelection({ from: field.from, to: field.to })
      .scrollIntoView()
      .run()
    return
  }

  // A field cannot go on its own: "[Full name] was born on [date] in [place]."
  // would be left as " was born on  in .". The sentence goes with it.
  const chain = editor.chain().focus()
  ;[...findIncompleteSentences(editor.state.doc)].reverse().forEach((sentence) => {
    chain.deleteRange(sentence)
  })
  chain.run()

  refreshChecks()
}

// The document moved, so the fields still empty are found again.
function refreshChecks() {
  const editor = getEditor()
  const fields = editor ? findScaffoldFields(editor.state.doc) : []
  reviewedFieldIndex.value = 0

  if (!fields.length) {
    pendingChecks.value = []
    return
  }

  pendingChecks.value = pendingChecks.value.map((check) =>
    check.name === 'completeSection' ? { ...check, fields } : check,
  )
}

function onDismissChecks() {
  pendingChecks.value = []
}

function onOutlineSectionsChanged(sectionKeys) {
  const leadKeys = [...addedOutlineItems.value].filter((key) => key.endsWith(':lead'))
  addedOutlineItems.value = new Set([...leadKeys, ...sectionKeys])
}

async function onOutlineSelected(outlineId) {
  if (outlineId === activeOutlineId.value) {
    settingsDialogOpen.value = false
    return
  }

  try {
    const failure = await router.replace({
      query: { ...route.query, outline: outlineId },
    })
    if (isNavigationFailure(failure)) return
  } catch {
    return
  }

  // A different outline is a different article, so the editor starts clean:
  // the previous article's text, checks and progress all go with it.
  addedOutlineItems.value = new Set()
  pendingChecks.value = []
  activeCheckIndex.value = 0
  hasAuthoredText.value = false
  nextCitationNumber.value = 1
  initialView.value = 'outline'
  settingsDialogOpen.value = false
  isPopoverOpen.value = true
}

function onForceButtonClick() {
  getEditor()?.commands.blur()
  onOpenOutline()
}

// After the sheet is dismissed, the toolbar + carries a pulsating dot so the
// suggestions are findable again.
const hasDismissedSheet = ref(false)
// Opening the insert menu even once means the editor knows where guidance
// lives, so the dot has nothing left to say — including after they switch to
// another outline.
const hasOpenedInsertMenu = ref(false)
// Only ever one thing asking to be looked at. With an empty article the + is
// the only move, so the dot points at it; once a section is in, the caret
// waiting in the text is the thing to see.
const highlightOutlineEntry = computed(
  () =>
    isToolbarOutlineVariant.value &&
    hasDismissedSheet.value &&
    !hasOpenedInsertMenu.value &&
    addedOutlineItems.value.size === 0,
)

watch(isPopoverOpen, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen) hasDismissedSheet.value = true
})

function onOpenOutline() {
  const editor = getEditor()
  const isPlaceholderSelected = editor?.state.selection.node?.type.name === 'placeholderChip'
  initialView.value = isPlaceholderSelected ? 'verified-facts' : null

  if (effectiveOutlineLocation.value === 'popover') {
    isPopoverOpen.value = true
  } else {
    isRailOpen.value = true
  }
}

function onClose() {
  router.push({ name: 'hub' })
}

// A citation starts from what the editor already has: sources brought along
// from guidance open on Re-use; with none, Automatic leads as usual.
function defaultCiteTab() {
  return arrivalSources.value.length ? 'reuse' : 'automatic'
}

function onOpenCiteDefault() {
  pendingSourceRange.value = null
  citeDialogInitialTab.value = defaultCiteTab()
  citeDialogOpen.value = true
}

// ── Source prompt → citation, mirroring the citation-needed flow in VE ──

function onOpenSourceContext(range) {
  // The claim is being asked about, not written in. If the keyboard was
  // already up it steps aside, so the context item is not left behind it.
  getEditor()?.commands.blur()
  pendingSourceRange.value = range
  sourceContextOpen.value = true
}

function onAddCitationFromSource() {
  sourceContextOpen.value = false
  citeDialogInitialTab.value = defaultCiteTab()
  citeDialogOpen.value = true
}

// A created citation replaces the Source prompt that asked for it, the way
// Citoid replaces a citation-needed template rather than sitting beside it.
function onCitationCreated({ url }) {
  const editor = getEditor()
  const range = pendingSourceRange.value
  pendingSourceRange.value = null
  if (!editor || !range) return

  editor
    .chain()
    .focus()
    .insertContentAt(range, `<sup class="citation-reference">[${nextCitationNumber.value}]</sup>`)
    .run()

  nextCitationNumber.value += 1
  appendReference(url)
}

// References exists because citations exist: the first one brings the section
// (always last), and every citation writes its entry under it.
function appendReference(url) {
  const editor = getEditor()
  if (!editor) return

  let listPosition = findReferencesList(editor.state.doc)

  if (listPosition === null) {
    // Inserted as nodes rather than HTML: an empty ol would otherwise be
    // claimed by the ordinary list schema and dropped.
    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size, [
        {
          type: 'heading',
          attrs: { level: 2, outlineItemKey: `${activeOutlineId.value}:references` },
          content: [{ type: 'text', text: 'References' }],
        },
        { type: 'referencesList', attrs: { entries: [] } },
      ])
      .command(({ tr }) => {
        // The section arrives as a consequence of citing, not as writing.
        tr.setMeta('outlineInsertion', true)
        return true
      })
      .run()
    listPosition = findReferencesList(editor.state.doc)
  }

  if (listPosition === null) return

  const node = editor.state.doc.nodeAt(listPosition)
  const transaction = editor.state.tr.setNodeMarkup(listPosition, undefined, {
    entries: [...node.attrs.entries, { url }],
  })
  transaction.setMeta('outlineInsertion', true)
  editor.view.dispatch(transaction)
}

function onOpenCiteDiscover() {
  citeDialogInitialTab.value = 'discover'
  citeDialogOpen.value = true
}

// Adding a section hands the editor straight back to writing: the guidance
// steps aside and the caret waits at the first thing to fill in, so the
// keyboard comes up on the article rather than on top of the sheet.
async function onContentInserted() {
  isRailOpen.value = false
  isPopoverOpen.value = false
  await nextTick()
  placeCursorAtFirstField()
}

function placeCursorAtFirstField() {
  const editor = getEditor()
  if (!editor) return

  // Insertion leaves the caret at the start of the new section, so the first
  // field from there is the one this section is asking for.
  const caret = editor.state.selection.from
  const fields = findScaffoldFields(editor.state.doc)
  const field = fields.find((candidate) => candidate.from >= caret) ?? fields[0]

  // A caret, not a selection: arriving with text already selected reads as
  // something having been picked up, and brings grab handles with it.
  const chain = editor.chain().focus()
  if (field) chain.setTextSelection(field.from)
  chain.scrollIntoView().run()
}

// Neither sheet has a backdrop, so the article behind them stays tappable.
// Writing is the whole point, so they give way rather than sitting under the
// keyboard where they cannot be seen.
function onEditorFocused() {
  isPopoverOpen.value = false
  sourceContextOpen.value = false
}

// The panel never auto-opens: the toolbar + (and the editor's entry points)
// are the only doors. Location/variant changes just reset any open panel.
watch(effectiveOutlineLocation, () => {
  isRailOpen.value = false
  isPopoverOpen.value = false
})

watch(isToolbarOutlineVariant, () => {
  isRailOpen.value = false
  isPopoverOpen.value = false
})
</script>

<style scoped>
.editor-page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.editor-wrapper {
  display: flex;
  padding-top: 48px;
  height: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.editor-wrapper.rail-open {
  transform: translateX(calc(-100vw + 88px));
}

.editor-main {
  flex: 0 0 calc(100vw - 44px);
  display: flex;
  flex-direction: column;
}

.editor-wrapper--full-width .editor-main {
  flex-basis: 100vw;
}

.editor-rail-column {
  flex: 0 0 calc(100vw - 44px);
  display: flex;
  flex-direction: column;
}

.force-entry-point {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 2px solid var(--border-color-interactive);
  box-sizing: border-box;
  cursor: pointer;
  z-index: 2;
}

.force-entry-point :deep(.cdx-icon) {
  color: var(--color-base);
}
</style>
